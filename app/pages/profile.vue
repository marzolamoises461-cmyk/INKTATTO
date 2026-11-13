<template>
  <StudioLayout active="profile">
    <main class="studio-main client-page">
      <p class="studio-eyebrow">Área de clientes · Cuenta INKTATTO</p>
      <h1 class="studio-title">Tu espacio<br /><em>personal.</em></h1>
      <p class="studio-lede">Consulta tus datos y las solicitudes guardadas en la base de datos del estudio.</p>
      <p v-if="pageMessage" class="studio-notice" role="status">{{ pageMessage }}</p>

      <section class="client-profile studio-card">
        <div class="client-profile__heading">
          <div>
            <p class="studio-eyebrow">Información de la cuenta</p>
            <h2>{{ user?.fullName || 'Cargando cuenta…' }}</h2>
          </div>
          <button class="studio-button studio-button--outline studio-button--small" type="button" @click="signOut">Cerrar sesión</button>
        </div>
        <dl class="client-profile__data">
          <div><dt>Nombre</dt><dd>{{ user?.fullName || '—' }}</dd></div>
          <div><dt>Correo</dt><dd>{{ user?.email || '—' }}</dd></div>
          <div><dt>Tipo de cuenta</dt><dd>{{ user?.role === 'admin' ? 'Administración' : 'Cliente' }}</dd></div>
        </dl>
      </section>

      <section class="client-section">
        <div class="client-section__heading">
          <div><p class="studio-eyebrow">Agenda sincronizada</p><h2>Mis <em>solicitudes.</em></h2></div>
          <NuxtLink class="client-section__link" to="/booking">Nueva solicitud ↗</NuxtLink>
        </div>
        <div v-if="loading" class="studio-empty">Cargando solicitudes…</div>
        <div v-else-if="bookings.length" class="client-booking-list">
          <article v-for="booking in bookings" :key="booking.id" class="client-booking studio-card">
            <div class="client-booking__date"><span>{{ booking.date.slice(8, 10) }}</span>{{ monthName(booking.date) }}</div>
            <div class="client-booking__details">
              <p>{{ statusLabel(booking.status) }}</p>
              <h3>{{ booking.bodyArea }} · {{ booking.time.slice(0, 5) }}</h3>
              <span>{{ formatBookingDate(booking.date) }} · {{ booking.artist }}</span>
            </div>
            <button v-if="booking.status === 'pending'" class="client-cancel" type="button" @click="cancelBooking(booking.id)">Cancelar solicitud</button>
          </article>
        </div>
        <p v-else class="studio-empty">Todavía no tienes solicitudes. Cuando envíes una desde Reservas, aparecerá aquí desde cualquier dispositivo.</p>
      </section>

      <section class="client-section">
        <div class="client-section__heading">
          <div><p class="studio-eyebrow">Colección guardada</p><h2>Diseños <em>favoritos.</em></h2></div>
          <NuxtLink class="client-section__link" to="/gallery">Explorar diseños ↗</NuxtLink>
        </div>
        <div v-if="favoriteDesigns.length" class="client-favorites">
          <NuxtLink v-for="design in favoriteDesigns" :key="design.slug" class="client-favorite" :to="`/gallery/${design.slug}`">
            <img class="studio-image" :src="design.image" :alt="design.imageAlt" loading="lazy" />
            <span>{{ design.category }}</span><h3>{{ design.name }}</h3>
          </NuxtLink>
        </div>
        <p v-else class="studio-empty">Todavía no has guardado diseños. Puedes marcarlos como favoritos desde la galería.</p>
      </section>
    </main>
  </StudioLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import StudioLayout from '../components/StudioLayout.vue'
import { designs } from '../data/studio'
import { readFavorites, formatBookingDate } from '../utils/studio-storage'

interface BookingRecord {
  id: number
  artist: string
  date: string
  time: string
  bodyArea: string
  status: 'pending' | 'confirmed' | 'cancelled'
}

const { user, api, initialize, logout } = useAuth()
const bookings = ref<BookingRecord[]>([])
const favorites = ref<string[]>([])
const loading = ref(true)
const pageMessage = ref('')
const favoriteDesigns = computed(() => favorites.value.map((slug) => designs.find((design) => design.slug === slug)).filter((design) => design !== undefined))

onMounted(async () => {
  await initialize()
  if (!user.value) {
    await navigateTo('/login')
    return
  }
  try {
    const [items] = await Promise.all([
      api<BookingRecord[]>('/bookings/mine'),
      Promise.resolve().then(() => { favorites.value = readFavorites() }),
    ])
    bookings.value = items
  } catch {
    pageMessage.value = 'No se pudieron cargar tus solicitudes. Comprueba que la API y MySQL estén disponibles.'
    try { favorites.value = readFavorites() } catch { favorites.value = [] }
  } finally {
    loading.value = false
  }
})

function monthName(value: string): string {
  return new Intl.DateTimeFormat('es-CO', { month: 'short' }).format(new Date(value + 'T12:00:00'))
}

function statusLabel(status: BookingRecord['status']): string {
  return status === 'confirmed' ? 'Cita confirmada' : status === 'cancelled' ? 'Solicitud cancelada' : 'Solicitud pendiente'
}

async function cancelBooking(id: number): Promise<void> {
  if (!globalThis.confirm('¿Quieres cancelar esta solicitud?')) return
  try {
    const updated = await api<BookingRecord>(`/bookings/${id}/cancel`, { method: 'PATCH' })
    bookings.value = bookings.value.map((item) => item.id === id ? updated : item)
    pageMessage.value = 'La solicitud fue cancelada.'
  } catch (error: unknown) {
    const detail = (error as { data?: { message?: string } }).data?.message
    pageMessage.value = detail ?? 'No se pudo cancelar la solicitud.'
  }
}

async function signOut(): Promise<void> {
  logout()
  await navigateTo('/login')
}
</script>

<style scoped>
.client-profile { margin-top: 35px; padding: clamp(22px, 4vw, 40px); }
.client-profile__heading, .client-section__heading { display: flex; align-items: end; justify-content: space-between; gap: 20px; }
.client-profile__heading h2 { margin: 0; font: 500 32px 'Playfair Display', serif; }
.client-profile__data { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 25px 0 0; }
.client-profile__data dt { margin-bottom: 6px; color: var(--studio-muted); font: 9px 'DM Mono', monospace; letter-spacing: .08em; text-transform: uppercase; }
.client-profile__data dd { margin: 0; font-size: 13px; }
.client-section { margin-top: 70px; }
.client-section__heading h2 { margin: 0; font: 500 clamp(34px, 4.5vw, 58px)/1.05 'Playfair Display', serif; letter-spacing: -.04em; }
.client-section__heading h2 em { color: var(--studio-red); }
.client-section__link { color: var(--studio-paper); font: 9px 'DM Mono', monospace; letter-spacing: .08em; text-transform: uppercase; }
.client-booking-list { display: grid; gap: 10px; margin-top: 20px; }
.client-booking { display: flex; align-items: center; gap: 22px; padding: 18px 22px; }
.client-booking__date { display: flex; min-width: 60px; flex-direction: column; align-items: center; gap: 4px; color: var(--studio-muted); font: 9px 'DM Mono', monospace; text-transform: uppercase; }
.client-booking__date span { color: var(--studio-red); font: 27px 'Playfair Display', serif; }
.client-booking__details { flex: 1; }
.client-booking__details p { margin: 0 0 5px; color: var(--studio-red); font: 9px 'DM Mono', monospace; letter-spacing: .1em; text-transform: uppercase; }
.client-booking__details h3 { margin: 0 0 5px; font: 500 20px 'Playfair Display', serif; }
.client-booking__details > span { color: var(--studio-muted); font-size: 11px; }
.client-cancel { border: 0; background: none; color: var(--studio-muted); cursor: pointer; font: 9px 'DM Mono', monospace; text-transform: uppercase; }
.client-cancel:hover { color: #f09191; }
.client-favorites { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 20px; }
.client-favorite { position: relative; display: flex; min-height: 270px; flex-direction: column; justify-content: end; overflow: hidden; padding: 18px; background: var(--studio-panel-light); }
.client-favorite::after { position: absolute; inset: 35% 0 0; background: linear-gradient(transparent, rgba(4, 5, 5, .9)); content: ''; }
.client-favorite img { position: absolute; inset: 0; }
.client-favorite span, .client-favorite h3 { position: relative; z-index: 1; }
.client-favorite span { color: #f06464; font: 9px 'DM Mono', monospace; text-transform: uppercase; }
.client-favorite h3 { margin: 7px 0 0; font: 500 22px 'Playfair Display', serif; }
@media (max-width: 700px) {
  .client-profile__heading, .client-section__heading { align-items: start; flex-direction: column; }
  .client-profile__data { grid-template-columns: 1fr; }
  .client-booking { align-items: start; flex-wrap: wrap; gap: 14px; }
  .client-booking__details { min-width: calc(100% - 80px); }
  .client-favorites { grid-template-columns: 1fr; }
}
</style>
