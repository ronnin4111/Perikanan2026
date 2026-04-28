import { db } from '../src/lib/db';
import { hashPassword } from '../src/lib/auth';

async function seedAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await db.user.findUnique({
      where: { email: 'admin@dpkpp.go.id' }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('Email:', existingAdmin.email);
      console.log('Name:', existingAdmin.name);
      console.log('Role:', existingAdmin.role);
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword('admin123');

    // Create admin user
    const admin = await db.user.create({
      data: {
        email: 'admin@dpkpp.go.id',
        name: 'Admin DPKPP',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Name:', admin.name);
    console.log('Role:', admin.role);
    console.log('Password: admin123');
    console.log('');
    console.log('⚠️  Please change the password after first login!');
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
  }
}

seedAdmin();
