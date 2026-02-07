<template>
  <div class="space-y-8">
    <div v-if="!result" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader" class="animate-spin text-4xl" />
    </div>

    <template v-else>
      <div class="text-center space-y-2">
        <p class="text-muted">Game Complete!</p>
        <h1 class="text-5xl font-bold">
          {{ animatedScore.toLocaleString() }}
        </h1>
        <p class="text-muted">Your Final Score</p>
      </div>

      <div v-if="result.isPersonalBest" class="mx-auto max-w-md">
        <UAlert
          icon="i-lucide-trophy"
          color="success"
          title="New personal best!"
          description="Congratulations!"
        />
      </div>

      <div v-if="result.leaderboardRank" class="mx-auto max-w-md">
        <UAlert
          icon="i-lucide-medal"
          color="success"
          title="You have achieved a new overall high score!"
          :description="`Your score is now #${result.leaderboardRank} on the leaderboard!`"
        />
      </div>

      <div class="max-w-md mx-auto">
        <GameScoreBreakdown title="Round Breakdown" :rounds="result.rounds" />
      </div>

      <div class="max-w-md mx-auto">
        <UCard>
          <template #header>
            <h3 class="text-center font-semibold">Share Your Results</h3>
          </template>
          <div class="flex flex-col items-center gap-3">
            <UInput
              v-if="shareUrl"
              :model-value="shareUrl"
              readonly
              class="w-full font-mono text-xs"
            />
            <UButton
              v-if="!shareUrl"
              variant="outline"
              :loading="sharing"
              @click="onShare"
            >
              Generate Share Link
            </UButton>
            <UButton v-else variant="outline" @click="copyLink">
              {{ copied ? 'Copied!' : 'Copy Link' }}
            </UButton>
          </div>
        </UCard>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <UButton to="/leaderboard" variant="outline">View Leaderboard</UButton>
        <UButton to="/history" variant="outline">Game History</UButton>
        <UButton to="/play">Play Again</UButton>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

const route = useRoute();
const { getResult, createShare } = useGame();
const config = useRuntimeConfig();

const result = ref<Awaited<ReturnType<typeof getResult>> | null>(null);
const shareUrl = ref('');
const sharing = ref(false);
const copied = ref(false);
const animatedScore = ref(0);

const gameId = route.params.id as string;

onMounted(async () => {
  result.value = await getResult(gameId);
  animateScore(result.value.totalScore);
});

function animateScore(target: number) {
  const duration = 800;
  const start = performance.now();
  function tick(now: number) {
    const progress = Math.min((now - start) / duration, 1);
    animatedScore.value = Math.round(progress * target);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

async function onShare() {
  sharing.value = true;
  try {
    const { token } = await createShare(gameId);
    shareUrl.value = `${config.public.appUrl}/share/${token}`;
  } finally {
    sharing.value = false;
  }
}

async function copyLink() {
  await navigator.clipboard.writeText(shareUrl.value);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}
</script>
