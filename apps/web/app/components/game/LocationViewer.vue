<template>
  <div
    ref="container"
    class="relative overflow-hidden bg-black rounded-lg cursor-grab select-none"
    :class="{ 'cursor-grabbing': dragging }"
    @wheel.prevent="onWheel"
    @mousedown="onMouseDown"
    @touchstart.prevent="onTouchStart"
  >
    <img
      ref="img"
      :src="src"
      class="w-full h-full object-contain transition-transform duration-100"
      :style="{ transform: `scale(${scale}) translate(${tx}px, ${ty}px)` }"
      draggable="false"
    />
    <UButton
      v-if="scale > 1"
      icon="i-lucide-minimize-2"
      size="xs"
      color="neutral"
      variant="solid"
      class="absolute top-2 right-2"
      @click="reset"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ src: string }>();

const container = ref<HTMLElement>();
const scale = ref(1);
const tx = ref(0);
const ty = ref(0);
const dragging = ref(false);
let startX = 0;
let startY = 0;
let startTx = 0;
let startTy = 0;

watch(() => props.src, reset);

function reset() {
  scale.value = 1;
  tx.value = 0;
  ty.value = 0;
}

function onWheel(e: WheelEvent) {
  const delta = e.deltaY > 0 ? -0.2 : 0.2;
  scale.value = Math.max(1, Math.min(5, scale.value + delta));
  if (scale.value === 1) {
    tx.value = 0;
    ty.value = 0;
  }
}

function onMouseDown(e: MouseEvent) {
  if (scale.value <= 1) return;
  dragging.value = true;
  startX = e.clientX;
  startY = e.clientY;
  startTx = tx.value;
  startTy = ty.value;
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
}

function onMouseMove(e: MouseEvent) {
  tx.value = startTx + (e.clientX - startX) / scale.value;
  ty.value = startTy + (e.clientY - startY) / scale.value;
}

function onMouseUp() {
  dragging.value = false;
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
}

function onTouchStart(e: TouchEvent) {
  if (scale.value <= 1 || !e.touches[0]) return;
  dragging.value = true;
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
  startTx = tx.value;
  startTy = ty.value;
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd);
}

function onTouchMove(e: TouchEvent) {
  e.preventDefault();
  if (!e.touches[0]) return;
  tx.value = startTx + (e.touches[0].clientX - startX) / scale.value;
  ty.value = startTy + (e.touches[0].clientY - startY) / scale.value;
}

function onTouchEnd() {
  dragging.value = false;
  window.removeEventListener('touchmove', onTouchMove);
  window.removeEventListener('touchend', onTouchEnd);
}
</script>
