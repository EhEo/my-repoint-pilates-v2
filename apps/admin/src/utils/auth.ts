const TOKEN_KEY = 'repoint.token';
const USER_KEY = 'repoint.user';

export interface AuthUser {
    id: string;
    email: string;
    role: 'ADMIN' | 'INSTRUCTOR' | 'MEMBER';
}

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as AuthUser;
    } catch {
        return null;
    }
}

export function setSession(token: string, user: AuthUser): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
    return !!getToken();
}
