import { useFetchApi } from './useFetchApi';

export interface User {
  id: string;
  email: string;
  username: string;
}

export function useAuth() {
  const fetchApi = useFetchApi();
  const user = useState<User | null>('auth-user', () => null);
  const pending = useState('auth-pending', () => true);

  async function fetchUser() {
    if (!pending.value) return;
    try {
      const data = await fetchApi<{ user: User }>('/auth/me');
      user.value = data.user;
    } catch {
      user.value = null;
    } finally {
      pending.value = false;
    }
  }

  async function login(email: string, password: string) {
    const data = await fetchApi<{ user: User }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    user.value = data.user;
    return data.user;
  }

  async function register(email: string, username: string, password: string) {
    await fetchApi('/auth/register', {
      method: 'POST',
      body: { email, username, password },
    });
  }

  async function logout() {
    await fetchApi('/auth/logout', { method: 'POST' });
    user.value = null;
  }

  return { user, pending, fetchUser, login, register, logout };
}
