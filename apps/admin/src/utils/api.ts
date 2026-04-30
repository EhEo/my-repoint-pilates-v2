import { clearSession, getToken, setSession, type AuthUser } from './auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface RequestOptions {
    method?: string;
    body?: unknown;
    skipAuth?: boolean;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
    const headers: Record<string, string> = {};
    if (opts.body !== undefined) headers['Content-Type'] = 'application/json';

    if (!opts.skipAuth) {
        const token = getToken();
        if (token) headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${path}`, {
        method: opts.method ?? 'GET',
        headers,
        body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });

    if (response.status === 401 && !opts.skipAuth) {
        // Token rejected — wipe session and bounce to login
        clearSession();
        if (typeof window !== 'undefined' && !window.location.pathname.endsWith('/login')) {
            window.location.href = '/login';
        }
    }

    if (!response.ok) {
        let message = `${opts.method ?? 'GET'} ${path} failed (${response.status})`;
        try {
            const body = await response.json();
            if (body?.error) message = body.error;
        } catch {
            // ignore JSON parse failures
        }
        throw new Error(message);
    }

    return response.json() as Promise<T>;
}

// ── Auth ───────────────────────────────────────────────────────────────────
export interface LoginResponse {
    token: string;
    user: AuthUser;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
    const data = await request<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
        skipAuth: true,
    });
    setSession(data.token, data.user);
    return data;
}

export async function fetchMe(): Promise<AuthUser> {
    return request<AuthUser>('/api/auth/me');
}

// ── Members / Classes / Instructors / Reservations / Dashboard ─────────────
// Returns are intentionally `any` for now — call sites carry their own types.
// Phase 6 / packages/shared 도입 시 단일 타입으로 정리 예정.
/* eslint-disable @typescript-eslint/no-explicit-any */
export const fetchMembers = () => request<any[]>('/api/members');
export const createMember = (data: any) =>
    request<any>('/api/members', { method: 'POST', body: data });

// ── Memberships (Phase 3 — 횟수권) ─────────────────────────────────────────
export const fetchMemberships = (params?: { memberId?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.memberId) qs.set('memberId', params.memberId);
    if (params?.status) qs.set('status', params.status);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return request<any[]>(`/api/memberships${suffix}`);
};
export const createMembership = (data: {
    memberId: string;
    totalCount: number;
    endDate: string;
    startDate?: string;
}) => request<any>('/api/memberships', { method: 'POST', body: data });
export const updateMembership = (
    id: string,
    data: {
        endDate?: string;
        totalCount?: number;
        remainingCount?: number;
        status?: string;
        paid?: boolean;
        paidAt?: string | null;
        refundedAt?: string | null;
        paymentNote?: string | null;
    }
) => request<any>(`/api/memberships/${id}`, { method: 'PATCH', body: data });
export const deleteMembership = (id: string) =>
    request<any>(`/api/memberships/${id}`, { method: 'DELETE' });

export const fetchClasses = (date?: string) =>
    request<any[]>(date ? `/api/classes?date=${date}` : '/api/classes');
export const createClass = (data: any) =>
    request<any>('/api/classes', { method: 'POST', body: data });

export const fetchInstructors = () => request<any[]>('/api/instructors');
export const createInstructor = (data: any) =>
    request<any>('/api/instructors', { method: 'POST', body: data });

// ── Instructor schedules / leaves (Phase 5B) ──────────────────────────────
export const fetchInstructorSchedules = (instructorId?: string) =>
    request<any[]>(
        instructorId
            ? `/api/instructor-schedules?instructorId=${encodeURIComponent(instructorId)}`
            : '/api/instructor-schedules'
    );
export const createInstructorSchedule = (data: {
    instructorId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}) => request<any>('/api/instructor-schedules', { method: 'POST', body: data });
export const updateInstructorSchedule = (
    id: string,
    data: { dayOfWeek?: number; startTime?: string; endTime?: string }
) => request<any>(`/api/instructor-schedules/${id}`, { method: 'PATCH', body: data });
export const deleteInstructorSchedule = (id: string) =>
    request<any>(`/api/instructor-schedules/${id}`, { method: 'DELETE' });

export const fetchInstructorLeaves = (instructorId?: string) =>
    request<any[]>(
        instructorId
            ? `/api/instructor-leaves?instructorId=${encodeURIComponent(instructorId)}`
            : '/api/instructor-leaves'
    );
export const createInstructorLeave = (data: {
    instructorId: string;
    startDate: string;
    endDate: string;
    reason?: string;
}) => request<any>('/api/instructor-leaves', { method: 'POST', body: data });
export const updateInstructorLeave = (
    id: string,
    data: { startDate?: string; endDate?: string; reason?: string | null }
) => request<any>(`/api/instructor-leaves/${id}`, { method: 'PATCH', body: data });
export const deleteInstructorLeave = (id: string) =>
    request<any>(`/api/instructor-leaves/${id}`, { method: 'DELETE' });

export const fetchReservations = () => request<any[]>('/api/reservations');
export const createReservation = (data: { memberId: string; classSessionId: string }) =>
    request<any>('/api/reservations', { method: 'POST', body: data });
export const cancelReservation = (id: string) =>
    request<any>(`/api/reservations/${id}/cancel`, { method: 'PATCH' });

export const fetchDashboardStats = () => request<any>('/api/dashboard/stats');
export const fetchRecentActivity = () => request<any[]>('/api/dashboard/recent-activity');
/* eslint-enable @typescript-eslint/no-explicit-any */
