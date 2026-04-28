import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, verifyPassword } from '@/lib/auth';

// Simple test API to verify auth is working
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 [TEST] Test endpoint called');

    // Test password hashing
    console.log('🧪 [TEST] Testing password hashing...');
    const testHash = await hashPassword('admin123');
    console.log('🧪 [TEST] Hash generated:', testHash.substring(0, 20) + '...');

    // Test password verification
    console.log('🧪 [TEST] Testing password verification...');
    const isValid = await verifyPassword('admin123', testHash);
    console.log('🧪 [TEST] Password verification result:', isValid);

    // Check if admin user exists
    console.log('🧪 [TEST] Checking admin user in DB...');
    const { db } = await import('@/lib/db');
    const admin = await db.db.user.findUnique({
      where: { email: 'admin@dpkpp.go.id' }
    });

    if (admin) {
      console.log('✅ [TEST] Admin user found');
      console.log('✅ [TEST] Email:', admin.email);
      console.log('✅ [TEST] Name:', admin.name);
      console.log('✅ [TEST] Role:', admin.role);
      console.log('✅ [TEST] isActive:', admin.isActive);
      console.log('✅ [TEST] Password hash (first 20 chars):', admin.password.substring(0, 20));

      // Test password verification
      const passwordMatch = await verifyPassword('admin123', admin.password);
      console.log('✅ [TEST] Password matches admin123:', passwordMatch);
    } else {
      console.log('❌ [TEST] Admin user NOT found');
    }

    return NextResponse.json({
      success: true,
      message: 'Auth test completed',
      adminExists: !!admin,
      passwordWorks: admin ? (await verifyPassword('admin123', admin.password)) : false
    });
  } catch (error) {
    console.error('❌ [TEST] Test endpoint error:', error);
    return NextResponse.json(
      { error: 'Test failed: ' + String(error) },
      { status: 500 }
    );
  }
}
