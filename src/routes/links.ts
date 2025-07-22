import express from 'express';
import { PrismaClient } from '@prisma/client';
import { CreateLinkRequest, CreateLinkResponse, LinkStats } from '../types';
import { validateUrl } from '../middleware/validation.js';

const apiRouter = express.Router();
const redirectRouter = express.Router();
const prisma = new PrismaClient();

// Generate random short code
const generateShortCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// API ROUTES (will be mounted at /api)
apiRouter.post('/shorten', validateUrl, async (req, res) => {
    try {
        const { originalUrl, customCode }: CreateLinkRequest = req.body;

        let shortCode = customCode || generateShortCode();

        if (customCode) {
            const existing = await prisma.link.findUnique({
                where: { shortCode: customCode }
            });
            if (existing) {
                return res.status(400).json({ error: 'Custom code already exists' });
            }
        }

        while (!customCode) {
            const existing = await prisma.link.findUnique({
                where: { shortCode }
            });
            if (!existing) break;
            shortCode = generateShortCode();
        }

        const link = await prisma.link.create({
            data: {
                originalUrl,
                shortCode
            }
        });

        const response: CreateLinkResponse = {
            id: link.id,
            originalUrl: link.originalUrl,
            shortCode: link.shortCode,
            shortUrl: `http://localhost:3000/${link.shortCode}`,
            clicks: link.clicks,
            createdAt: link.createdAt
        };

        res.status(201).json(response);
    } catch (error) {
        console.error('Error creating link:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

apiRouter.get('/links', async (req, res) => {
    try {
        const links = await prisma.link.findMany({
            orderBy: { createdAt: 'desc' }
        });

        const response: LinkStats[] = links.map(link => ({
            id: link.id,
            originalUrl: link.originalUrl,
            shortCode: link.shortCode,
            clicks: link.clicks,
            createdAt: link.createdAt,
            updatedAt: link.updatedAt
        }));

        res.json(response);
    } catch (error) {
        console.error('Error fetching links:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

apiRouter.get('/links/:shortCode/stats', async (req, res) => {
    try {
        const { shortCode } = req.params;

        const link = await prisma.link.findUnique({
            where: { shortCode }
        });

        if (!link) {
            return res.status(404).json({ error: 'Link not found' });
        }

        const stats: LinkStats = {
            id: link.id,
            originalUrl: link.originalUrl,
            shortCode: link.shortCode,
            clicks: link.clicks,
            createdAt: link.createdAt,
            updatedAt: link.updatedAt
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching link stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

apiRouter.delete('/links/:shortCode', async (req, res) => {
    try {
        const { shortCode } = req.params;

        const link = await prisma.link.findUnique({
            where: { shortCode }
        });

        if (!link) {
            return res.status(404).json({ error: 'Link not found' });
        }

        await prisma.link.delete({
            where: { shortCode }
        });

        res.json({ message: 'Link deleted successfully' });
    } catch (error) {
        console.error('Error deleting link:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// REDIRECT ROUTES (will be mounted at root)
redirectRouter.get('/:shortCode', async (req, res) => {
    try {
        const { shortCode } = req.params;

        const link = await prisma.link.findUnique({
            where: { shortCode }
        });

        if (!link) {
            return res.status(404).json({ error: 'Link not found' });
        }

        await prisma.link.update({
            where: { shortCode },
            data: { clicks: { increment: 1 } }
        });

        res.redirect(link.originalUrl);
    } catch (error) {
        console.error('Error redirecting:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Export both routers
export { apiRouter, redirectRouter };