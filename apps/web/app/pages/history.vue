<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Game History</h1>

    <div v-if="!history" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader" class="animate-spin text-4xl" />
    </div>

    <div v-else-if="history.length === 0" class="text-center py-12 text-muted">
      No games played yet.
      <UButton to="/play" class="mt-4">Play your first game</UButton>
    </div>

    <UCard v-else>
      <div class="divide-y divide-default">
        <NuxtLink
          v-for="game in history"
          :key="game.id"
          :to="`/game/${game.id}/result`"
          class="flex items-center justify-between py-3 px-2 hover:bg-elevated transition-colors cursor-pointer"
        >
          <span class="text-muted">
            {{
              new Date(game.completedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            }}
          </span>
          <span class="font-mono font-semibold">{{
            game.totalScore.toLocaleString()
          }}</span>
        </NuxtLink>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

const { getHistory } = useGame();
const history = ref<
  { id: string; totalScore: number; completedAt: string }[] | null
>(null);

onMounted(async () => {
  try {
    history.value = await getHistory();
  } catch {
    history.value = [];
  }
});
</script>
