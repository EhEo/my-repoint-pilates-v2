import type { ClassSession } from '../types';

export const MOCK_CLASSES: ClassSession[] = [
    {
        id: '1',
        title: 'Morning Reformer',
        instructorId: 'i1',
        instructorName: 'Lee Pilates',
        date: '2023-12-25',
        startTime: '09:00',
        endTime: '09:50',
        capacity: 6,
        enrolled: 4,
        type: 'groups',
        level: 'beginner',
        room: 'Room A'
    },
    {
        id: '2',
        title: 'Lunch Express',
        instructorId: 'i2',
        instructorName: 'Sarah Kim',
        date: '2023-12-25',
        startTime: '12:00',
        endTime: '12:50',
        capacity: 8,
        enrolled: 8,
        type: 'groups',
        level: 'all',
        room: 'Room B'
    },
    {
        id: '3',
        title: 'Advanced Chair',
        instructorId: 'i1',
        instructorName: 'Lee Pilates',
        date: '2023-12-25',
        startTime: '18:00',
        endTime: '18:50',
        capacity: 4,
        enrolled: 2,
        type: 'groups',
        level: 'advanced',
        room: 'Room C'
    },
    {
        id: '4',
        title: 'Private Session',
        instructorId: 'i3',
        instructorName: 'Mike Park',
        date: '2023-12-25',
        startTime: '10:00',
        endTime: '10:50',
        capacity: 1,
        enrolled: 1,
        type: 'private',
        level: 'all',
        room: 'Private 1'
    },
    // Next day
    {
        id: '5',
        title: 'Morning Reformer',
        instructorId: 'i1',
        instructorName: 'Lee Pilates',
        date: '2023-12-26',
        startTime: '09:00',
        endTime: '09:50',
        capacity: 6,
        enrolled: 5,
        type: 'groups',
        level: 'beginner',
        room: 'Room A'
    }
];
