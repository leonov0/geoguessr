export default defineNuxtRouteMiddleware(async () => {
  const { user, pending, fetchUser } = useAuth();
  if (pending.value) await fetchUser();
  if (!user.value) return navigateTo('/login', { replace: true });
});
