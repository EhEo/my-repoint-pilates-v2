// Phase 3: Member 의 legacy 회원권 컬럼은 Membership 테이블로 분리됨.
// 기존 'MembershipType' (groups/private/duet) 은 사실 수업 유형이라 ClassType 으로 rename.

export type ClassType = 'GROUPS' | 'PRIVATE' | 'DUET' | 'groups' | 'private' | 'duet';
export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'PAUSED' | 'active' | 'inactive' | 'paused';
export type MembershipStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface Member {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    status: MemberStatus;
    joinDate: string;
    lastVisit?: string | null;
    notes?: string;
    memberships?: Membership[]; // optional — included by /api/members
}

export interface Membership {
    id: string;
    memberId: string;
    member?: Member;
    totalCount: number;
    remainingCount: number;
    startDate: string;
    endDate: string;
    status: MembershipStatus;
    // Phase 4 (mini) — flag-only payment tracking, manually toggled by admin
    paid: boolean;
    paidAt?: string | null;
    refundedAt?: string | null;
    paymentNote?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Instructor {
    id: string;
    name: string;
    email: string;
    specialties: string[];
    avatar?: string;
    status: 'active' | 'inactive' | 'leave';
}

export interface InstructorSchedule {
    id: string;
    instructorId: string;
    instructor?: { id: string; name: string };
    dayOfWeek: number; // 0..6 (0=Sun)
    startTime: string; // HH:mm
    endTime: string;   // HH:mm
    createdAt: string;
    updatedAt: string;
}

export interface InstructorLeave {
    id: string;
    instructorId: string;
    instructor?: { id: string; name: string };
    startDate: string;
    endDate: string;
    reason?: string | null;
    createdAt: string;
    updatedAt: string;
}

export type NotificationType =
    | 'RESERVATION_CONFIRMED'
    | 'RESERVATION_CANCELLED'
    | 'MEMBERSHIP_EXPIRY';
export type NotificationChannel = 'APP' | 'SMS' | 'KAKAO' | 'EMAIL';
export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED';
export type RecipientType = 'MEMBER' | 'INSTRUCTOR' | 'ADMIN';

export interface Notification {
    id: string;
    type: NotificationType;
    channel: NotificationChannel;
    status: NotificationStatus;
    recipientType: RecipientType;
    recipientId: string;
    title: string;
    body: string;
    payload?: unknown;
    scheduledFor?: string | null;
    sentAt?: string | null;
    errorMessage?: string | null;
    createdAt: string;
    updatedAt: string;
}

export type ClassLevel = 'beginner' | 'intermediate' | 'advanced' | 'all' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL';

export interface ClassSession {
    id: string;
    title: string;
    instructorId: string;
    instructorName: string;
    date: string;
    startTime: string;
    endTime: string;
    capacity: number;
    enrolled: number;
    type: ClassType;
    level: ClassLevel;
    room: string;
}

export type ReservationStatus = 'CONFIRMED' | 'CANCELLED' | 'WAITLIST' | 'confirmed' | 'cancelled' | 'waitlist';

export interface Reservation {
    id: string;
    memberId: string;
    classId: string;
    classSession: ClassSession;
    status: ReservationStatus;
    timestamp: string;
}
