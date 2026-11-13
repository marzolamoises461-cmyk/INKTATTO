export interface AuthUser {
  id: number
  email: string
  fullName: string
  role: 'user' | 'admin'
}

interface AuthResponse {
  token: string
  user: AuthUser
}

interface AuthProfileResponse {
  user: AuthUser
}

export function useAuth() {
  const config = useRuntimeConfig()
  const user = useState<AuthUser | null>('inktatto-user', () => null)
  const token = useState<string | null>('inktatto-token', () => null)
  const apiBase = String(config.public.apiBase)

  async function api<T>(path: string, options: Record<string, unknown> = {}): Promise<T> {
    const headers: Record<string, string> = {
      ...((options.headers as Record<string, string> | undefined) ?? {}),
    }
    if (token.value) headers.Authorization = 'Bearer ' + token.value
    return await $fetch<T>(apiBase + path, { ...options, headers } as never)
  }

  function saveSession(response: AuthResponse): void {
    token.value = response.token
    user.value = response.user
    if (import.meta.client) localStorage.setItem('inktatto-access-token', response.token)
  }

  async function login(email: string, password: string): Promise<void> {
    const response = await api<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    saveSession(response)
  }

  async function register(fullName: string, email: string, password: string): Promise<void> {
    const response = await api<AuthResponse>('/auth/register', {
      method: 'POST',
      body: { fullName, email, password },
    })
    saveSession(response)
  }

  async function initialize(): Promise<void> {
    if (!import.meta.client || token.value) return
    const saved = localStorage.getItem('inktatto-access-token')
    if (!saved) return
    token.value = saved
    try {
      const response = await api<AuthProfileResponse>('/auth/profile')
      user.value = response.user
    } catch {
      logout()
    }
  }

  function logout(): void {
    token.value = null
    user.value = null
    if (import.meta.client) localStorage.removeItem('inktatto-access-token')
  }

  return { user, token, api, login, register, initialize, logout }
}
