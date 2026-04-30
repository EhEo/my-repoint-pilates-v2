import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

function validatePayload(body: {
    dayOfWeek?: unknown;
    startTime?: unknown;
    endTime?: unknown;
}): string | null {
    if (typeof body.dayOfWeek !== 'number' || body.dayOfWeek < 0 || body.dayOfWeek > 6) {
        return 'dayOfWeek must be an integer 0..6 (0=Sun..6=Sat)';
    }
    if (typeof body.startTime !== 'string' || !HHMM.test(body.startTime)) {
        return 'startTime must be "HH:mm"';
    }
    if (typeof body.endTime !== 'string' || !HHMM.test(body.endTime)) {
        return 'endTime must be "HH:mm"';
    }
    if (body.startTime >= body.endTime) {
        return 'startTime must be before endTime';
    }
    return null;
}

router.get('/', async (req, res) => {
    try {
        const { instructorId } = req.query;
        const schedules = await prisma.instructorSchedule.findMany({
            where: typeof instructorId === 'string' ? { instructorId } : {},
            orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
            include: { instructor: { select: { id: true, name: true } } },
        });
        res.json(schedules);
    } catch (error) {
        console.error('[instructor-schedules.list]', error);
        res.status(500).json({ error: 'Failed to fetch schedules' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { instructorId, dayOfWeek, startTime, endTime } = req.body ?? {};
        if (!instructorId) {
            return res.status(400).json({ error: 'instructorId is required' });
        }
        const validationError = validatePayload({ dayOfWeek, startTime, endTime });
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        const created = await prisma.instructorSchedule.create({
            data: { instructorId, dayOfWeek, startTime, endTime },
        });
        res.json(created);
    } catch (error) {
        console.error('[instructor-schedules.create]', error);
        res.status(500).json({ error: 'Failed to create schedule' });
    }
});

router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { dayOfWeek, startTime, endTime } = req.body ?? {};

        // Re-validate against the merged result (existing + patch) so partial
        // updates can't produce an invalid record.
        const existing = await prisma.instructorSchedule.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ error: 'Schedule not found' });

        const merged = {
            dayOfWeek: dayOfWeek ?? existing.dayOfWeek,
            startTime: startTime ?? existing.startTime,
            endTime: endTime ?? existing.endTime,
        };
        const validationError = validatePayload(merged);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        const updated = await prisma.instructorSchedule.update({
            where: { id },
            data: merged,
        });
        res.json(updated);
    } catch (error) {
        console.error('[instructor-schedules.update]', error);
        res.status(500).json({ error: 'Failed to update schedule' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await prisma.instructorSchedule.delete({ where: { id: req.params.id } });
        res.json({ message: 'Schedule deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete schedule' });
    }
});

export default router;
