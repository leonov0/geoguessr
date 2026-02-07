import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import session from 'express-session';
import passport from 'passport';
import { PrismaService } from './prisma/prisma.service';
import { PrismaSessionStore } from './auth/prisma-session.store';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: { origin: true, credentials: true },
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }
  const sessionSecret = process.env.SESSION_SECRET;
  const sessionMaxAgeMs = Number(process.env.SESSION_MAX_AGE_MS);
  const prisma = app.get(PrismaService);
  app.use(
    session({
      store: new PrismaSessionStore(prisma),
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: sessionMaxAgeMs,
        sameSite: 'lax',
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(3001);
}
void bootstrap();
