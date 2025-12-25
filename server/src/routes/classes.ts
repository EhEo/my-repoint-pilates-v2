import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// Get all class sessions
router.get('/', async (req, res) => {
    try {
        const { date } = req.query;
        const where = date ? {
            date: {
                gte: new Date(`${date}T00:00:00.000Z`),
                lt: new Date(`${date}T23:59:59.999Z`)
            }
        } : {};

        const classes = await prisma.classSession.findMany({
            where,
            include: { instructor: true },
            orderBy: { startTime: 'asc' }
        });
        res.json(classes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch classes' });
    }
});

// Create class session
router.post('/', async (req, res) => {
    try {
        const { title, instructorId, date, startTime, endTime, capacity, type, level, room } = req.body;
        const classSession = await prisma.classSession.create({
            data: {
                title,
                instructorId,
                date: new Date(date), // Expecting YYYY-MM-DD or standard date string
                startTime,
                endTime,
                capacity,
                type,
                level,
                room
            }
        });
        res.json(classSession);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create class session' });
    }
});

export default router;
