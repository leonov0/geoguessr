<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Leaderboard</h1>
    <p class="text-muted">Top 10 Players</p>

    <div v-if="!leaderboard" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader" class="animate-spin text-4xl" />
    </div>

    <UCard v-else>
      <div v-if="leaderboard.length === 0" class="py-8 text-center text-muted">
        No games yet.
      </div>
      <div v-else class="divide-y divide-default">
        <div
          v-for="entry in leaderboard"
          :key="entry.rank"
          class="flex items-center justify-between py-3 px-2"
          :class="{ 'bg-elevated': user?.id === entry.userId }"
        >
          <div class="flex items-center gap-3">
            <span class="font-bold w-8 text-center">
              <span v-if="entry.rank === 1">🥇</span>
              <span v-else-if="entry.rank === 2">🥈</span>
              <span v-else-if="entry.rank === 3">🥉</span>
              <span v-else>#{{ entry.rank }}</span>
            </span>
            <span>{{ entry.username }}</span>
            <UBadge v-if="user?.id === entry.userId" size="xs" variant="subtle"
              >(You)</UBadge
            >
          </div>
          <span class="font-mono font-semibold">{{
            entry.score?.toLocaleString()
          }}</span>
        </div>
      </div>
      <template #footer>
        <p class="text-center text-sm text-muted">
          Leaderboard is public — no login required to view
        </p>
      </template>
    </UCard>

    <div class="flex justify-center">
      <UButton to="/play">Play Game</UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user } = useAuth();
const { getLeaderboard } = useGame();

const leaderboard = ref<
  { rank: number; userId: string; username: string; score: number }[] | null
>(null);

onMounted(async () => {
  try {
    leaderboard.value = await getLeaderboard();
  } catch {
    leaderboard.value = [];
  }
});
</script>
