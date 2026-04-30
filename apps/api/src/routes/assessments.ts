import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

function computeBmi(heightCm: number | null | undefined, weightKg: number | null | undefined): number | null {
    if (typeof heightCm !== 'number' || typeof weightKg !== 'number') return null;
    if (heightCm <= 0 || weightKg <= 0) return null;
    const m = heightCm / 100;
    return Number((weightKg / (m * m)).toFixed(1));
}

router.get('/', async (req, res) => {
    try {
        const { memberId } = req.query;
        const assessments = await prisma.assessment.findMany({
            where: typeof memberId === 'string' ? { memberId } : {},
            orderBy: { date: 'asc' },
            include: { member: { select: { id: true, name: true } } },
        });
        res.json(assessments);
    } catch (error) {
        console.error('[assessments.list]', error);
        res.status(500).json({ error: 'Failed to fetch assessments' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const a = await prisma.assessment.findUnique({
            where: { id: req.params.id },
            include: { member: { select: { id: true, name: true } } },
        });
        if (!a) return res.status(404).json({ error: 'Assessment not found' });
        res.json(a);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch assessment' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { memberId, date, heightCm, weightKg, bodyFatPct, muscleMassKg, notes } = req.body ?? {};
        if (!memberId) return res.status(400).json({ error: 'memberId is required' });

        const created = await prisma.assessment.create({
            data: {
                memberId,
                date: date ? new Date(date) : new Date(),
                heightCm: numOrNull(heightCm),
                weightKg: numOrNull(weightKg),
                bmi: computeBmi(numOrNull(heightCm), numOrNull(weightKg)),
                bodyFatPct: numOrNull(bodyFatPct),
                muscleMassKg: numOrNull(muscleMassKg),
                notes: notes ?? null,
            },
        });
        res.json(created);
    } catch (error) {
        console.error('[assessments.create]', error);
        res.status(500).json({ error: 'Failed to create assessment' });
    }
});

router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma.assessment.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ error: 'Assessment not found' });

        const { date, heightCm, weightKg, bodyFatPct, muscleMassKg, notes } = req.body ?? {};
        const merged = {
            heightCm: heightCm !== undefined ? numOrNull(heightCm) : existing.heightCm,
            weightKg: weightKg !== undefined ? numOrNull(weightKg) : existing.weightKg,
        };

        const data: Record<string, unknown> = {};
        if (date !== undefined) data.date = new Date(date);
        if (heightCm !== undefined) data.heightCm = merged.heightCm;
        if (weightKg !== undefined) data.weightKg = merged.weightKg;
        if (heightCm !== undefined || weightKg !== undefined) {
            data.bmi = computeBmi(merged.heightCm, merged.weightKg);
        }
        if (bodyFatPct !== undefined) data.bodyFatPct = numOrNull(bodyFatPct);
        if (muscleMassKg !== undefined) data.muscleMassKg = numOrNull(muscleMassKg);
        if (notes !== undefined) data.notes = notes ?? null;

        const updated = await prisma.assessment.update({ where: { id }, data });
        res.json(updated);
    } catch (error) {
        console.error('[assessments.update]', error);
        res.status(500).json({ error: 'Failed to update assessment' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await prisma.assessment.delete({ where: { id: req.params.id } });
        res.json({ message: 'Assessment deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete assessment' });
    }
});

function numOrNull(v: unknown): number | null {
    if (v === null || v === undefined || v === '') return null;
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : null;
}

export default router;
