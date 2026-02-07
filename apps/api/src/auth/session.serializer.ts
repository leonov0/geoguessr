import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly authService: AuthService) {
    super();
  }

  serializeUser(user: { id: string }, done: (err: null, id: string) => void) {
    done(null, user.id);
  }

  async deserializeUser(
    userId: string,
    done: (
      err: Error | null,
      user: { id: string; email: string; username: string } | null,
    ) => void,
  ) {
    try {
      const user = await this.authService.findUserById(userId);
      done(null, user ?? null);
    } catch (err) {
      done(err as Error, null);
    }
  }
}
