import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './lib/prisma';
import { requireAuth, requireRole } from './middleware/requireAuth';

import authRoutes from './routes/auth';
import memberRoutes from './routes/members';
import membershipRoutes from './routes/memberships';
import classRoutes from './routes/classes';
import instructorRoutes from './routes/instructors';
import instructorScheduleRoutes from './routes/instructor-schedules';
import instructorLeaveRoutes from './routes/instructor-leaves';
import reservationRoutes from './routes/reservations';
import dashboardRoutes from './routes/dashboard';
import notificationRoutes from './routes/notifications';
import assessmentRoutes from './routes/assessments';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Public
app.use('/api/auth', authRoutes);

// Admin-only (Phase 2 — every existing /api/* route now requires ADMIN)
const adminOnly = [requireAuth, requireRole('ADMIN')];
app.use('/api/members', adminOnly, memberRoutes);
app.use('/api/memberships', adminOnly, membershipRoutes);
app.use('/api/classes', adminOnly, classRoutes);
app.use('/api/instructors', adminOnly, instructorRoutes);
app.use('/api/instructor-schedules', adminOnly, instructorScheduleRoutes);
app.use('/api/instructor-leaves', adminOnly, instructorLeaveRoutes);
app.use('/api/reservations', adminOnly, reservationRoutes);
app.use('/api/dashboard', adminOnly, dashboardRoutes);
app.use('/api/notifications', adminOnly, notificationRoutes);
app.use('/api/assessments', adminOnly, assessmentRoutes);

app.get('/', (req, res) => {
    res.send('Pilates System API is running');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
