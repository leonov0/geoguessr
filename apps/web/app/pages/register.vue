<template>
  <UCard class="max-w-sm mx-auto">
    <template #header>
      <h1 class="text-xl font-semibold">Create account</h1>
    </template>

    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormField label="Username" name="username">
        <UInput
          v-model="state.username"
          autocomplete="username"
          placeholder="johndoe"
          class="w-full"
        />
      </UFormField>
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
          autocomplete="new-password"
          placeholder="••••••••"
          class="w-full"
        />
      </UFormField>
      <UButton type="submit" block :loading="loading" :disabled="loading">
        Sign up
      </UButton>
    </UForm>

    <template #footer>
      <p class="text-center text-sm">
        Already have an account?
        <NuxtLink to="/login" class="font-medium text-primary hover:underline">
          Sign in
        </NuxtLink>
      </p>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';

definePageMeta({ middleware: 'guest' });

const { register } = useAuth();
const toast = useToast();
const router = useRouter();

const schema = z.object({
  username: z
    .string()
    .min(2)
    .max(32)
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Letters, numbers, underscores and hyphens only',
    ),
  email: z.email(),
  password: z.string().min(8),
});

type Schema = z.output<typeof schema>;

const state = reactive<Schema>({
  username: '',
  email: '',
  password: '',
});

const loading = ref(false);

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true;
  try {
    await register(event.data.email, event.data.username, event.data.password);
    await router.push('/login');
  } catch (err: unknown) {
    const data =
      err && typeof err === 'object' && 'data' in err
        ? (err as { data?: { message?: string } }).data
        : undefined;
    const message = data?.message ?? 'Registration failed';
    toast.add({
      title: 'Sign up failed',
      description: message,
      color: 'error',
    });
  } finally {
    loading.value = false;
  }
}
</script>
