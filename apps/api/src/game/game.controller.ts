import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { GameService } from './game.service';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { SubmitGuessDto } from './dto/submit-guess.dto';

@Controller()
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('game/active')
  @UseGuards(AuthenticatedGuard)
  getActiveGame(@Req() req: Request) {
    return this.gameService.getActiveGame(req.user!.id);
  }

  @Post('game/start')
  @UseGuards(AuthenticatedGuard)
  start(@Req() req: Request) {
    return this.gameService.startGame(req.user!.id);
  }

  @Get('game/:id/round')
  @UseGuards(AuthenticatedGuard)
  getRound(@Param('id') id: string, @Req() req: Request) {
    return this.gameService.getRound(id, req.user!.id);
  }

  @Post('game/:id/guess')
  @UseGuards(AuthenticatedGuard)
  submitGuess(
    @Param('id') id: string,
    @Body() dto: SubmitGuessDto,
    @Req() req: Request,
  ) {
    return this.gameService.submitGuess(id, req.user!.id, dto.x, dto.y);
  }

  @Post('game/:id/next')
  @UseGuards(AuthenticatedGuard)
  nextRound(@Param('id') id: string, @Req() req: Request) {
    return this.gameService.nextRound(id, req.user!.id);
  }

  @Get('game/:id/result')
  @UseGuards(AuthenticatedGuard)
  getResult(@Param('id') id: string, @Req() req: Request) {
    return this.gameService.getResult(id, req.user!.id);
  }

  @Get('leaderboard')
  getLeaderboard() {
    return this.gameService.getLeaderboard();
  }

  @Get('game/history')
  @UseGuards(AuthenticatedGuard)
  getHistory(@Req() req: Request) {
    return this.gameService.getHistory(req.user!.id);
  }

  @Post('game/:id/share')
  @UseGuards(AuthenticatedGuard)
  createShare(@Param('id') id: string, @Req() req: Request) {
    return this.gameService.createShare(id, req.user!.id);
  }

  @Get('share/:token')
  getSharedResult(@Param('token') token: string) {
    return this.gameService.getSharedResult(token);
  }
}
