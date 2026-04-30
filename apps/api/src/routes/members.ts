import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// Get all members
router.get('/', async (req, res) => {
    try {
        const members = await prisma.member.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(members);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch members' });
    }
});

// Get single member
router.get('/:id', async (req, res) => {
    try {
        const member = await prisma.member.findUnique({
            where: { id: req.params.id }
        });
        if (!member) return res.status(404).json({ error: 'Member not found' });
        res.json(member);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch member' });
    }
});

// Create member
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, status, membershipType } = req.body;
        const member = await prisma.member.create({
            data: {
                name,
                email,
                phone,
                status,
                membershipType
            }
        });
        res.json(member);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create member' });
    }
});

// Update member
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const member = await prisma.member.update({
            where: { id },
            data: req.body
        });
        res.json(member);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update member' });
    }
});

// Delete member
router.delete('/:id', async (req, res) => {
    try {
        await prisma.member.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Member deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete member' });
    }
});

export default router;
