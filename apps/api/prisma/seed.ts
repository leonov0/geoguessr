import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { hash } from 'bcrypt';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const defaultUsers = [
  { email: 'player1@example.com', username: 'Player1', password: 'player123' },
  { email: 'player2@example.com', username: 'Player2', password: 'player456' },
];

async function main() {
  console.log('🌱 Starting database seeding...');

  for (const user of defaultUsers) {
    const passwordHash = await hash(user.password, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      create: { email: user.email, username: user.username, passwordHash },
      update: { username: user.username, passwordHash },
    });
  }

  console.log('🌱 Seeding complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed: ', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
