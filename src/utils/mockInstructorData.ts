import type { Instructor } from '../types';

export const MOCK_INSTRUCTORS: Instructor[] = [
    {
        id: 'i1',
        name: 'Lee Pilates',
        specialties: ['Reformer', 'Chair'],
        email: 'lee@example.com',
        status: 'active'
    },
    {
        id: 'i2',
        name: 'Sarah Kim',
        specialties: ['Mat', 'Barrel'],
        email: 'sarah@example.com',
        status: 'active'
    },
    {
        id: 'i3',
        name: 'Mike Park',
        specialties: ['Cadillac', 'Rehab'],
        email: 'mike@example.com',
        status: 'leave'
    },
];

// Extending type for local usage if needed until type is updated,
// but better to update the type definition first.
