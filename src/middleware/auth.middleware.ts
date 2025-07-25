import {Request, Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'

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

export function requireOwner(req, res, next) {
    const user = (req as any).user;
    if (!user || user.role !== 'owner') {
        return res.status(403).send('Owner access required');
    }
    next();
}
