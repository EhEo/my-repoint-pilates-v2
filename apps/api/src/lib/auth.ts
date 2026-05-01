import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Role } from '@prisma/client';

export interface JwtPayload {
    sub: string;
    email: string;
    role: Role;
}

const JWT_SECRET: string = process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me';
const JWT_EXPIRES_IN: SignOptions['expiresIn'] =
    (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) || '7d';

if (!process.env.JWT_SECRET) {
    // Loud warning rather than silent fallback — surfaces missing env in dev/CI
    console.warn(
        '[auth] JWT_SECRET is not set. Falling back to insecure default. Set JWT_SECRET in .env.'
    );
}

export async function hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
}

export function signToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
