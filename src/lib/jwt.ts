import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long'
);

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'OPERATOR';
}

export async function generateToken(payload: TokenPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(JWT_SECRET);

  return token;
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as TokenPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}
