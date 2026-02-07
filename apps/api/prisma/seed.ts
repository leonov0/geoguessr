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

const locations = [
  { imageUrl: 'https://picsum.photos/800/600?seed=geo1', x: 548, y: 330 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo2', x: 310, y: 362 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo3', x: 512, y: 323 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo4', x: 879, y: 381 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo5', x: 541, y: 369 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo6', x: 502, y: 363 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo7', x: 537, y: 319 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo8', x: 577, y: 307 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo9', x: 826, y: 369 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo10', x: 912, y: 553 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo11', x: 275, y: 395 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo12', x: 364, y: 527 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo13', x: 555, y: 374 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo14', x: 530, y: 304 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo15', x: 521, y: 323 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo16', x: 540, y: 328 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo17', x: 546, y: 320 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo18', x: 621, y: 427 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo19', x: 815, y: 458 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo20', x: 832, y: 413 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo21', x: 349, y: 553 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo22', x: 294, y: 509 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo23', x: 578, y: 390 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo24', x: 570, y: 530 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo25', x: 570, y: 368 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo26', x: 535, y: 307 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo27', x: 531, y: 302 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo28', x: 506, y: 316 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo29', x: 520, y: 368 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo30', x: 530, y: 346 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo31', x: 505, y: 371 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo32', x: 537, y: 325 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo33', x: 544, y: 333 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo34', x: 557, y: 346 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo35', x: 580, y: 389 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo36', x: 598, y: 390 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo37', x: 572, y: 369 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo38', x: 580, y: 381 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo39', x: 610, y: 424 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo40', x: 617, y: 427 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo41', x: 580, y: 462 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo42', x: 517, y: 443 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo43', x: 570, y: 512 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo44', x: 800, y: 411 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo45', x: 810, y: 405 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo46', x: 808, y: 448 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo47', x: 830, y: 416 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo48', x: 808, y: 441 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo49', x: 900, y: 556 },
  { imageUrl: 'https://picsum.photos/800/600?seed=geo50', x: 917, y: 575 },
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

  const existingLocations = await prisma.location.count();
  if (existingLocations === 0) {
    await prisma.location.createMany({ data: locations });
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
