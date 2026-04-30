const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function fetchMembers() {
    const response = await fetch(`${API_URL}/api/members`);
    if (!response.ok) {
        throw new Error('Failed to fetch members');
    }
    return response.json();
}

export async function createMember(data: any) {
    const response = await fetch(`${API_URL}/api/members`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Failed to create member');
    }
    return response.json();
}

export async function fetchClasses(date?: string) {
    const url = date ? `${API_URL}/api/classes?date=${date}` : `${API_URL}/api/classes`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch classes');
    }
    return response.json();
}

export async function createClass(data: any) {
    const response = await fetch(`${API_URL}/api/classes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Failed to create class');
    }
    return response.json();
}

export async function fetchInstructors() {
    const response = await fetch(`${API_URL}/api/instructors`);
    if (!response.ok) {
        throw new Error('Failed to fetch instructors');
    }
    return response.json();
}

export async function createInstructor(data: any) {
    const response = await fetch(`${API_URL}/api/instructors`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Failed to create instructor');
    }
    return response.json();
}

export async function fetchReservations() {
    const response = await fetch(`${API_URL}/api/reservations`);
    if (!response.ok) {
        throw new Error('Failed to fetch reservations');
    }
    return response.json();
}

export async function createReservation(data: { memberId: string; classSessionId: string }) {
    const response = await fetch(`${API_URL}/api/reservations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create reservation');
    }
    return response.json();
}

export async function cancelReservation(id: string) {
    const response = await fetch(`${API_URL}/api/reservations/${id}/cancel`, {
        method: 'PATCH',
    });
    if (!response.ok) {
        throw new Error('Failed to cancel reservation');
    }
    return response.json();
}

export async function fetchDashboardStats() {
    const response = await fetch(`${API_URL}/api/dashboard/stats`);
    if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
    }
    return response.json();
}

export async function fetchRecentActivity() {
    const response = await fetch(`${API_URL}/api/dashboard/recent-activity`);
    if (!response.ok) {
        throw new Error('Failed to fetch recent activity');
    }
    return response.json();
}
