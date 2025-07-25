import express from 'express';

// // Patch Express’s Router methods to log the `path` argument
// const routerProto = express.Router.prototype;
// for (const method of ['get', 'post', 'put', 'delete', 'patch', 'use', 'all'] as const) {
//     const original = routerProto[method] as any;
//     routerProto[method] = function (path: any, ...handlers: any[]) {
//         console.log(`🚧 Express registering [${method.toUpperCase()}]:`, path);
//         return original.call(this, path, ...handlers);
//     };
// }

import path from 'path';
import { fileURLToPath } from 'url';

import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import cookieParser from 'cookie-parser';

import expressLayouts from 'express-ejs-layouts';

// Routes
import initRouter from './routes/init.js';
import { apiRouter, redirectRouter } from './routes/links.js';
import authRoutes from "./routes/auth.routes.js";

// Middlewares
import { corsOptions, helmetOptions } from './config/middleware.js';
import { requireAuth } from "./middleware/auth.middleware.js";
import { isInitialized } from './utils/init-check.js';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security middleware
app.use(helmet(helmetOptions));
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie & Session
app.use(cookieParser());

// EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// - EJS Layout
app.use(expressLayouts);
app.set('layout', 'layout');
// - ExpressLayout Default Title
app.use((req, res, next) => {
    res.locals.title = 'Link Shortener'; // default title
    next();
});

/** Our Top Level Routes -- Prevent from getting caught in the redirect route */
const RESERVED = new Set([
    'init',
    'api',
    'auth',
    'login',
    'logout',
    'assets',
    'public'
])
// 📌 GLOBAL GUARD: static + reserved + short‑code dispatch
app.use((req, res, next) => {
    // 1) remove leading slash, split off query
    const fullPath = req.path.replace(/^\/+/, '').split('?')[0]
    if (!fullPath) {
        // “/” → let it fall through (e.g. home page or init redirect)
        return next()
    }

    const [first] = fullPath.split('/')

    // 2) skip static-like requests: first segment contains a dot
    if (first.includes('.')) {
        return next()
    }

    // 3) skip reserved app routes
    if (RESERVED.has(first)) {
        return next()
    }

    // 4) otherwise, treat it as a short code
    //    (you might want to also regex-validate length/charset here)
    req.params.shortCode = first
    return redirectRouter(req, res, next)
})

// Initialize Page and redirect enforcement
app.use('/init', initRouter);
// - Initialization check (runs for ALL other routes)
app.use(async (req, res, next) => {
    const skipInit = req.path.startsWith('/init') || req.path.startsWith('/public');
    if (skipInit) return next();
    const initialized = await isInitialized();
    if (!initialized) return res.redirect('/init');
    next();
});

// Auth & Auth-check
app.use('/auth', authRoutes)
app.get('/auth/me', requireAuth, async (req, res) => {
    res.json({ user: (req as any).user });
});

// Main Page -- Safe to render now
app.get('/', async (req, res) => {
    const initialized = await isInitialized();
    if (!initialized) return res.redirect('/init');

    const setting = await prisma.setting.findFirst();
    if (!setting) return res.redirect('/init');
    if (setting.mode === 'private') return res.redirect('/login'); // TODO: Make optional
    res.render('home', { title: 'Welcome' });
});

// Mount API routes at /api
app.use('/api', apiRouter);
// app.use('/', redirectRouter); // On the top, we did it through the guard middleware, with reserved route check.

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Static files for simple frontend
app.use(express.static(path.join(__dirname, '../public')));

// Handle 404
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Global error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

if (!(await isInitialized())) {
    console.log('🛠 First-time setup required. Visit /init to configure.');
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});

export default app;