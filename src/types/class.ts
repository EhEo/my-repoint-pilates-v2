export interface Instructor {
    id: string;
    name: string;
    specialties: string[];
    bio: string;
    image?: string;
}

export type ClassLevel = 'All Levels' | 'Beginner' | 'Intermediate' | 'Advanced';

export interface ClassSession {
    id: string;
    title: string;
    instructorId: string;
    date: string; // ISO Date String
    startTime: string; // HH:mm
    duration: number; // minutes
    capacity: number;
    enrolled: number;
    level: ClassLevel;
    type: 'Group' | 'Private' | 'Duet';
}
