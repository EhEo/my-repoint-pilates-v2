import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// Get all instructors
router.get('/', async (req, res) => {
    try {
        const instructors = await prisma.instructor.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(instructors);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch instructors' });
    }
});

// Create instructor
router.post('/', async (req, res) => {
    try {
        const { name, email, specialties, status } = req.body;
        const instructor = await prisma.instructor.create({
            data: {
                name,
                email,
                specialties,
                status
            }
        });
        res.json(instructor);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create instructor' });
    }
});

export default router;
