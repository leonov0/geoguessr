import { useFetchApi } from './useFetchApi';

interface RoundInfo {
  roundIndex: number;
  imageUrl: string;
  startedAt: string;
}

interface RoundResult {
  guessX: number;
  guessY: number;
  correctX: number;
  correctY: number;
  distance: number;
  points: number;
  roundScores: { roundIndex: number; points: number | null }[];
  isLastRound: boolean;
}

interface GameResult {
  gameId: string;
  username: string;
  totalScore: number;
  completedAt: string;
  isPersonalBest: boolean;
  leaderboardRank: number | null;
  rounds: {
    roundIndex: number;
    points: number;
    distance: number;
    guessX: number | null;
    guessY: number | null;
  }[];
}

export function useGame() {
  const fetchApi = useFetchApi();

  const gameId = useState<string | null>('game-id', () => null);
  const currentRound = useState<RoundInfo | null>('game-round', () => null);
  const roundResult = useState<RoundResult | null>(
    'game-round-result',
    () => null,
  );
  const timeRemaining = useState<number>('game-timer', () => 60);
  const gameCompleted = useState<boolean>('game-completed', () => false);

  let timerInterval: ReturnType<typeof setInterval> | null = null;

  function startTimer() {
    stopTimer();
    if (!currentRound.value?.startedAt) return;
    const startedAt = new Date(currentRound.value.startedAt).getTime();
    const update = () => {
      const elapsed = (Date.now() - startedAt) / 1000;
      timeRemaining.value = Math.max(0, Math.ceil(60 - elapsed));
      if (timeRemaining.value <= 0) {
        stopTimer();
      }
    };
    update();
    timerInterval = setInterval(update, 250);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  async function startGame() {
    roundResult.value = null;
    gameCompleted.value = false;
    const data = await fetchApi<{ gameId: string; round: RoundInfo }>(
      '/game/start',
      { method: 'POST' },
    );
    gameId.value = data.gameId;
    currentRound.value = data.round;
    startTimer();
    return data;
  }

  async function resumeGame(): Promise<boolean> {
    try {
      const data = await fetchApi<{ gameId: string; round: RoundInfo } | null>(
        '/game/active',
      );
      if (!data?.gameId) return false;
      gameId.value = data.gameId;
      currentRound.value = data.round;
      roundResult.value = null;
      gameCompleted.value = false;
      startTimer();
      return true;
    } catch {
      return false;
    }
  }

  async function submitGuess(x: number, y: number) {
    stopTimer();
    const data = await fetchApi<RoundResult>(`/game/${gameId.value}/guess`, {
      method: 'POST',
      body: { x, y },
    });
    roundResult.value = data;
    return data;
  }

  async function nextRound() {
    roundResult.value = null;
    const data = await fetchApi<{
      completed: boolean;
      round?: RoundInfo;
      gameId?: string;
    }>(`/game/${gameId.value}/next`, { method: 'POST' });
    if (data.completed) {
      gameCompleted.value = true;
      stopTimer();
      return data;
    }
    currentRound.value = data.round!;
    startTimer();
    return data;
  }

  async function getResult(id: string): Promise<GameResult> {
    return fetchApi<GameResult>(`/game/${id}/result`);
  }

  async function getLeaderboard() {
    return fetchApi<
      { rank: number; userId: string; username: string; score: number }[]
    >('/leaderboard');
  }

  async function getHistory() {
    return fetchApi<{ id: string; totalScore: number; completedAt: string }[]>(
      '/game/history',
    );
  }

  async function createShare(id: string) {
    return fetchApi<{ token: string }>(`/game/${id}/share`, { method: 'POST' });
  }

  async function getSharedResult(token: string) {
    return fetchApi<{
      username: string;
      totalScore: number;
      completedAt: string;
      rounds: { roundIndex: number; points: number; distance: number }[];
    }>(`/share/${token}`);
  }

  function cleanup() {
    stopTimer();
    gameId.value = null;
    currentRound.value = null;
    roundResult.value = null;
    timeRemaining.value = 60;
    gameCompleted.value = false;
  }

  return {
    gameId,
    currentRound,
    roundResult,
    timeRemaining,
    gameCompleted,
    startGame,
    resumeGame,
    submitGuess,
    nextRound,
    getResult,
    getLeaderboard,
    getHistory,
    createShare,
    getSharedResult,
    cleanup,
  };
}
