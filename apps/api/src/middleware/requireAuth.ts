import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { JwtPayload, verifyToken } from '../lib/auth';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const header = req.header('authorization') || req.header('Authorization');
    if (!header || !header.toLowerCase().startsWith('bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = header.slice(7).trim();
    try {
        const payload = verifyToken(token);
        req.user = payload;
        return next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

export function requireRole(...allowed: Role[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        if (!allowed.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        return next();
    };
}
