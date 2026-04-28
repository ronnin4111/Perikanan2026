import { db } from '@/lib/db';
import { User, ActivityLog, LogAction } from '@prisma/client';
import { headers } from 'next/headers';
import bcrypt from 'bcryptjs';
import { generateToken, verifyToken, TokenPayload } from '@/lib/jwt';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'OPERATOR';
  token?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function login(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    console.log('🔐 [LOGIN] Attempting login...');
    console.log('🔐 [LOGIN] Email input:', email);
    console.log('🔐 [LOGIN] Password input length:', password.length);

    const emailToSearch = email.toLowerCase();
    console.log('🔐 [LOGIN] Email to search:', emailToSearch);

    const user = await db.user.findUnique({
      where: { email: emailToSearch }
    });

    console.log('🔐 [LOGIN] User found in DB:', !!user);

    if (!user) {
      console.log('❌ [LOGIN] User not found in database');
      return { user: null, error: 'Email atau password salah' };
    }

    console.log('🔐 [LOGIN] User email in DB:', user.email);
    console.log('🔐 [LOGIN] User is active:', user.isActive);

    if (!user.isActive) {
      console.log('❌ [LOGIN] User account is inactive');
      return { user: null, error: 'Akun tidak aktif' };
    }

    console.log('🔐 [LOGIN] Verifying password...');
    const isValid = await verifyPassword(password, user.password);
    console.log('🔐 [LOGIN] Password valid:', isValid);

    if (!isValid) {
      console.log('❌ [LOGIN] Password verification failed');
      return { user: null, error: 'Email atau password salah' };
    }

    // Log login activity
    const requestHeaders = await headers();
    const ipAddress = requestHeaders.get('x-forwarded-for')?.split(',')[0] ||
                      requestHeaders.get('x-real-ip') || undefined;

    await logActivity(user.id, LogAction.LOGIN, null, null, null, ipAddress);

    // Generate JWT token
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'ADMIN' | 'OPERATOR'
    });

    console.log('✅ [LOGIN] Login successful, token generated for user:', user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as 'ADMIN' | 'OPERATOR',
        token
      },
      error: null
    };
  } catch (error) {
    console.error('❌ [LOGIN] Login error:', error);
    return { user: null, error: 'Terjadi kesalahan saat login' };
  }
}

export async function getSession(token: string): Promise<AuthUser | null> {
  try {
    if (!token) {
      console.log('getSession - No token provided');
      return null;
    }

    console.log('getSession - Verifying token...');
    const payload = await verifyToken(token);

    if (!payload) {
      console.log('getSession - Token verification failed');
      return null;
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId }
    });

    if (!user || !user.isActive) {
      console.log('getSession - User not found or inactive');
      return null;
    }

    console.log('getSession - User found:', user.email);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'ADMIN' | 'OPERATOR',
      token
    };
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
}

export async function logout(): Promise<void> {
  // No server-side logout needed for JWT tokens
  // Token is simply removed from localStorage on client side
  console.log('Logout called');
}

export async function requireAuth(): Promise<AuthUser> {
  // For JWT tokens, this function needs to be called with token
  // This is a no-op as we handle auth in API routes
  console.log('requireAuth called (no-op for JWT)');
  return { id: '', email: '', name: '', role: 'ADMIN' };
}

export async function requireAdmin(): Promise<AuthUser> {
  // For JWT tokens, this is handled in API routes
  console.log('requireAdmin called (no-op for JWT)');
  return { id: '', email: '', name: '', role: 'ADMIN' };
}

export async function logActivity(
  userId: string,
  action: LogAction,
  entity: string | null,
  entityType: string | null,
  oldValues: string | null,
  newValues: string | null,
  ipAddress?: string
): Promise<ActivityLog> {
  try {
    return await db.activityLog.create({
      data: {
        userId,
        action,
        entity,
        entityType,
        oldValues,
        newValues,
        ipAddress
      }
    });
  } catch (error) {
    console.error('Log activity error:', error);
    throw error;
  }
}

export async function getUserIP(): Promise<string | undefined> {
  const requestHeaders = await headers();
  return requestHeaders.get('x-forwarded-for')?.split(',')[0] ||
         requestHeaders.get('x-real-ip') ||
         undefined;
}
