<template>
  <StudioLayout active="profile">
    <main class="studio-main client-page">
      <p class="studio-eyebrow">Área de clientes · Datos de este dispositivo</p>
      <h1 class="studio-title">Tu espacio<br /><em>Kage.</em></h1>
      <p class="studio-lede">Consulta las solicitudes guardadas y tus diseños favoritos. No hay una cuenta ni un servicio de clientes conectado a este sitio.</p>
      <p v-if="pageMessage" class="studio-notice client-notice" role="status">{{ pageMessage }}</p>

      <section class="client-profile studio-card">
        <div class="client-profile__heading">
          <div>
            <p class="studio-eyebrow">Información del usuario</p>
            <h2>{{ profile.name || 'Perfil sin completar' }}</h2>
          </div>
          <button class="studio-button studio-button--outline studio-button--small" type="button" @click="editing = !editing">{{ editing ? 'Cerrar edición' : 'Editar mis datos' }}</button>
        </div>
        <form v-if="editing" class="client-edit-form" @submit.prevent="saveClientProfile">
          <label class="studio-field">Nombre<input v-model.trim="profileDraft.name" autocomplete="name" required maxlength="100" /></label>
          <label class="studio-field">Correo electrónico<input v-model.trim="profileDraft.email" type="email" autocomplete="email" required maxlength="254" /></label>
          <button class="studio-button studio-button--small" type="submit">Guardar datos <span>↗</span></button>
        </form>
        <dl v-else class="client-profile__data">
          <div><dt>Nombre</dt><dd>{{ profile.name || 'Aún no indicado' }}</dd></div>
          <div><dt>Correo</dt><dd>{{ profile.email || 'Aún no indicado' }}</dd></div>
        </dl>
      </section>

      <section class="client-section">
        <div class="client-section__heading">
          <div>
            <p class="studio-eyebrow">Agenda</p>
            <h2>Próximas <em>citas.</em></h2>
          </div>
          <NuxtLink class="client-section__link" to="/booking">Nueva solicitud ↗</NuxtLink>
        </div>
        <p class="client-disclaimer">Las reservas locales son solicitudes pendientes, no citas confirmadas. No se sincronizan con el estudio.</p>
        <div v-if="upcomingBookings.length" class="client-booking-list">
          <article v-for="booking in upcomingBookings" :key="booking.id" class="client-booking studio-card">
            <div class="client-booking__date"><span>{{ booking.date.slice(8, 10) }}</span>{{ new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(new Date(`${booking.date}T12:00:00`)) }}</div>
            <div class="client-booking__details">
              <p>{{ booking.status }}</p>
              <h3>{{ booking.bodyArea }} · {{ booking.time }}</h3>
              <span>{{ formatBookingDate(booking.date) }} · {{ booking.artist }}</span>
            </div>
            <div v-if="booking.status === 'Solicitud pendiente'" class="client-cancel-actions">
              <template v-if="pendingCancellation === booking.id">
                <span role="status">¿Cancelar esta solicitud?</span>
                <button class="client-cancel" type="button" @click="cancelBooking(booking.id)">Sí, cancelar</button>
                <button class="client-cancel" type="button" @click="pendingCancellation = null">Volver</button>
              </template>
              <button v-else class="client-cancel" type="button" @click="pendingCancellation = booking.id">Cancelar solicitud</button>
            </div>
          </article>
        </div>
        <p v-else class="studio-empty">No hay solicitudes guardadas. Cuando guardes una solicitud desde la reserva, aparecerá aquí para este navegador.</p>
      </section>

      <section class="client-section">
        <div class="client-section__heading">
          <div>
            <p class="studio-eyebrow">Archivo personal</p>
            <h2>Historial de <em>reservas.</em></h2>
          </div>
        </div>
        <div v-if="historyBookings.length" class="client-booking-list">
          <article v-for="booking in historyBookings" :key="booking.id" class="client-booking studio-card">
            <div class="client-booking__date"><span>✓</span>Local</div>
            <div class="client-booking__details">
              <p>{{ booking.status }}</p>
              <h3>{{ booking.bodyArea }} · {{ booking.time }}</h3>
              <span>{{ formatBookingDate(booking.date) }} · {{ booking.artist }}</span>
            </div>
            <div v-if="booking.status === 'Solicitud pendiente'" class="client-cancel-actions">
              <template v-if="pendingCancellation === booking.id">
                <span role="status">¿Cancelar esta solicitud?</span>
                <button class="client-cancel" type="button" @click="cancelBooking(booking.id)">Sí, cancelar</button>
                <button class="client-cancel" type="button" @click="pendingCancellation = null">Volver</button>
              </template>
              <button v-else class="client-cancel" type="button" @click="pendingCancellation = booking.id">Cancelar solicitud</button>
            </div>
          </article>
        </div>
        <p v-else class="studio-empty">El historial está vacío. Las solicitudes canceladas o pasadas aparecerán aquí solo si se guardaron en este dispositivo.</p>
      </section>

      <section class="client-section">
        <div class="client-section__heading">
          <div>
            <p class="studio-eyebrow">Colección guardada</p>
            <h2>Diseños <em>favoritos.</em></h2>
          </div>
          <NuxtLink class="client-section__link" to="/gallery">Explorar diseños ↗</NuxtLink>
        </div>
        <div v-if="favoriteDesigns.length" class="client-favorites">
          <NuxtLink v-for="design in favoriteDesigns" :key="design.slug" class="client-favorite" :to="`/gallery/${design.slug}`">
            <img class="studio-image" :src="design.image" :alt="design.imageAlt" loading="lazy" />
            <span>{{ design.category }}</span>
            <h3>{{ design.name }}</h3>
          </NuxtLink>
        </div>
        <p v-else class="studio-empty">Todavía no has guardado diseños. Puedes marcarlos como favoritos desde la galería.</p>
      </section>
    </main>
  </StudioLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import StudioLayout from '../components/StudioLayout.vue'
import { designs } from '../data/studio'
import {
  BOOKINGS_KEY,
  formatBookingDate,
  readBookings,
  readFavorites,
  readProfile,
  saveProfile,
  type BookingRequest,
  type ClientProfile,
} from '../utils/studio-storage'

const bookings = ref<BookingRequest[]>([])
const profile = ref<ClientProfile>({ name: '', email: '' })
const favorites = ref<string[]>([])
const editing = ref(false)
const pageMessage = ref('')
const pendingCancellation = ref<string | null>(null)
const profileDraft = reactive({ name: '', email: '' })
const today = new Date()
const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
const upcomingBookings = computed(() => bookings.value.filter((booking) => booking.date >= todayKey && booking.status === 'Solicitud pendiente'))
const historyBookings = computed(() => bookings.value.filter((booking) => booking.date < todayKey || booking.status === 'Solicitud cancelada'))
const favoriteDesigns = computed(() => favorites.value
  .map((slug) => designs.find((design) => design.slug === slug))
  .filter((design) => design !== undefined))

onMounted(loadLocalData)

function loadLocalData() {
  try {
    bookings.value = readBookings()
    profile.value = readProfile()
    profileDraft.name = profile.value.name
    profileDraft.email = profile.value.email
    favorites.value = readFavorites()
  } catch (error) {
    pageMessage.value = error instanceof Error ? error.message : 'No se pudieron cargar los datos locales.'
  }
}

function saveClientProfile() {
  try {
    saveProfile(profileDraft)
    profile.value = { ...profileDraft }
    editing.value = false
    pageMessage.value = 'Los datos se guardaron solo en este navegador.'
  } catch (error) {
    pageMessage.value = error instanceof Error ? `No se pudo guardar el perfil: ${error.message}` : 'No se pudo guardar el perfil en este dispositivo.'
  }
}

function cancelBooking(id: string) {
  const booking = bookings.value.find((item) => item.id === id)
  if (!booking || booking.status !== 'Solicitud pendiente') return
  const updatedBookings = bookings.value.map((item) => item.id === id ? { ...item, status: 'Solicitud cancelada' as const } : item)
  try {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updatedBookings))
    bookings.value = updatedBookings
    pendingCancellation.value = null
    pageMessage.value = 'La solicitud se marcó como cancelada en este navegador. Si ya contactaste con el estudio, avísales directamente.'
  } catch (error) {
    pageMessage.value = error instanceof Error ? `No se pudo eliminar la solicitud: ${error.message}` : 'No se pudo eliminar la solicitud local.'
  }
}
</script>

<style scoped>
.client-notice {
  margin: 28px 0;
}

.client-profile {
  margin-top: 35px;
  padding: clamp(22px, 4vw, 40px);
}

.client-profile__heading,
.client-section__heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
}

.client-profile__heading h2 {
  margin: 0;
  font: 500 32px 'Playfair Display', serif;
}

.client-edit-form {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 14px;
  align-items: end;
  margin-top: 24px;
}

.client-profile__data {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 25px 0 0;
}

.client-profile__data dt {
  margin-bottom: 6px;
  color: var(--studio-muted);
  font: 9px 'DM Mono', monospace;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.client-profile__data dd {
  margin: 0;
  font-size: 13px;
}

.client-section {
  margin-top: 80px;
}

.client-section__heading h2 {
  margin: 0;
  font: 500 clamp(34px, 4.5vw, 58px)/1.05 'Playfair Display', serif;
  letter-spacing: -.04em;
}

.client-section__heading h2 em {
  color: var(--studio-red);
}

.client-section__link {
  color: var(--studio-paper);
  font: 9px 'DM Mono', monospace;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.client-section__link:hover {
  color: var(--studio-red);
}

.client-disclaimer {
  margin: 17px 0;
  color: var(--studio-muted);
  font-size: 11px;
  line-height: 1.6;
}

.client-booking-list {
  display: grid;
  gap: 10px;
}

.client-booking {
  display: flex;
  align-items: center;
  gap: 22px;
  padding: 18px 22px;
}

.client-booking__date {
  display: flex;
  min-width: 60px;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: var(--studio-muted);
  font: 9px 'DM Mono', monospace;
  text-transform: uppercase;
}

.client-booking__date span {
  color: var(--studio-red);
  font: 27px 'Playfair Display', serif;
}

.client-booking__details {
  flex: 1;
}

.client-booking__details p {
  margin: 0 0 5px;
  color: var(--studio-red);
  font: 9px 'DM Mono', monospace;
  letter-spacing: .1em;
  text-transform: uppercase;
}

.client-booking__details h3 {
  margin: 0 0 5px;
  font: 500 20px 'Playfair Display', serif;
}

.client-booking__details > span {
  color: var(--studio-muted);
  font-size: 11px;
}

.client-cancel {
  border: 0;
  background: none;
  color: var(--studio-muted);
  cursor: pointer;
  font: 9px 'DM Mono', monospace;
  text-transform: uppercase;
}

.client-cancel-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 12px;
  color: var(--studio-muted);
  font-size: 11px;
}

.client-cancel:hover {
  color: #f09191;
}

.client-favorites {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 20px;
}

.client-favorite {
  position: relative;
  display: flex;
  min-height: 270px;
  flex-direction: column;
  justify-content: end;
  overflow: hidden;
  padding: 18px;
  background: var(--studio-panel-light);
}

.client-favorite::after {
  position: absolute;
  inset: 35% 0 0;
  background: linear-gradient(transparent, rgba(4, 5, 5, .9));
  content: '';
}

.client-favorite img {
  position: absolute;
  inset: 0;
}

.client-favorite span,
.client-favorite h3 {
  position: relative;
  z-index: 1;
}

.client-favorite span {
  color: #f06464;
  font: 9px 'DM Mono', monospace;
  text-transform: uppercase;
}

.client-favorite h3 {
  margin: 7px 0 0;
  font: 500 22px 'Playfair Display', serif;
}

@media (max-width: 700px) {
  .client-profile__heading,
  .client-section__heading {
    align-items: start;
    flex-direction: column;
  }

  .client-edit-form,
  .client-profile__data {
    grid-template-columns: 1fr;
  }

  .client-booking {
    align-items: start;
    flex-wrap: wrap;
    gap: 14px;
  }

  .client-booking__details {
    min-width: calc(100% - 80px);
  }

  .client-cancel {
    margin-left: 75px;
  }

  .client-favorites {
    grid-template-columns: 1fr;
  }
}
</style>
