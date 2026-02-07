<template>
  <div ref="mapContainer" class="relative select-none" @click="onClick">
    <img
      src="/world-map.png"
      class="w-full h-auto rounded-lg"
      draggable="false"
    />

    <div
      v-if="guess"
      class="absolute w-3 h-3 rounded-full bg-red-500 border-2 border-white -translate-x-1/2 -translate-y-1/2 z-10"
      :style="markerStyle(guess.x, guess.y)"
    />

    <div
      v-if="correct"
      class="absolute w-3 h-3 rounded-full bg-green-500 border-2 border-white -translate-x-1/2 -translate-y-1/2 z-10"
      :style="markerStyle(correct.x, correct.y)"
    />

    <svg
      v-if="guess && correct"
      class="absolute inset-0 w-full h-full pointer-events-none z-0"
      viewBox="0 0 2048 1024"
      preserveAspectRatio="none"
    >
      <line
        :x1="guess.x"
        :y1="guess.y"
        :x2="correct.x"
        :y2="correct.y"
        stroke="white"
        stroke-width="2"
        stroke-dasharray="8,4"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  guess?: { x: number; y: number } | null;
  correct?: { x: number; y: number } | null;
  interactive?: boolean;
}>();

const emit = defineEmits<{ click: [pos: { x: number; y: number }] }>();
const mapContainer = ref<HTMLElement>();

function markerStyle(x: number, y: number) {
  return {
    left: `${(x / 2048) * 100}%`,
    top: `${(y / 1024) * 100}%`,
  };
}

function onClick(e: MouseEvent) {
  if (!props.interactive || !mapContainer.value) return;
  const rect = mapContainer.value.getBoundingClientRect();
  const x = Math.round(((e.clientX - rect.left) / rect.width) * 2048);
  const y = Math.round(((e.clientY - rect.top) / rect.height) * 1024);
  emit('click', { x, y });
}
</script>
