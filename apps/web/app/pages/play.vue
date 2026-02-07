<template>
  <div>
    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader" class="animate-spin text-4xl" />
    </div>

    <div v-else-if="!roundResult">
      <div class="flex items-center justify-between mb-4">
        <span class="font-semibold text-muted">
          Round {{ (currentRound?.roundIndex ?? 0) + 1 }} of 5
        </span>
        <GameTimer :seconds="timeRemaining" @expired="onTimerExpired" />
        <span class="text-sm text-muted">{{ user?.username }}</span>
      </div>

      <UTabs v-model="activeTab" :items="tabs" class="w-full">
        <template #location>
          <div class="mt-4" style="height: 60vh">
            <GameLocationViewer
              v-if="currentRound"
              :src="currentRound.imageUrl"
              class="w-full h-full"
            />
          </div>
        </template>
        <template #map>
          <div class="mt-4 space-y-4">
            <GameWorldMap
              :guess="guessPos"
              :interactive="true"
              @click="onMapClick"
            />
            <div class="flex justify-end">
              <UButton
                :disabled="!guessPos"
                :loading="submitting"
                @click="onSubmitGuess"
              >
                Submit Guess
              </UButton>
            </div>
          </div>
        </template>
      </UTabs>
    </div>

    <Transition name="fade" mode="out-in">
      <div v-if="roundResult" class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">
            Round {{ (currentRound?.roundIndex ?? 0) + 1 }} of 5 — Result
          </h2>
          <span class="text-sm text-muted">{{ user?.username }}</span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2">
            <GameWorldMap
              :guess="{ x: roundResult.guessX, y: roundResult.guessY }"
              :correct="{ x: roundResult.correctX, y: roundResult.correctY }"
            />
            <div class="flex items-center gap-4 mt-3 text-sm text-muted">
              <span class="flex items-center gap-1">
                <span
                  class="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"
                />
                Your guess
              </span>
              <span class="flex items-center gap-1">
                <span
                  class="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"
                />
                Correct
              </span>
            </div>
          </div>

          <div class="space-y-4">
            <UCard>
              <template #header>
                <span class="text-sm text-muted">Points Earned</span>
              </template>
              <p
                class="text-3xl font-bold text-highlighted"
                :class="{ 'text-green-500': roundResult.points > 0 }"
              >
                +{{ animatedPoints }}
              </p>
            </UCard>

            <UCard>
              <template #header>
                <span class="text-sm text-muted">Distance</span>
              </template>
              <p class="text-2xl font-bold">{{ roundResult.distance }} px</p>
            </UCard>

            <GameScoreBreakdown
              title="Score Breakdown"
              :rounds="roundResult.roundScores"
            />

            <UButton block :loading="advancing" @click="onNextRound">
              {{ roundResult.isLastRound ? 'View Results' : 'Next Round →' }}
            </UButton>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

const { user } = useAuth();
const {
  currentRound,
  roundResult,
  timeRemaining,
  gameId,
  startGame,
  resumeGame,
  submitGuess,
  nextRound,
  cleanup,
} = useGame();
const router = useRouter();

const loading = ref(true);
const submitting = ref(false);
const advancing = ref(false);
const guessPos = ref<{ x: number; y: number } | null>(null);
const activeTab = ref('location');
const animatedPoints = ref(0);

const tabs = [
  { label: 'Location', value: 'location', slot: 'location' as const },
  { label: 'Map', value: 'map', slot: 'map' as const },
];

onMounted(async () => {
  const resumed = await resumeGame();
  if (!resumed) {
    cleanup();
    await startGame();
  }
  loading.value = false;
});

onUnmounted(() => cleanup());

watch(roundResult, (val) => {
  if (!val) {
    animatedPoints.value = 0;
    return;
  }
  animatePoints(val.points);
});

function animatePoints(target: number) {
  animatedPoints.value = 0;
  const duration = 600;
  const start = performance.now();
  function tick(now: number) {
    const progress = Math.min((now - start) / duration, 1);
    animatedPoints.value = Math.round(progress * target);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function onMapClick(pos: { x: number; y: number }) {
  guessPos.value = pos;
}

async function onTimerExpired() {
  if (roundResult.value || submitting.value) return;
  await doSubmit(guessPos.value?.x ?? 1024, guessPos.value?.y ?? 512);
}

async function onSubmitGuess() {
  if (!guessPos.value) return;
  await doSubmit(guessPos.value.x, guessPos.value.y);
}

async function doSubmit(x: number, y: number) {
  submitting.value = true;
  try {
    await submitGuess(x, y);
  } finally {
    submitting.value = false;
  }
}

async function onNextRound() {
  advancing.value = true;
  guessPos.value = null;
  activeTab.value = 'location';
  try {
    const data = await nextRound();
    if (data.completed) {
      await router.push(`/game/${gameId.value}/result`);
    }
  } finally {
    advancing.value = false;
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
