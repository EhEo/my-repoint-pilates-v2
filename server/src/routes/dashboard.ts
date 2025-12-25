import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

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
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        });

        // Calculate revenue (Mock calculation based on membership types for now)
        // In a real app, this would come from a Payment/Transaction table
        const members = await prisma.member.findMany({ select: { membershipType: true } });
        const revenue = members.reduce((acc, curr) => {
            if (curr.membershipType === 'PRIVATE') return acc + 100;
            if (curr.membershipType === 'DUET') return acc + 70;
            return acc + 30; // GROUPS
        }, 0) * 1000; // Mock currency multiplier

        const activeReservations = await prisma.reservation.count({
            where: { status: 'WAITLIST' } // Treating waitlist as pending requests for this context
        });

        res.json({
            totalMembers,
            classesToday,
            revenue,
            pendingRequests: activeReservations
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

router.get('/recent-activity', async (req, res) => {
    try {
        // Fetch recent reservations as activity
        const recentReservations = await prisma.reservation.findMany({
            take: 5,
            orderBy: { timestamp: 'desc' },
            include: { member: true, classSession: true }
        });

        const activity = recentReservations.map(r => ({
            id: r.id,
            user: r.member.name,
            action: r.status === 'CONFIRMED' ? 'booked a class' : 'cancelled a reservation',
            target: r.classSession.title,
            time: 'Just now' // Simplified time
        }));

        res.json(activity);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch recent activity' });
    }
});

export default router;
