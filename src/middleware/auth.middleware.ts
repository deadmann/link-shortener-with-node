import {Request, Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken'
import {PrismaClient} from "@prisma/client";
import { COOKIE_NAME, JWT_SECRET } from '../config/constants.js'

const prisma = new PrismaClient();

export async function attachCurrentUser(req: Request, res: Response, next: NextFunction) {
    (req as any).user = null;
    res.locals.currentUser = null;

    const token = req.cookies[COOKIE_NAME];
    if (!token) {
        return next()
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
            const user = await prisma.user.findUnique({ where: { id: decoded.id } });
            if (user) {
                (req as any).user = user
                res.locals.currentUser = user
            }
        } catch (err) {
            console.warn('Invalid token:', (err as Error).message);
        }
    }

    next()
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.token
    if (!token){
        return res.status(401).json({ error: 'Unauthorized' })
    }

    try{
        const payload = jwt.verify(token, JWT_SECRET) as any
        (req as any).user = payload
        next()
    } catch {
        return res.status(403).json({ error: 'Invalid token' })
    }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
    const user = (req as any).user;
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
        return res.status(403).json({ error: 'Admin access only' })
    }
    next()
}

export function requireOwner(req: Request, res: Response, next: NextFunction) {
    const user = (req as any).user;
    if (!user || user.role !== 'owner') {
        return res.status(403).send('Owner access required');
    }
    next();
}
