import { Router } from 'express';
import prisma from '../lib/prisma';
import { signToken, verifyPassword } from '../lib/auth';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body ?? {};
        if (!email || !password) {
            return res.status(400).json({ error: 'email and password are required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const ok = await verifyPassword(password, user.password);
        if (!ok) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = signToken({ sub: user.id, email: user.email, role: user.role });
        return res.json({
            token,
            user: { id: user.id, email: user.email, role: user.role },
        });
    } catch (error) {
        console.error('[auth/login]', error);
        return res.status(500).json({ error: 'Login failed' });
    }
});

router.get('/me', requireAuth, async (req, res) => {
    try {
        const userId = req.user!.sub;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, role: true, createdAt: true },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.json(user);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch user' });
    }
});

export default router;
