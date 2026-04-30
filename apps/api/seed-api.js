// Native fetch in Node 18+
// Seeds via the running API. Requires the API to be up and ADMIN_EMAIL/ADMIN_PASSWORD set.

require('dotenv').config();

const API_URL = 'http://127.0.0.1:3000/api';

async function login() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) {
        throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env to seed via API.');
    }

    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Login failed (${res.status}): ${body}`);
    }
    const { token } = await res.json();
    return token;
}

async function authedJson(method, path, token, body) {
    const res = await fetch(`${API_URL}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`${method} ${path} failed (${res.status}): ${text}`);
    }
    return res.json();
}

async function seed() {
    console.log('Seeding via API...');
    const token = await login();
    console.log('Logged in as admin.');

    const instructor = await authedJson('POST', '/instructors', token, {
        name: 'Sarah Connor',
        email: 'sarah@pilates.com',
        specialties: ['Reformer', 'Cadillac'],
        status: 'active'
    });
    console.log('Created Instructor:', instructor);

    const member = await authedJson('POST', '/members', token, {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        phone: '010-1234-5678',
        status: 'ACTIVE',
        membershipType: 'GROUPS',
        totalSessions: 10
    });
    console.log('Created Member:', member);

    const apiDate = new Date().toISOString().split('T')[0];
    const classSession = await authedJson('POST', '/classes', token, {
        title: 'Morning Reformer',
        instructorId: instructor.id,
        date: apiDate,
        startTime: '09:00',
        endTime: '09:50',
        capacity: 8,
        type: 'GROUPS',
        level: 'BEGINNER',
        room: 'Room A'
    });
    console.log('Created Class:', classSession);

    const reservation = await authedJson('POST', '/reservations', token, {
        memberId: member.id,
        classSessionId: classSession.id
    });
    console.log('Created Reservation:', reservation);
}

seed().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
