import type { Reservation } from '../types';
import { MOCK_CLASSES } from './mockClassData';

// Helper to create mock reservations
const createMockReservation = (
    id: string,
    classId: string,
    status: 'confirmed' | 'cancelled' | 'waitlist',
    dateOffset: number = 0
): Reservation => {
    const classSession = MOCK_CLASSES.find(c => c.id === classId) || MOCK_CLASSES[0];

    return {
        id,
        memberId: '1', // Assuming current user is member 1
        classId,
        classSession,
        status,
        timestamp: new Date(Date.now() + dateOffset * 86400000).toISOString()
    };
};

export const MOCK_RESERVATIONS: Reservation[] = [
    createMockReservation('r1', '1', 'confirmed', 2), // Upcoming
    createMockReservation('r2', '3', 'waitlist', 5),  // Upcoming Waitlist
    createMockReservation('r3', '2', 'confirmed', -1), // Past
    createMockReservation('r4', '4', 'cancelled', -3), // Cancelled
];
