<template>
  <UCard>
    <template #header>
      <h3 class="font-semibold">{{ title }}</h3>
    </template>
    <div class="space-y-2">
      <div
        v-for="round in rounds"
        :key="round.roundIndex"
        class="flex justify-between items-center py-1 border-b border-default"
      >
        <span>Round {{ round.roundIndex + 1 }}</span>
        <span class="font-mono font-semibold">
          {{ round.points?.toLocaleString() ?? '-' }}
        </span>
      </div>
      <div class="flex justify-between items-center pt-2 font-bold text-lg">
        <span>Total</span>
        <span class="font-mono">{{ total.toLocaleString() }}</span>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const props = defineProps<{
  title?: string;
  rounds: { roundIndex: number; points: number | null }[];
}>();

const total = computed(() =>
  props.rounds.reduce((sum, r) => sum + (r.points ?? 0), 0),
);
</script>
