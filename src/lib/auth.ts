import { db } from '@/lib/db';
import { User, ActivityLog, LogAction } from '@prisma/client';
import { cookies, headers } from 'next/headers';
import bcrypt from 'bcryptjs';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'OPERATOR';
}

const SESSION_COOKIE_NAME = 'dpkpp_session';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function login(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return { user: null, error: 'Email atau password salah' };
    }

    if (!user.isActive) {
      return { user: null, error: 'Akun tidak aktif' };
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return { user: null, error: 'Email atau password salah' };
    }

    // Log login activity
    await logActivity(user.id, LogAction.LOGIN, null, null, null, null);

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8 // 8 hours
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as 'ADMIN' | 'OPERATOR'
      },
      error: null
    };
  } catch (error) {
    console.error('Login error:', error);
    return { user: null, error: 'Terjadi kesalahan saat login' };
  }
}

export async function getSession(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionId) {
      return null;
    }

    const user = await db.user.findUnique({
      where: { id: sessionId }
    });

    if (!user || !user.isActive) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'ADMIN' | 'OPERATOR'
    };
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
}

export async function logout(): Promise<void> {
  const session = await getSession();
  if (session) {
    await logActivity(session.id, LogAction.LOGOUT, null, null, null, null);
  }

  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getSession();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();

  if (user.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required');
  }

  return user;
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
