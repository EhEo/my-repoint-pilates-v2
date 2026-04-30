import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// Get all reservations
router.get('/', async (req, res) => {
    try {
        const reservations = await prisma.reservation.findMany({
            include: {
                member: true,
                classSession: true
            },
            orderBy: { timestamp: 'desc' }
        });
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reservations' });
    }
});

// Create reservation
router.post('/', async (req, res) => {
    try {
        const { memberId, classSessionId } = req.body;

        // Basic validation: Check if class exists and has capacity (simplified)
        const classSession = await prisma.classSession.findUnique({
            where: { id: classSessionId }
        });

        if (!classSession) {
            return res.status(404).json({ error: 'Class session not found' });
        }

        // Check if already reserved
        const existing = await prisma.reservation.findFirst({
            where: {
                memberId,
                classSessionId,
                status: 'CONFIRMED'
            }
        });

        if (existing) {
            return res.status(400).json({ error: 'Member already reserved for this class' });
        }

        const reservation = await prisma.reservation.create({
            data: {
                memberId,
                classSessionId,
                status: 'CONFIRMED'
            },
            include: {
                member: true,
                classSession: true
            }
        });

        // Update enrolled count
        await prisma.classSession.update({
            where: { id: classSessionId },
            data: { enrolled: { increment: 1 } }
        });

        // Update member remaining sessions (optional logic)
        await prisma.member.update({
            where: { id: memberId },
            data: { remainingSessions: { decrement: 1 } }
        });

        res.json(reservation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create reservation' });
    }
});

// Cancel reservation matches
router.patch('/:id/cancel', async (req, res) => {
    try {
        const { id } = req.params;

        // Get reservation to find classSessionId and memberId
        const reservation = await prisma.reservation.findUnique({
            where: { id }
        });

        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }

        if (reservation.status === 'CANCELLED') {
            return res.json(reservation); // Already cancelled
        }

        const updated = await prisma.reservation.update({
            where: { id },
            data: { status: 'CANCELLED' }
        });

        // Decrement enrolled count
        await prisma.classSession.update({
            where: { id: reservation.classSessionId },
            data: { enrolled: { decrement: 1 } }
        });

        // Restore member remaining sessions
        await prisma.member.update({
            where: { id: reservation.memberId },
            data: { remainingSessions: { increment: 1 } }
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to cancel reservation' });
    }
});

export default router;
