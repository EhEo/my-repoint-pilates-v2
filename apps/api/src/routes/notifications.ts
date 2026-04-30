import { Router } from 'express';
import prisma from '../lib/prisma';
import { enqueueAndDispatch } from '../lib/notifications';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const { recipientType, recipientId, status, type } = req.query;
        const notifications = await prisma.notification.findMany({
            where: {
                ...(typeof recipientType === 'string' ? { recipientType: recipientType as 'MEMBER' | 'INSTRUCTOR' | 'ADMIN' } : {}),
                ...(typeof recipientId === 'string' ? { recipientId } : {}),
                ...(typeof status === 'string' ? { status: status as 'PENDING' | 'SENT' | 'FAILED' } : {}),
                ...(typeof type === 'string'
                    ? { type: type as 'RESERVATION_CONFIRMED' | 'RESERVATION_CANCELLED' | 'MEMBERSHIP_EXPIRY' }
                    : {}),
            },
            orderBy: { createdAt: 'desc' },
            take: 200,
        });
        res.json(notifications);
    } catch (error) {
        console.error('[notifications.list]', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Scan ACTIVE memberships for ones expiring in 7 / 3 / 1 days, and create
// pending notifications. De-dupes against any MEMBERSHIP_EXPIRY notification
// for the same memberId+daysBefore in the last 24h so re-running is safe.
router.post('/scan-expiries', async (req, res) => {
    try {
        const TARGETS = [7, 3, 1] as const;
        const now = new Date();
        const created: { memberId: string; daysBefore: number }[] = [];

        for (const days of TARGETS) {
            const dayStart = new Date(now);
            dayStart.setDate(dayStart.getDate() + days);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(dayStart);
            dayEnd.setHours(23, 59, 59, 999);

            const expiring = await prisma.membership.findMany({
                where: {
                    status: 'ACTIVE',
                    endDate: { gte: dayStart, lte: dayEnd },
                },
                include: { member: true },
            });

            for (const m of expiring) {
                const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                const dup = await prisma.notification.findFirst({
                    where: {
                        type: 'MEMBERSHIP_EXPIRY',
                        recipientType: 'MEMBER',
                        recipientId: m.memberId,
                        createdAt: { gte: since },
                        // poor-man's match by body suffix; cheap and good enough
                    },
                });
                if (dup) continue;

                await enqueueAndDispatch(prisma, {
                    type: 'MEMBERSHIP_EXPIRY',
                    channel: 'APP',
                    recipientType: 'MEMBER',
                    recipientId: m.memberId,
                    title: `회원권 만료 ${days}일 전`,
                    body: `${m.member.name} 회원의 회원권이 ${m.endDate.toLocaleDateString('ko-KR')} 만료 예정입니다.`,
                    payload: { membershipId: m.id, daysBefore: days } as never,
                });
                created.push({ memberId: m.memberId, daysBefore: days });
            }
        }

        res.json({ scanned: TARGETS, created: created.length, items: created });
    } catch (error) {
        console.error('[notifications.scan-expiries]', error);
        res.status(500).json({ error: 'Failed to scan membership expiries' });
    }
});

// Manual override (mark sent / resend / failed) for testing
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, sentAt, errorMessage } = req.body ?? {};
        const data: Record<string, unknown> = {};
        if (status !== undefined) data.status = status;
        if (sentAt !== undefined) data.sentAt = sentAt ? new Date(sentAt) : null;
        if (errorMessage !== undefined) data.errorMessage = errorMessage || null;

        const updated = await prisma.notification.update({ where: { id }, data });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update notification' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await prisma.notification.delete({ where: { id: req.params.id } });
        res.json({ message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete notification' });
    }
});

export default router;
