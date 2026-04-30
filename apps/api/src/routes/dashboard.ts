import { Router } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

const router = Router();

type ReservationWithRelations = Prisma.ReservationGetPayload<{
    include: { member: true; classSession: true };
}>;

router.get('/stats', async (req, res) => {
    try {
        const totalMembers = await prisma.member.count({
            where: { status: 'ACTIVE' }
        });

        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const classesToday = await prisma.classSession.count({
            where: {
                date: { gte: startOfDay, lte: endOfDay }
            }
        });

        // Mock revenue: sum of remainingCount across active memberships * a flat
        // unit price. Replaced by the Payment table in Phase 4.
        const activeMemberships = await prisma.membership.findMany({
            where: { status: 'ACTIVE' },
            select: { totalCount: true },
        });
        const SESSION_UNIT_PRICE = 50_000; // KRW, mock
        const revenue =
            activeMemberships.reduce((acc: number, m: { totalCount: number }) => acc + m.totalCount, 0) *
            SESSION_UNIT_PRICE;

        const activeReservations = await prisma.reservation.count({
            where: { status: 'WAITLIST' }
        });

        res.json({
            totalMembers,
            classesToday,
            revenue,
            pendingRequests: activeReservations
        });
    } catch (error) {
        console.error('[dashboard/stats]', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

router.get('/recent-activity', async (req, res) => {
    try {
        const recentReservations = await prisma.reservation.findMany({
            take: 5,
            orderBy: { timestamp: 'desc' },
            include: { member: true, classSession: true }
        });

        const activity = recentReservations.map((r: ReservationWithRelations) => ({
            id: r.id,
            user: r.member.name,
            action: r.status === 'CONFIRMED' ? 'booked a class' : 'cancelled a reservation',
            target: r.classSession.title,
            time: 'Just now'
        }));

        res.json(activity);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch recent activity' });
    }
});

export default router;
