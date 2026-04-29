import { db } from '../src/lib/db';
import { hashPassword } from '../src/lib/auth';
import bcrypt from 'bcryptjs';

async function resetAdminPassword() {
  try {
    console.log('🔍 Checking existing admin user...');
    const existingAdmin = await db.user.findUnique({
      where: { email: 'admin@dpkpp.go.id' }
    });

    if (existingAdmin) {
      console.log('📝 Found existing admin:', existingAdmin.email);
      console.log('📝 Current role:', existingAdmin.role);

      // Hash new password
      const hashedPassword = await hashPassword('admin123');

      // Update password
      const updated = await db.user.update({
        where: { email: 'admin@dpkpp.go.id' },
        data: {
          password: hashedPassword,
          isActive: true,
          role: 'ADMIN'
        }
      });

      console.log('✅ Admin password updated successfully!');
      console.log('Email:', updated.email);
      console.log('Name:', updated.name);
      console.log('Role:', updated.role);
      console.log('New Password: admin123');
    } else {
      console.log('❌ Admin user not found, creating new one...');

      const hashedPassword = await hashPassword('admin123');

      const admin = await db.user.create({
        data: {
          email: 'admin@dpkpp.go.id',
          name: 'Admin DPKPP',
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true
        }
      });

      console.log('✅ Admin user created successfully!');
      console.log('Email:', admin.email);
      console.log('Name:', admin.name);
      console.log('Role:', admin.role);
      console.log('Password: admin123');
    }
  } catch (error) {
    console.error('❌ Error updating admin password:', error);
  }
}

resetAdminPassword();
