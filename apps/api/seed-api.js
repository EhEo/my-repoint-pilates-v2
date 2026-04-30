// Native fetch in Node 18+

const API_URL = 'http://127.0.0.1:3000/api';

async function seed() {
    console.log('Seeding via API...');

    try {
        // 1. Create Instructor
        const instructorRes = await fetch(`${API_URL}/instructors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Sarah Connor',
                email: 'sarah@pilates.com',
                specialties: ['Reformer', 'Cadillac'],
                status: 'active' // Lowercase as per my types/schema confusion, but API handles it? Let's check API.
            })
        });
        const instructor = await instructorRes.json();
        console.log('Created Instructor:', instructor);

        // 2. Create Member
        const memberRes = await fetch(`${API_URL}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Alice Johnson',
                email: 'alice@example.com',
                phone: '010-1234-5678',
                status: 'ACTIVE',
                membershipType: 'GROUPS',
                totalSessions: 10
            })
        });
        const member = await memberRes.json();
        console.log('Created Member:', member);

        // 3. Create Class
        const today = new Date();
        const apiDate = today.toISOString().split('T')[0]; // YYYY-MM-DD

        const classRes = await fetch(`${API_URL}/classes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: 'Morning Reformer',
                instructorId: instructor.id,
                date: apiDate,
                startTime: '09:00',
                endTime: '09:50',
                capacity: 8,
                type: 'GROUPS',
                level: 'BEGINNER', // Uppercase check
                room: 'Room A'
            })
        });
        const classSession = await classRes.json();
        console.log('Created Class:', classSession);

        // 4. Create Reservation
        const reservationRes = await fetch(`${API_URL}/reservations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                memberId: member.id,
                classSessionId: classSession.id
            })
        });
        const reservation = await reservationRes.json();
        console.log('Created Reservation:', reservation);

    } catch (error) {
        console.error('Seeding failed:', error);
    }
}

seed();
