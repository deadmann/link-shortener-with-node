import cors from 'cors';
import helmet from 'helmet';

const isDevelopment = process.env.NODE_ENV === 'development';

export const corsOptions = {
    origin: isDevelopment
        ? ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000']
        : process.env.ALLOWED_ORIGINS?.split(',') || false,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

export const helmetOptions = {
    crossOriginEmbedderPolicy: !isDevelopment,
    contentSecurityPolicy: isDevelopment ? false : {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
};