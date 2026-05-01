import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const members = await prisma.member.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                memberships: {
                    where: { status: 'ACTIVE' },
                    orderBy: { endDate: 'asc' },
                    take: 1,
                },
            },
        });
        res.json(members);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch members' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const member = await prisma.member.findUnique({
            where: { id: req.params.id },
            include: {
                memberships: { orderBy: { createdAt: 'desc' } },
            },
        });
        if (!member) return res.status(404).json({ error: 'Member not found' });
        res.json(member);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch member' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, email, phone, status, notes } = req.body;
        const member = await prisma.member.create({
            data: { name, email, phone, status, notes },
        });
        res.json(member);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create member' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, status, notes, avatar, lastVisit } = req.body;
        const member = await prisma.member.update({
            where: { id },
            data: { name, email, phone, status, notes, avatar, lastVisit },
        });
        res.json(member);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update member' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await prisma.member.delete({ where: { id: req.params.id } });
        res.json({ message: 'Member deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete member' });
    }
});

export default router;
