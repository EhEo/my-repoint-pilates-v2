import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const { memberId, status } = req.query;
        const memberships = await prisma.membership.findMany({
            where: {
                ...(typeof memberId === 'string' ? { memberId } : {}),
                ...(typeof status === 'string' ? { status: status as 'ACTIVE' | 'EXPIRED' | 'CANCELLED' } : {}),
            },
            include: { member: true },
            orderBy: [{ status: 'asc' }, { endDate: 'asc' }],
        });
        res.json(memberships);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch memberships' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const membership = await prisma.membership.findUnique({
            where: { id: req.params.id },
            include: { member: true },
        });
        if (!membership) return res.status(404).json({ error: 'Membership not found' });
        res.json(membership);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch membership' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { memberId, totalCount, endDate, startDate } = req.body;
        if (!memberId || typeof totalCount !== 'number' || !endDate) {
            return res
                .status(400)
                .json({ error: 'memberId, totalCount, endDate are required' });
        }

        // Single-active-membership policy: cancel any previous ACTIVE membership
        // before creating a new one. Past EXPIRED/CANCELLED records remain.
        const membership = await prisma.$transaction(async (tx) => {
            await tx.membership.updateMany({
                where: { memberId, status: 'ACTIVE' },
                data: { status: 'CANCELLED' },
            });
            return tx.membership.create({
                data: {
                    memberId,
                    totalCount,
                    remainingCount: totalCount,
                    startDate: startDate ? new Date(startDate) : new Date(),
                    endDate: new Date(endDate),
                    status: 'ACTIVE',
                },
                include: { member: true },
            });
        });

        res.json(membership);
    } catch (error) {
        console.error('[memberships.create]', error);
        res.status(500).json({ error: 'Failed to create membership' });
    }
});

// Editable fields (manual, by admin):
//   endDate, totalCount, remainingCount, status (Phase 3)
//   paid, paidAt, refundedAt, paymentNote (Phase 4 mini — flag-only payment)
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            endDate,
            totalCount,
            remainingCount,
            status,
            paid,
            paidAt,
            refundedAt,
            paymentNote,
        } = req.body;
        const data: Record<string, unknown> = {};
        if (endDate !== undefined) data.endDate = new Date(endDate);
        if (typeof totalCount === 'number') data.totalCount = totalCount;
        if (typeof remainingCount === 'number') data.remainingCount = remainingCount;
        if (status !== undefined) data.status = status;
        if (typeof paid === 'boolean') data.paid = paid;
        if (paidAt !== undefined) data.paidAt = paidAt ? new Date(paidAt) : null;
        if (refundedAt !== undefined) data.refundedAt = refundedAt ? new Date(refundedAt) : null;
        if (paymentNote !== undefined) data.paymentNote = paymentNote || null;

        const updated = await prisma.membership.update({
            where: { id },
            data,
            include: { member: true },
        });
        res.json(updated);
    } catch (error) {
        console.error('[memberships.update]', error);
        res.status(500).json({ error: 'Failed to update membership' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await prisma.membership.delete({ where: { id: req.params.id } });
        res.json({ message: 'Membership deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete membership' });
    }
});

export default router;
