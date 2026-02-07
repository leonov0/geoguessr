<template>
  <div class="flex items-center gap-3">
    <template v-if="pending">
      <USkeleton class="h-9 w-24" />
    </template>
    <template v-else-if="user">
      <UButton variant="ghost" :loading="loggingOut" @click="handleLogout">
        Log out
      </UButton>
    </template>
    <template v-else>
      <UButton to="/login" variant="ghost"> Log in </UButton>
      <UButton to="/register"> Sign up </UButton>
    </template>
  </div>
</template>

<script setup lang="ts">
const { user, pending, logout } = useAuth();
const router = useRouter();
const loggingOut = ref(false);

async function handleLogout() {
  loggingOut.value = true;
  try {
    await logout();
    await router.push('/');
  } finally {
    loggingOut.value = false;
  }
}
</script>
