import type { TattooDesign } from '../data/studio'

export interface BookingRequest {
  id: string
  artist: string
  date: string
  time: string
  bodyArea: string
  idea: string
  size: string
  name: string
  email: string
  status: 'Solicitud pendiente' | 'Solicitud cancelada'
  createdAt: string
}

export interface ClientProfile {
  name: string
  email: string
}

export const BOOKINGS_KEY = 'kage-booking-requests'
export const PROFILE_KEY = 'kage-client-profile'
export const FAVORITES_KEY = 'kage-design-favorites'

function readJson<T>(key: string, fallback: T): T {
  const storedValue = localStorage.getItem(key)
  if (storedValue === null) return fallback

  try {
    return JSON.parse(storedValue) as T
  } catch {
    throw new Error(`No se pudieron leer los datos locales de "${key}".`)
  }
}

export function readBookings(): BookingRequest[] {
  const value: unknown = readJson(BOOKINGS_KEY, [])
  if (!Array.isArray(value)) throw new Error('Las solicitudes guardadas tienen un formato inválido.')
  return value as BookingRequest[]
}

export function readProfile(): ClientProfile {
  const value: unknown = readJson(PROFILE_KEY, { name: '', email: '' })
  if (typeof value !== 'object' || value === null || !('name' in value) || !('email' in value)) {
    throw new Error('El perfil guardado tiene un formato inválido.')
  }
  return value as ClientProfile
}

export function readFavorites(): string[] {
  const value: unknown = readJson(FAVORITES_KEY, [])
  if (!Array.isArray(value) || !value.every((slug) => typeof slug === 'string')) {
    throw new Error('Los favoritos guardados tienen un formato inválido.')
  }
  return value
}

export function saveBooking(request: BookingRequest): void {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify([request, ...readBookings()]))
}

export function saveProfile(profile: ClientProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export function saveFavorites(favorites: string[]): void {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
}

export function toggleFavorite(slug: string): string[] {
  const favorites = readFavorites()
  const updatedFavorites = favorites.includes(slug)
    ? favorites.filter((favorite) => favorite !== slug)
    : [...favorites, slug]
  saveFavorites(updatedFavorites)
  return updatedFavorites
}

export function formatBookingDate(value: string): string {
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' }).format(new Date(`${value}T12:00:00`))
}

export function formatDesignName(slug: string, catalog: TattooDesign[]): string {
  return catalog.find((design) => design.slug === slug)?.name ?? slug
}
