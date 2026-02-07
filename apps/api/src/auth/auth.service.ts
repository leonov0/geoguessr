import { Injectable, ConflictException } from '@nestjs/common';
import { hash, compare } from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(email: string, username: string, password: string) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      if (existing.email === email)
        throw new ConflictException('This email is already taken');
      throw new ConflictException('This username is already taken');
    }
    const passwordHash = await hash(password, 10);
    await this.prisma.user.create({
      data: { email, username, passwordHash },
    });
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, username: true, passwordHash: true },
    });
    if (!user || !(await compare(password, user.passwordHash))) return null;
    return this.findUserById(user.id);
  }

  async findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, username: true },
    });
  }
}
