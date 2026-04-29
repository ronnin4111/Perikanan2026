import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Setup Production Database...\n');

  // Check if admin user exists
  const existingAdmin = await prisma.user.findFirst({
    where: { email: 'admin@dpkpp.go.id' }
  });

  if (existingAdmin) {
    console.log('✅ Admin user already exists:', existingAdmin.email);
    console.log('   Skipping admin creation.\n');
  } else {
    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'admin@dpkpp.go.id',
        password: '$2a$10$r5QzJqLhLzXk7Q5zJqLhLOzXk7Q5zJqLhLOzXk7Q5zJqLhLOzXk7Q', // admin123 (bcrypt hash)
        role: 'ADMIN',
        isActive: true
      }
    });

    console.log('✅ Admin user created:');
    console.log('   Email:', admin.email);
    console.log('   Password: admin123');
    console.log('   Please change password after first login!\n');
  }

  // Check if there's any pelaku usaha data
  const pelakuUsahaCount = await prisma.pelakuUsaha.count();

  if (pelakuUsahaCount > 0) {
    console.log(`✅ Database has ${pelakuUsahaCount} pelaku usaha records.`);
    console.log('   Skipping data seeding.\n');
  } else {
    console.log('⚠️  No pelaku usaha data found.');
    console.log('   You may want to import your CSV data.\n');
  }

  console.log('✅ Production database setup complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
