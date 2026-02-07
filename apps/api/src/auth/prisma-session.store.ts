import type { SessionData } from 'express-session';
import { Store } from 'express-session';
import type { PrismaClient } from '../generated/prisma/client';

export class PrismaSessionStore extends Store {
  constructor(private readonly prisma: PrismaClient) {
    super();
  }

  get(
    sid: string,
    callback: (err: unknown, session?: SessionData | null) => void,
  ) {
    this.prisma.session
      .findUnique({
        where: { sid },
        select: { userId: true, expiresAt: true },
      })
      .then((row) => {
        if (!row) return callback(null, null);
        if (row.expiresAt < new Date()) {
          void this.destroy(sid);
          return callback(null, null);
        }
        const session = {
          passport: { user: row.userId },
          cookie: {
            path: '/',
            httpOnly: true,
            maxAge: Number(process.env.SESSION_MAX_AGE_MS),
            expires: row.expiresAt,
            originalMaxAge: Number(process.env.SESSION_MAX_AGE_MS),
            secure: false,
            sameSite: 'lax' as const,
          },
        } as SessionData;
        callback(null, session);
      })
      .catch(callback);
  }

  set(sid: string, session: SessionData, callback?: (err?: unknown) => void) {
    const userId = (session as { passport?: { user?: string } }).passport?.user;
    const expires =
      session.cookie?.expires ??
      new Date(Date.now() + Number(process.env.SESSION_MAX_AGE_MS));
    if (!userId) return callback?.();

    this.prisma.session
      .upsert({
        where: { sid },
        create: {
          sid,
          userId,
          expiresAt: expires instanceof Date ? expires : new Date(expires),
        },
        update: {
          userId,
          expiresAt: expires instanceof Date ? expires : new Date(expires),
        },
      })
      .then(() => callback?.())
      .catch((err) => callback?.(err));
  }

  destroy(sid: string, callback?: (err?: unknown) => void) {
    this.prisma.session
      .deleteMany({ where: { sid } })
      .then(() => callback?.())
      .catch((err) => callback?.(err));
  }
}
