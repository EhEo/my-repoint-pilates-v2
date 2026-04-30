import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import { PrismaClient } from '@prisma/client'; // Not needed
import prisma from './lib/prisma';

import memberRoutes from './routes/members';
import classRoutes from './routes/classes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/members', memberRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/instructors', require('./routes/instructors').default);
app.use('/api/reservations', require('./routes/reservations').default);
app.use('/api/dashboard', require('./routes/dashboard').default);

app.get('/', (req, res) => {
    res.send('Pilates System API is running');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Handle generic cleanup
process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
