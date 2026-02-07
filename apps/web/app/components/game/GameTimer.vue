<template>
  <div class="text-center">
    <span
      class="text-2xl font-mono font-bold"
      :class="seconds <= 10 ? 'text-red-500 animate-pulse' : 'text-highlighted'"
    >
      {{ formatted }}
    </span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ seconds: number }>();
const emit = defineEmits<{ expired: [] }>();

const formatted = computed(() => {
  const m = Math.floor(props.seconds / 60);
  const s = props.seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
});

watch(
  () => props.seconds,
  (val) => {
    if (val <= 0) emit('expired');
  },
);
</script>
