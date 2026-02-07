<template>
  <div class="space-y-12">
    <div class="text-center space-y-4">
      <h1 class="text-4xl font-bold">GeoGuessr</h1>
      <p class="text-lg text-muted">
        Test your geography skills — guess locations from images!
      </p>
      <UButton to="/play" size="xl" class="mt-4">Play Game</UButton>
    </div>

    <div>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-semibold">Top Players</h2>
        <UButton
          to="/leaderboard"
          variant="ghost"
          trailing-icon="i-lucide-arrow-right"
        >
          View All
        </UButton>
      </div>
      <UCard>
        <div v-if="!leaderboard" class="py-8 flex justify-center">
          <UIcon name="i-lucide-loader" class="animate-spin text-2xl" />
        </div>
        <div
          v-else-if="leaderboard.length === 0"
          class="py-8 text-center text-muted"
        >
          No scores yet. Be the first to play!
        </div>
        <div v-else class="divide-y divide-default">
          <div
            v-for="entry in leaderboard.slice(0, 5)"
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
              <UBadge
                v-if="user?.id === entry.userId"
                size="xs"
                variant="subtle"
                >(You)</UBadge
              >
            </div>
            <span class="font-mono font-semibold">{{
              entry.score?.toLocaleString()
            }}</span>
          </div>
        </div>
      </UCard>
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
