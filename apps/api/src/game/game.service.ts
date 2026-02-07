import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Prisma } from '../generated/prisma/client';
import {
  computeDistance,
  computePoints,
  ROUNDS_PER_GAME,
  ROUND_TIME_SECONDS,
  MAP_WIDTH,
  MAP_HEIGHT,
} from '@leonov/shared';
import { randomBytes } from 'crypto';

@Injectable()
export class GameService {
  constructor(private readonly prisma: PrismaService) {}

  async startGame(userId: string) {
    const active = await this.prisma.game.findFirst({
      where: { userId, status: 'active' },
    });
    if (active) {
      await this.prisma.game.update({
        where: { id: active.id },
        data: { status: 'completed', completedAt: new Date() },
      });
    }

    const locations = await this.prisma.$queryRawUnsafe<{ id: string }[]>(
      `SELECT id FROM "Location" ORDER BY RANDOM() LIMIT ${ROUNDS_PER_GAME}`,
    );

    const game = await this.prisma.game.create({
      data: {
        userId,
        rounds: {
          create: locations.map((loc, i) => ({
            locationId: loc.id,
            roundIndex: i,
            ...(i === 0 ? { roundStartedAt: new Date() } : {}),
          })),
        },
      },
      include: {
        rounds: { include: { location: true }, orderBy: { roundIndex: 'asc' } },
      },
    });

    const firstRound = game.rounds[0];
    return {
      gameId: game.id,
      round: {
        roundIndex: firstRound.roundIndex,
        imageUrl: firstRound.location.imageUrl,
        startedAt: firstRound.roundStartedAt,
      },
    };
  }

  private isRoundExpired(round: { roundStartedAt: Date | null }): boolean {
    if (!round.roundStartedAt) return false;
    const elapsed =
      (Date.now() - new Date(round.roundStartedAt).getTime()) / 1000;
    return elapsed > ROUND_TIME_SECONDS;
  }

  private async autoExpireRound(round: { id: string }) {
    await this.prisma.gameRound.update({
      where: { id: round.id },
      data: {
        guessX: null,
        guessY: null,
        distance: computeDistance(0, 0, MAP_WIDTH, MAP_HEIGHT),
        points: 0,
        submittedAt: new Date(),
      },
    });
  }

  async getActiveGame(userId: string) {
    const game = await this.prisma.game.findFirst({
      where: { userId, status: 'active' },
      include: {
        rounds: {
          include: { location: true },
          orderBy: { roundIndex: 'asc' },
        },
      },
    });
    if (!game) return null;

    let current = game.rounds.find(
      (round) => round.submittedAt === null && round.roundStartedAt !== null,
    );

    if (current && this.isRoundExpired(current)) {
      await this.autoExpireRound(current);
      current = undefined;
    }

    if (!current) {
      const next = game.rounds.find(
        (round) => round.roundStartedAt === null && round.submittedAt === null,
      );
      if (!next) return null;

      await this.prisma.gameRound.update({
        where: { id: next.id },
        data: { roundStartedAt: new Date() },
      });

      return {
        gameId: game.id,
        round: {
          roundIndex: next.roundIndex,
          imageUrl: next.location.imageUrl,
          startedAt: new Date(),
        },
      };
    }

    return {
      gameId: game.id,
      round: {
        roundIndex: current.roundIndex,
        imageUrl: current.location.imageUrl,
        startedAt: current.roundStartedAt,
      },
    };
  }

  async getRound(gameId: string, userId: string) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: {
        rounds: { include: { location: true }, orderBy: { roundIndex: 'asc' } },
      },
    });
    if (!game) throw new NotFoundException();
    if (game.userId !== userId) throw new ForbiddenException();
    if (game.status !== 'active')
      throw new BadRequestException('Game is already completed');

    const current = game.rounds.find(
      (round) => round.submittedAt === null && round.roundStartedAt !== null,
    );
    if (!current) throw new BadRequestException('No active round');

    if (this.isRoundExpired(current)) {
      await this.autoExpireRound(current);
      return { timedOut: true, roundIndex: current.roundIndex };
    }

    return {
      roundIndex: current.roundIndex,
      imageUrl: current.location.imageUrl,
      startedAt: current.roundStartedAt,
    };
  }

  async submitGuess(
    gameId: string,
    userId: string,
    guessX: number,
    guessY: number,
  ) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: {
        rounds: { include: { location: true }, orderBy: { roundIndex: 'asc' } },
      },
    });
    if (!game) throw new NotFoundException();
    if (game.userId !== userId) throw new ForbiddenException();
    if (game.status !== 'active')
      throw new BadRequestException('Game is already completed');

    const round = game.rounds.find(
      (round) => round.submittedAt === null && round.roundStartedAt !== null,
    );
    if (!round) throw new BadRequestException('No active round');

    const timedOut = this.isRoundExpired(round);

    let distance: number;
    let points: number;
    if (timedOut) {
      distance = computeDistance(0, 0, MAP_WIDTH, MAP_HEIGHT);
      points = 0;
    } else {
      distance = computeDistance(
        guessX,
        guessY,
        round.location.x,
        round.location.y,
      );
      points = computePoints(distance);
    }

    await this.prisma.gameRound.update({
      where: { id: round.id },
      data: {
        guessX: timedOut ? null : guessX,
        guessY: timedOut ? null : guessY,
        distance,
        points,
        submittedAt: new Date(),
      },
    });

    const roundScores = game.rounds.map((r) => ({
      roundIndex: r.roundIndex,
      points: r.id === round.id ? points : r.points,
    }));

    return {
      timedOut,
      guessX: timedOut ? null : guessX,
      guessY: timedOut ? null : guessY,
      correctX: round.location.x,
      correctY: round.location.y,
      distance,
      points,
      roundScores,
      isLastRound: round.roundIndex === ROUNDS_PER_GAME - 1,
    };
  }

  async nextRound(gameId: string, userId: string) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: {
        rounds: { include: { location: true }, orderBy: { roundIndex: 'asc' } },
      },
    });
    if (!game) throw new NotFoundException();
    if (game.userId !== userId) throw new ForbiddenException();
    if (game.status !== 'active')
      throw new BadRequestException('Game is already completed');

    const activeRound = game.rounds.find(
      (round) => round.submittedAt === null && round.roundStartedAt !== null,
    );
    if (activeRound && this.isRoundExpired(activeRound)) {
      await this.autoExpireRound(activeRound);
      activeRound.submittedAt = new Date();
      activeRound.points = 0;
    }

    const allSubmitted = game.rounds.every(
      (round) => round.submittedAt !== null,
    );
    if (allSubmitted) {
      return this.finalizeGame(game);
    }

    const next = game.rounds.find((round) => round.roundStartedAt === null);
    if (!next) {
      return this.finalizeGame(game);
    }

    await this.prisma.gameRound.update({
      where: { id: next.id },
      data: { roundStartedAt: new Date() },
    });

    return {
      completed: false,
      round: {
        roundIndex: next.roundIndex,
        imageUrl: next.location.imageUrl,
        startedAt: new Date(),
      },
    };
  }

  private async finalizeGame(
    game: Prisma.GameGetPayload<{ include: { rounds: true } }>,
  ) {
    const totalScore = game.rounds.reduce((sum, r) => sum + (r.points ?? 0), 0);
    await this.prisma.game.update({
      where: { id: game.id },
      data: { status: 'completed', totalScore, completedAt: new Date() },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: game.userId },
    });
    if (user && (!user.bestScore || totalScore > user.bestScore)) {
      await this.prisma.user.update({
        where: { id: game.userId },
        data: { bestScore: totalScore, bestGameId: game.id },
      });
    }

    return { completed: true, gameId: game.id };
  }

  async getResult(gameId: string, userId?: string) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: {
        rounds: { orderBy: { roundIndex: 'asc' } },
        user: { select: { id: true, username: true, bestGameId: true } },
      },
    });
    if (!game) throw new NotFoundException();
    if (userId && game.userId !== userId) throw new ForbiddenException();

    const isPersonalBest = game.user.bestGameId === game.id;

    let leaderboardRank: number | null = null;
    const higherCount = await this.prisma.user.count({
      where: { bestScore: { gt: game.totalScore } },
    });
    const rank = higherCount + 1;
    if (rank <= 10) leaderboardRank = rank;

    return {
      gameId: game.id,
      username: game.user.username,
      totalScore: game.totalScore,
      completedAt: game.completedAt,
      isPersonalBest,
      leaderboardRank,
      rounds: game.rounds.map((r) => ({
        roundIndex: r.roundIndex,
        points: r.points ?? 0,
        distance: r.distance ?? 0,
        guessX: r.guessX,
        guessY: r.guessY,
      })),
    };
  }

  async getLeaderboard() {
    const users = await this.prisma.user.findMany({
      where: { bestScore: { gt: 0 } },
      orderBy: { bestScore: 'desc' },
      take: 10,
      select: { id: true, username: true, bestScore: true },
    });
    return users.map((u, i) => ({
      rank: i + 1,
      userId: u.id,
      username: u.username,
      score: u.bestScore,
    }));
  }

  async getHistory(userId: string) {
    const games = await this.prisma.game.findMany({
      where: { userId, status: 'completed' },
      orderBy: { completedAt: 'desc' },
      select: { id: true, totalScore: true, completedAt: true },
    });
    return games;
  }

  async createShare(gameId: string, userId: string) {
    const game = await this.prisma.game.findUnique({ where: { id: gameId } });
    if (!game) throw new NotFoundException();
    if (game.userId !== userId) throw new ForbiddenException();
    if (game.status !== 'completed')
      throw new BadRequestException('Game not completed');

    const existing = await this.prisma.gameShare.findUnique({
      where: { gameId },
    });
    if (existing) return { token: existing.token };

    const token = randomBytes(16).toString('hex');
    await this.prisma.gameShare.create({ data: { gameId, token } });
    return { token };
  }

  async getSharedResult(token: string) {
    const share = await this.prisma.gameShare.findUnique({
      where: { token },
      include: {
        game: {
          include: {
            rounds: { orderBy: { roundIndex: 'asc' } },
            user: { select: { username: true } },
          },
        },
      },
    });
    if (!share) throw new NotFoundException();

    return {
      username: share.game.user.username,
      totalScore: share.game.totalScore,
      completedAt: share.game.completedAt,
      rounds: share.game.rounds.map((r) => ({
        roundIndex: r.roundIndex,
        points: r.points ?? 0,
        distance: r.distance ?? 0,
      })),
    };
  }
}
