import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding ...');

    // Upsert admin user from env (idempotent — safe to re-run)
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword) {
        throw new Error(
            'ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env to seed the admin user.'
        );
    }
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: { password: passwordHash, role: 'ADMIN' },
        create: { email: adminEmail, password: passwordHash, role: 'ADMIN' },
    });
    console.log('Upserted admin user:', admin.email);

    // Clean up existing domain data (does NOT touch User table)
    await prisma.reservation.deleteMany();
    await prisma.classSession.deleteMany();
    await prisma.member.deleteMany();
    await prisma.instructor.deleteMany();

    // Create Instructor
    const instructor = await prisma.instructor.create({
        data: {
            name: 'Sarah Connor',
            email: 'sarah@pilates.com',
            specialties: ['Reformer', 'Cadillac'],
            status: 'active',
        },
    });

    console.log('Created instructor:', instructor.name);

    // Create Members
    const member1 = await prisma.member.create({
        data: {
            name: 'Alice Johnson',
            email: 'alice@example.com',
            phone: '010-1234-5678',
            status: 'ACTIVE',
            membershipType: 'GROUPS',
            totalSessions: 10,
            remainingSessions: 8,
        },
    });

    const member2 = await prisma.member.create({
        data: {
            name: 'Bob Smith',
            email: 'bob@example.com',
            phone: '010-9876-5432',
            status: 'ACTIVE',
            membershipType: 'PRIVATE',
            totalSessions: 20,
            remainingSessions: 15,
        },
    });

    console.log('Created members:', member1.name, member2.name);

    // Create Classes (Today and Tomorrow)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const class1 = await prisma.classSession.create({
        data: {
            title: 'Morning Reformer',
            instructorId: instructor.id,
            date: today,
            startTime: '09:00',
            endTime: '09:50',
            capacity: 8,
            enrolled: 1,
            type: 'GROUPS',
            level: 'BEGINNER',
            room: 'Room A',
        },
    });

    const class2 = await prisma.classSession.create({
        data: {
            title: 'Private Session',
            instructorId: instructor.id,
            date: tomorrow,
            startTime: '14:00',
            endTime: '15:00',
            capacity: 1,
            enrolled: 0,
            type: 'PRIVATE',
            level: 'ADVANCED',
            room: 'Room B',
        },
    });

    console.log('Created classes:', class1.title, class2.title);

    // Create Reservation
    await prisma.reservation.create({
        data: {
            memberId: member1.id,
            classSessionId: class1.id,
            status: 'CONFIRMED',
        },
    });

    console.log('Created reservation for', member1.name);

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
