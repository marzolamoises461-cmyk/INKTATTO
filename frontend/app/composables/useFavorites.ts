import { ref } from 'vue'
import {
  readFavorites, saveFavorites, toggleFavorite as toggleLocalFavorite,
} from '../utils/studio-storage'

export function useFavorites() {
  const { user, api, initialize } = useAuth()
  const favorites = useState<string[]>('inktatto-favorites', () => [])
  const loading = ref(false)

  async function load(): Promise<void> {
    loading.value = true
    try {
      await initialize()
      if (user.value) {
        const [saved, local] = await Promise.all([
          api<string[]>('/favorites'),
          Promise.resolve().then(readFavorites),
        ])
        const missing = local.filter((slug) => !saved.includes(slug))
        await Promise.all(missing.map((designSlug) =>
          api('/favorites', { method: 'PUT', body: { designSlug } }),
        ))
        favorites.value = [...new Set([...saved, ...local])]
        if (local.length) saveFavorites([])
      } else {
        favorites.value = readFavorites()
      }
    } finally {
      loading.value = false
    }
  }

  async function toggle(slug: string): Promise<void> {
    if (!user.value) {
      favorites.value = toggleLocalFavorite(slug)
      return
    }
    if (favorites.value.includes(slug)) {
      await api<void>(`/favorites/${encodeURIComponent(slug)}`, { method: 'DELETE' })
      favorites.value = favorites.value.filter((favorite) => favorite !== slug)
    } else {
      await api('/favorites', { method: 'PUT', body: { designSlug: slug } })
      favorites.value = [...favorites.value, slug]
    }
  }

  return { favorites, loading, load, toggle }
}
