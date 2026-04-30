import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const reservations = await prisma.reservation.findMany({
            include: { member: true, classSession: true },
            orderBy: { timestamp: 'desc' }
        });
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reservations' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { memberId, classSessionId } = req.body;
        if (!memberId || !classSessionId) {
            return res.status(400).json({ error: 'memberId and classSessionId are required' });
        }

        const reservation = await prisma.$transaction(async (tx) => {
            const classSession = await tx.classSession.findUnique({
                where: { id: classSessionId },
            });
            if (!classSession) {
                throw new HttpError(404, 'Class session not found');
            }
            if (classSession.enrolled >= classSession.capacity) {
                throw new HttpError(400, 'Class is at full capacity');
            }

            const existing = await tx.reservation.findFirst({
                where: { memberId, classSessionId, status: 'CONFIRMED' },
            });
            if (existing) {
                throw new HttpError(400, 'Member already reserved for this class');
            }

            // Member must hold an unexpired ACTIVE 회원권 with remaining count
            const now = new Date();
            const membership = await tx.membership.findFirst({
                where: {
                    memberId,
                    status: 'ACTIVE',
                    endDate: { gte: now },
                    remainingCount: { gt: 0 },
                },
                orderBy: { endDate: 'asc' },
            });
            if (!membership) {
                throw new HttpError(400, 'No active membership with remaining sessions');
            }

            const created = await tx.reservation.create({
                data: { memberId, classSessionId, status: 'CONFIRMED' },
                include: { member: true, classSession: true },
            });

            await tx.classSession.update({
                where: { id: classSessionId },
                data: { enrolled: { increment: 1 } },
            });

            await tx.membership.update({
                where: { id: membership.id },
                data: { remainingCount: { decrement: 1 } },
            });

            return created;
        });

        return res.json(reservation);
    } catch (error) {
        if (error instanceof HttpError) {
            return res.status(error.status).json({ error: error.message });
        }
        console.error('[reservations.create]', error);
        return res.status(500).json({ error: 'Failed to create reservation' });
    }
});

router.patch('/:id/cancel', async (req, res) => {
    try {
        const { id } = req.params;

        const updated = await prisma.$transaction(async (tx) => {
            const reservation = await tx.reservation.findUnique({ where: { id } });
            if (!reservation) {
                throw new HttpError(404, 'Reservation not found');
            }
            if (reservation.status === 'CANCELLED') {
                return reservation; // idempotent
            }

            const cancelled = await tx.reservation.update({
                where: { id },
                data: { status: 'CANCELLED' },
            });

            await tx.classSession.update({
                where: { id: reservation.classSessionId },
                data: { enrolled: { decrement: 1 } },
            });

            // Restore the most recently used active membership for this member
            const membership = await tx.membership.findFirst({
                where: { memberId: reservation.memberId, status: 'ACTIVE' },
                orderBy: { endDate: 'asc' },
            });
            if (membership) {
                await tx.membership.update({
                    where: { id: membership.id },
                    data: { remainingCount: { increment: 1 } },
                });
            }

            return cancelled;
        });

        return res.json(updated);
    } catch (error) {
        if (error instanceof HttpError) {
            return res.status(error.status).json({ error: error.message });
        }
        console.error('[reservations.cancel]', error);
        return res.status(500).json({ error: 'Failed to cancel reservation' });
    }
});

class HttpError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

export default router;
