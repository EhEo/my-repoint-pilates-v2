import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const { instructorId, from, to } = req.query;
        const where: Record<string, unknown> = {};
        if (typeof instructorId === 'string') where.instructorId = instructorId;
        if (typeof from === 'string') {
            where.endDate = { gte: new Date(from) };
        }
        if (typeof to === 'string') {
            where.startDate = { ...(where.startDate as object), lte: new Date(to) };
        }
        const leaves = await prisma.instructorLeave.findMany({
            where,
            orderBy: [{ startDate: 'asc' }],
            include: { instructor: { select: { id: true, name: true } } },
        });
        res.json(leaves);
    } catch (error) {
        console.error('[instructor-leaves.list]', error);
        res.status(500).json({ error: 'Failed to fetch leaves' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { instructorId, startDate, endDate, reason } = req.body ?? {};
        if (!instructorId || !startDate || !endDate) {
            return res
                .status(400)
                .json({ error: 'instructorId, startDate, endDate are required' });
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            return res.status(400).json({ error: 'startDate / endDate must be valid dates' });
        }
        if (start > end) {
            return res.status(400).json({ error: 'startDate must be ≤ endDate' });
        }

        const created = await prisma.instructorLeave.create({
            data: {
                instructorId,
                startDate: start,
                endDate: end,
                reason: reason || null,
            },
        });
        res.json(created);
    } catch (error) {
        console.error('[instructor-leaves.create]', error);
        res.status(500).json({ error: 'Failed to create leave' });
    }
});

router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate, reason } = req.body ?? {};
        const data: Record<string, unknown> = {};
        if (startDate !== undefined) data.startDate = new Date(startDate);
        if (endDate !== undefined) data.endDate = new Date(endDate);
        if (reason !== undefined) data.reason = reason || null;

        if (
            data.startDate !== undefined &&
            data.endDate !== undefined &&
            (data.startDate as Date) > (data.endDate as Date)
        ) {
            return res.status(400).json({ error: 'startDate must be ≤ endDate' });
        }

        const updated = await prisma.instructorLeave.update({ where: { id }, data });
        res.json(updated);
    } catch (error) {
        console.error('[instructor-leaves.update]', error);
        res.status(500).json({ error: 'Failed to update leave' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await prisma.instructorLeave.delete({ where: { id: req.params.id } });
        res.json({ message: 'Leave deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete leave' });
    }
});

export default router;
