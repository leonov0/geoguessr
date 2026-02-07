export function useFetchApi() {
  const {
    public: { apiUrl },
  } = useRuntimeConfig();

  return $fetch.create({
    baseURL: apiUrl,
    credentials: 'include',
  });
}
