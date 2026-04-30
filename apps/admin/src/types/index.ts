export type MembershipType = 'groups' | 'private' | 'duet';
export type MemberStatus = 'active' | 'inactive' | 'paused';

export interface Member {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    status: MemberStatus;
    membershipType: MembershipType;
    remainingSessions: number;
    totalSessions: number;
    joinDate: string;
    lastVisit: string;
    nextReservation?: string;
    notes?: string;
}

export interface Instructor {
    id: string;
    name: string;
    email: string;
    specialties: string[];
    avatar?: string;
    status: 'active' | 'inactive' | 'leave';
}

export type ClassLevel = 'beginner' | 'intermediate' | 'advanced' | 'all';

export interface ClassSession {
    id: string;
    title: string;
    instructorId: string;
    instructorName: string;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    capacity: number;
    enrolled: number;
    type: MembershipType;
    level: ClassLevel;
    room: string;
}

export type ReservationStatus = 'CONFIRMED' | 'CANCELLED' | 'WAITLIST' | 'confirmed' | 'cancelled' | 'waitlist';

export interface Reservation {
    id: string;
    memberId: string;
    classId: string;
    classSession: ClassSession; // Embedded for easier display
    status: ReservationStatus;
    timestamp: string;
}
