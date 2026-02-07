<template>
  <div class="space-y-8">
    <div v-if="!result" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader" class="animate-spin text-4xl" />
    </div>

    <template v-else>
      <div class="text-center space-y-2">
        <p class="text-muted">Shared Result — {{ result.username }}</p>
        <h1 class="text-5xl font-bold">
          {{ result.totalScore.toLocaleString() }}
        </h1>
        <p class="text-muted">Final Score</p>
        <p v-if="result.completedAt" class="text-sm text-muted">
          {{
            new Date(result.completedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          }}
        </p>
      </div>

      <div class="max-w-md mx-auto">
        <GameScoreBreakdown title="Round Breakdown" :rounds="result.rounds" />
      </div>

      <div class="flex justify-center">
        <UButton to="/play">Play Game</UButton>
      </div>
    </template>

    <div v-if="error" class="text-center py-12">
      <p class="text-muted">This shared result could not be found.</p>
      <UButton to="/" class="mt-4">Go Home</UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const { getSharedResult } = useGame();

const result = ref<Awaited<ReturnType<typeof getSharedResult>> | null>(null);
const error = ref(false);

onMounted(async () => {
  try {
    result.value = await getSharedResult(route.params.token as string);
  } catch {
    error.value = true;
  }
});
</script>
