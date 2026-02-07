export function useFetchApi() {
  const {
    public: { apiUrl },
  } = useRuntimeConfig();

  return $fetch.create({
    baseURL: apiUrl,
    credentials: 'include',
    onRequest({ options }) {
      if (import.meta.server) {
        const event = useRequestEvent();
        const cookie = event?.node?.req?.headers?.cookie;
        if (cookie) {
          const headers = new Headers(options.headers as HeadersInit);
          const cookieValue = Array.isArray(cookie)
            ? cookie.join('; ')
            : cookie;
          headers.set('cookie', cookieValue);
          options.headers = headers;
        }
      }
    },
  });
}
