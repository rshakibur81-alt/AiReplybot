import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // DELETE any existing admin with this email
  await prisma.user.deleteMany({
    where: { email: 'admin@replymind.com' },
  });
  console.log('🗑️  Deleted existing admin account (if any)');

  // Hash the password with saltRounds 10
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash('Admin@123456', saltRounds);

  // Create new admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@replymind.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'ADMIN',
      plan: 'FREE',
      emailVerified: true,
    },
  });

  // Create subscription record for the admin
  await prisma.subscription.create({
    data: {
      userId: admin.id,
      planType: 'free',
      status: 'active',
      messagesLimit: 100,
      messagesUsed: 0,
    },
  });

  console.log('✅ New admin account created:');
  console.log('   Email:    admin@replymind.com');
  console.log('   Password: Admin@123456');
  console.log('   Role:     ADMIN');
  console.log('   Plan:     FREE');
  console.log('');
  console.log('⚠️  CHANGE THESE DEFAULT CREDENTIALS IN PRODUCTION!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });