import { Router } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { SESSION_UNIT_PRICE } from '../lib/pricing';

const router = Router();

type ReservationWithRelations = Prisma.ReservationGetPayload<{
    include: { member: true; classSession: true };
}>;

type Granularity = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

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

        // Mock revenue: total sessions across active memberships × unit price.
        // Replaced by the Payment table when introduced.
        const activeMemberships = await prisma.membership.findMany({
            where: { status: 'ACTIVE' },
            select: { totalCount: true },
        });
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

// Time-bucketed revenue series. Cash-flow view:
//   - paidAt → +amount in that bucket (gross)
//   - refundedAt → +amount in that bucket (refunds; subtracted from net)
// `amount` here is mock (totalCount × SESSION_UNIT_PRICE) until a Payment
// model is introduced.
router.get('/revenue', async (req, res) => {
    try {
        const granularity = parseGranularity(req.query.granularity);
        const { from, to } = resolveRange(granularity, req.query.from, req.query.to);

        const memberships = await prisma.membership.findMany({
            where: {
                OR: [
                    { paidAt: { gte: from, lte: to } },
                    { refundedAt: { gte: from, lte: to } },
                ],
            },
            select: { paidAt: true, refundedAt: true, totalCount: true },
        });

        const buckets = new Map<string, { gross: number; refunds: number }>();

        for (const m of memberships) {
            const amount = m.totalCount * SESSION_UNIT_PRICE;
            if (m.paidAt && m.paidAt >= from && m.paidAt <= to) {
                const key = bucketKey(m.paidAt, granularity);
                const entry = buckets.get(key) ?? { gross: 0, refunds: 0 };
                entry.gross += amount;
                buckets.set(key, entry);
            }
            if (m.refundedAt && m.refundedAt >= from && m.refundedAt <= to) {
                const key = bucketKey(m.refundedAt, granularity);
                const entry = buckets.get(key) ?? { gross: 0, refunds: 0 };
                entry.refunds += amount;
                buckets.set(key, entry);
            }
        }

        // Fill in zero-buckets so the chart x-axis is continuous
        const series: { bucket: string; label: string; gross: number; refunds: number; net: number }[] = [];
        let cursor = bucketStart(from, granularity);
        const end = bucketStart(to, granularity);
        while (cursor <= end) {
            const key = bucketKey(cursor, granularity);
            const entry = buckets.get(key) ?? { gross: 0, refunds: 0 };
            series.push({
                bucket: key,
                label: bucketLabel(cursor, granularity),
                gross: entry.gross,
                refunds: entry.refunds,
                net: entry.gross - entry.refunds,
            });
            cursor = nextBucket(cursor, granularity);
        }

        res.json({
            granularity,
            from: from.toISOString(),
            to: to.toISOString(),
            unitPrice: SESSION_UNIT_PRICE,
            series,
        });
    } catch (error) {
        console.error('[dashboard/revenue]', error);
        res.status(500).json({ error: 'Failed to fetch revenue series' });
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

// ── bucketing helpers ─────────────────────────────────────────────────────

function parseGranularity(raw: unknown): Granularity {
    const value = String(raw ?? '').toUpperCase();
    return value === 'DAY' || value === 'WEEK' || value === 'YEAR' ? value : 'MONTH';
}

function resolveRange(g: Granularity, fromQ: unknown, toQ: unknown): { from: Date; to: Date } {
    const to = typeof toQ === 'string' ? new Date(toQ) : new Date();
    if (typeof fromQ === 'string') {
        return { from: new Date(fromQ), to };
    }
    const from = new Date(to);
    switch (g) {
        case 'DAY':
            from.setDate(from.getDate() - 29); // last 30 days inclusive
            break;
        case 'WEEK':
            from.setDate(from.getDate() - 7 * 11); // last 12 weeks
            break;
        case 'YEAR':
            from.setFullYear(from.getFullYear() - 4); // last 5 years
            break;
        case 'MONTH':
        default:
            from.setMonth(from.getMonth() - 11); // last 12 months
            break;
    }
    return { from: bucketStart(from, g), to };
}

function bucketStart(d: Date, g: Granularity): Date {
    const x = new Date(d);
    switch (g) {
        case 'DAY':
            x.setHours(0, 0, 0, 0);
            return x;
        case 'WEEK': {
            x.setHours(0, 0, 0, 0);
            // Monday-based week (ISO). Sunday=0, so back up to previous Monday.
            const day = x.getDay();
            const diff = day === 0 ? -6 : 1 - day;
            x.setDate(x.getDate() + diff);
            return x;
        }
        case 'MONTH':
            return new Date(x.getFullYear(), x.getMonth(), 1);
        case 'YEAR':
            return new Date(x.getFullYear(), 0, 1);
    }
}

function nextBucket(d: Date, g: Granularity): Date {
    const x = new Date(d);
    switch (g) {
        case 'DAY':
            x.setDate(x.getDate() + 1);
            return x;
        case 'WEEK':
            x.setDate(x.getDate() + 7);
            return x;
        case 'MONTH':
            x.setMonth(x.getMonth() + 1);
            return x;
        case 'YEAR':
            x.setFullYear(x.getFullYear() + 1);
            return x;
    }
}

function bucketKey(d: Date, g: Granularity): string {
    const start = bucketStart(d, g);
    const yyyy = start.getFullYear();
    const mm = String(start.getMonth() + 1).padStart(2, '0');
    const dd = String(start.getDate()).padStart(2, '0');
    switch (g) {
        case 'DAY':
        case 'WEEK':
            return `${yyyy}-${mm}-${dd}`;
        case 'MONTH':
            return `${yyyy}-${mm}`;
        case 'YEAR':
            return `${yyyy}`;
    }
}

function bucketLabel(d: Date, g: Granularity): string {
    const start = bucketStart(d, g);
    const mm = String(start.getMonth() + 1).padStart(2, '0');
    const dd = String(start.getDate()).padStart(2, '0');
    switch (g) {
        case 'DAY':
        case 'WEEK':
            return `${mm}/${dd}`;
        case 'MONTH':
            return `${start.getFullYear()}/${mm}`;
        case 'YEAR':
            return `${start.getFullYear()}`;
    }
}

export default router;
