import { Router } from 'express';
import prisma from '../lib/prisma';
import { enqueueAndDispatch } from '../lib/notifications';

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

        // Phase 5C — fire notifications outside the transaction so a stub
        // failure can't roll back the booking. enqueueAndDispatch swallows
        // adapter errors and records them on the row.
        const cs = reservation.classSession;
        const dateStr = new Date(cs.date).toLocaleDateString('ko-KR');
        await enqueueAndDispatch(prisma, {
            type: 'RESERVATION_CONFIRMED',
            channel: 'APP',
            recipientType: 'MEMBER',
            recipientId: reservation.memberId,
            title: '예약이 확정되었습니다',
            body: `${dateStr} ${cs.startTime} ${cs.title} 예약이 완료되었습니다.`,
            payload: { reservationId: reservation.id, classSessionId: cs.id } as never,
        });
        await enqueueAndDispatch(prisma, {
            type: 'RESERVATION_CONFIRMED',
            channel: 'APP',
            recipientType: 'INSTRUCTOR',
            recipientId: cs.instructorId,
            title: '신규 예약',
            body: `${dateStr} ${cs.startTime} ${cs.title} 에 ${reservation.member.name} 회원이 예약했습니다.`,
            payload: { reservationId: reservation.id, classSessionId: cs.id } as never,
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

        const { wasAlreadyCancelled } = await prisma.$transaction(async (tx) => {
            const reservation = await tx.reservation.findUnique({ where: { id } });
            if (!reservation) {
                throw new HttpError(404, 'Reservation not found');
            }
            if (reservation.status === 'CANCELLED') {
                return { wasAlreadyCancelled: true as const };
            }

            await tx.reservation.update({
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

            return { wasAlreadyCancelled: false as const };
        });

        const fresh = await prisma.reservation.findUnique({
            where: { id },
            include: { member: true, classSession: true },
        });
        if (!fresh) {
            return res.status(404).json({ error: 'Reservation not found after cancel' });
        }

        // Notify the instructor only on the first cancellation (idempotent re-cancel
        // skips the notification).
        if (!wasAlreadyCancelled) {
            const cs = fresh.classSession;
            const dateStr = new Date(cs.date).toLocaleDateString('ko-KR');
            await enqueueAndDispatch(prisma, {
                type: 'RESERVATION_CANCELLED',
                channel: 'APP',
                recipientType: 'INSTRUCTOR',
                recipientId: cs.instructorId,
                title: '예약 취소',
                body: `${dateStr} ${cs.startTime} ${cs.title} 의 ${fresh.member.name} 회원 예약이 취소되었습니다.`,
                payload: { reservationId: fresh.id, classSessionId: cs.id } as never,
            });
        }

        return res.json(fresh);
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
