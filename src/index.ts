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

import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import { apiRouter, redirectRouter } from './routes/links.js';
import { corsOptions, helmetOptions } from './config/middleware.js';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet(helmetOptions));
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for simple frontend
app.use(express.static('public'));

// Mount API routes at /api
app.use('/api', apiRouter);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Mount redirect routes at root (this should come after other specific routes)
app.use('/', redirectRouter);

// Handle 404
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Global error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

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