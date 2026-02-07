<template>
  <UCard class="max-w-sm mx-auto">
    <template #header>
      <h1 class="text-xl font-semibold">Sign in</h1>
    </template>

    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormField label="Email" name="email">
        <UInput
          v-model="state.email"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          class="w-full"
        />
      </UFormField>
      <UFormField label="Password" name="password">
        <UInput
          v-model="state.password"
          type="password"
          autocomplete="current-password"
          placeholder="••••••••"
          class="w-full"
        />
      </UFormField>
      <UButton type="submit" block :loading="loading" :disabled="loading">
        Sign in
      </UButton>
    </UForm>

    <template #footer>
      <p class="text-center text-sm">
        Don't have an account?
        <NuxtLink
          to="/register"
          class="font-medium text-primary hover:underline"
        >
          Sign up
        </NuxtLink>
      </p>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';

definePageMeta({ middleware: 'guest' });

const { login } = useAuth();
const toast = useToast();
const router = useRouter();

const schema = z.object({
  email: z.email(),
  password: z.string().nonempty(),
});

type Schema = z.output<typeof schema>;

const state = reactive<Schema>({ email: '', password: '' });

const loading = ref(false);

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true;
  try {
    await login(event.data.email, event.data.password);
    await router.push('/');
  } catch (err: unknown) {
    const data =
      err && typeof err === 'object' && 'data' in err
        ? (err as { data?: { message?: string } }).data
        : undefined;
    const message = data?.message ?? 'Invalid email or password';
    toast.add({
      title: 'Sign in failed',
      description: message,
      color: 'error',
    });
  } finally {
    loading.value = false;
  }
}
</script>
