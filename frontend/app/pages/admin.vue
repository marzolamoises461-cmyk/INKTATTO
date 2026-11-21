<template>
  <StudioLayout active="admin">
    <main class="studio-main admin-page">
      <header>
        <p class="studio-eyebrow">Administración del estudio</p>
        <h1 class="studio-title">Agenda de<br /><em>artistas.</em></h1>
        <p class="studio-lede">Configura jornadas semanales, descansos y bloqueos. Los cambios se guardan en la agenda del artista seleccionado.</p>
      </header>

      <p v-if="message" class="studio-notice" :role="isError ? 'alert' : 'status'">{{ message }}</p>
      <p v-if="loading" class="studio-empty">Comprobando permisos y cargando la agenda…</p>
      <section v-else-if="!authorized" class="studio-empty" role="alert">
        Esta sección es exclusiva para administradores.
        <NuxtLink to="/login">Iniciar sesión</NuxtLink>
      </section>
      <template v-else>
        <section class="admin-card studio-card">
          <label class="studio-field">
            Artista
            <select v-model.number="selectedArtistId">
              <option v-for="artist in artists" :key="artist.id" :value="artist.id">{{ artist.displayName }}</option>
            </select>
          </label>
          <p v-if="!artists.length" class="studio-empty">No hay artistas activos disponibles.</p>
        </section>

        <section v-if="selectedArtistId" class="admin-card studio-card">
          <div class="admin-heading">
            <div>
              <p class="studio-eyebrow">Disponibilidad recurrente</p>
              <h2>Jornadas semanales</h2>
            </div>
            <button class="studio-button studio-button--outline studio-button--small" type="button" @click="addWindow">Añadir jornada</button>
          </div>
          <p class="admin-help">Agrega una o más franjas por día. Las ventanas no pueden superponerse; deja un día sin franjas para marcarlo como descanso.</p>
          <div class="admin-schedule">
            <div v-for="(window, index) in windows" :key="window.key" class="admin-window">
              <label class="studio-field">
                Día
                <select v-model.number="window.weekday">
                  <option v-for="day in weekdays" :key="day.value" :value="day.value">{{ day.label }}</option>
                </select>
              </label>
              <label class="studio-field">
                Desde
                <input v-model="window.opensAt" type="time" required />
              </label>
              <label class="studio-field">
                Hasta
                <input v-model="window.closesAt" type="time" required />
              </label>
              <button class="admin-remove" type="button" :aria-label="`Quitar jornada ${index + 1}`" @click="removeWindow(index)">Quitar</button>
            </div>
            <p v-if="!windows.length" class="studio-empty">No hay jornadas configuradas para este artista.</p>
          </div>
          <button class="studio-button" type="button" :disabled="saving || !selectedArtistId" @click="saveSchedule">
            {{ saving ? 'Guardando…' : 'Guardar agenda' }} <span>↗</span>
          </button>
        </section>

        <section v-if="selectedArtistId" class="admin-card studio-card">
          <div class="admin-heading">
            <div>
              <p class="studio-eyebrow">Excepciones y vacaciones</p>
              <h2>Días bloqueados</h2>
            </div>
          </div>
          <form class="admin-block-form" @submit.prevent="createBlock">
            <label class="studio-field">
              Fecha
              <input v-model="blockForm.date" type="date" required />
            </label>
            <label class="studio-field">
              Desde (opcional)
              <input v-model="blockForm.startsAt" type="time" />
            </label>
            <label class="studio-field">
              Hasta (opcional)
              <input v-model="blockForm.endsAt" type="time" />
            </label>
            <label class="studio-field">
              Motivo
              <input v-model.trim="blockForm.reason" maxlength="255" placeholder="Descanso, vacaciones…" />
            </label>
            <button class="studio-button" type="submit" :disabled="saving">{{ saving ? 'Guardando…' : 'Bloquear fecha' }} <span>↗</span></button>
          </form>
          <ul v-if="blocks.length" class="admin-block-list">
            <li v-for="block in blocks" :key="block.id">
              <span>
                <strong>{{ formatDate(block.blockedDate) }}</strong>
                {{ block.startsAt && block.endsAt ? `${block.startsAt.slice(0, 5)}–${block.endsAt.slice(0, 5)}` : 'Día completo' }}
                <small v-if="block.reason">{{ block.reason }}</small>
              </span>
              <button class="admin-remove" type="button" @click="removeBlock(block.id)">Eliminar bloqueo</button>
            </li>
          </ul>
          <p v-else class="admin-help">No hay días bloqueados. Para una ausencia de varios días, crea un bloqueo de día completo por cada fecha.</p>
        </section>

        <section class="admin-card studio-card">
          <div class="admin-heading">
            <div>
              <p class="studio-eyebrow">Solicitudes y seguimiento</p>
              <h2>Gestión de citas</h2>
            </div>
            <button class="studio-button studio-button--outline studio-button--small" type="button" :disabled="bookingLoading" @click="loadBookings">
              {{ bookingLoading ? 'Actualizando…' : 'Actualizar' }}
            </button>
          </div>
          <form class="admin-filters" @submit.prevent="loadBookings(1)">
            <label class="studio-field">Buscar<input v-model.trim="bookingSearch" maxlength="120" placeholder="Cliente, correo, artista…" /></label>
            <label class="studio-field">Estado
              <select v-model="bookingStatus">
                <option value="">Todos</option>
                <option v-for="status in bookingStatuses" :key="status" :value="status">{{ bookingStatusLabel(status) }}</option>
              </select>
            </label>
            <label class="studio-field">Ordenar por
              <select v-model="bookingSort">
                <option value="createdAt">Fecha de solicitud</option>
                <option value="date">Fecha de cita</option>
                <option value="status">Estado</option>
                <option value="artist">Artista</option>
              </select>
            </label>
            <label class="studio-field">Dirección
              <select v-model="bookingSortOrder"><option value="DESC">Descendente</option><option value="ASC">Ascendente</option></select>
            </label>
            <button class="studio-button studio-button--outline studio-button--small" type="submit">Aplicar filtros</button>
          </form>
          <p v-if="!adminBookings.length" class="admin-help">No hay solicitudes de cita para gestionar.</p>
          <div v-else class="admin-booking-list">
            <article v-for="booking in adminBookings" :key="booking.id" class="admin-booking">
              <div>
                <p class="admin-booking__state">{{ bookingStatusLabel(booking.status) }}</p>
                <h3>{{ booking.user.fullName }} · {{ booking.bodyArea }}</h3>
                <span>{{ booking.date }} · {{ booking.time.slice(0, 5) }} · {{ booking.artist }} · {{ booking.durationMinutes }} min</span>
                <span>{{ booking.user.email }}</span>
                <span v-if="booking.quotedPrice">Cotización {{ formatCurrency(booking.quotedPrice) }} · Anticipo {{ formatCurrency(booking.depositAmount || '0') }}</span>
              </div>
              <button class="studio-button studio-button--outline studio-button--small" type="button" @click="selectBooking(booking)">
                {{ selectedBookingId === booking.id ? 'Seleccionada' : 'Ver / gestionar' }}
              </button>
            </article>
          </div>
          <div v-if="bookingTotalPages > 1" class="admin-pagination">
            <button class="admin-remove" type="button" :disabled="bookingPage <= 1" @click="loadBookings(bookingPage - 1)">Anterior</button>
            <span>Página {{ bookingPage }} de {{ bookingTotalPages }} · {{ bookingTotal }} citas</span>
            <button class="admin-remove" type="button" :disabled="bookingPage >= bookingTotalPages" @click="loadBookings(bookingPage + 1)">Siguiente</button>
          </div>
        </section>

        <section class="admin-card studio-card">
          <div class="admin-heading">
            <div>
              <p class="studio-eyebrow">Bandeja de entrada</p>
              <h2>Mensajes de contacto</h2>
            </div>
            <button class="studio-button studio-button--outline studio-button--small" type="button" :disabled="contactLoading" @click="loadContactMessages()">
              {{ contactLoading ? 'Actualizando…' : 'Actualizar' }}
            </button>
          </div>
          <form class="admin-filters" @submit.prevent="loadContactMessages(1)">
            <label class="studio-field">Buscar
              <input v-model.trim="contactSearch" maxlength="120" placeholder="Nombre, correo o mensaje…" />
            </label>
            <label class="studio-field">Ordenar por
              <select v-model="contactSort">
                <option value="createdAt">Fecha</option>
                <option value="fullName">Nombre</option>
                <option value="email">Correo</option>
              </select>
            </label>
            <label class="studio-field">Dirección
              <select v-model="contactSortOrder"><option value="DESC">Descendente</option><option value="ASC">Ascendente</option></select>
            </label>
            <button class="studio-button studio-button--outline studio-button--small" type="submit">Aplicar filtros</button>
          </form>
          <p v-if="contactLoading" class="admin-help">Cargando mensajes…</p>
          <p v-else-if="!contactMessages.length" class="admin-help">No hay mensajes de contacto para mostrar.</p>
          <div v-else class="admin-message-list">
            <article v-for="contact in contactMessages" :key="contact.id">
              <div class="admin-heading">
                <h3>{{ contact.fullName }}</h3>
                <time :datetime="contact.createdAt">{{ formatTimestamp(contact.createdAt) }}</time>
              </div>
              <a :href="`mailto:${contact.email}`">{{ contact.email }}</a>
              <p>{{ contact.message }}</p>
            </article>
          </div>
          <div v-if="contactTotalPages > 1" class="admin-pagination">
            <button class="admin-remove" type="button" :disabled="contactPage <= 1" @click="loadContactMessages(contactPage - 1)">Anterior</button>
            <span>Página {{ contactPage }} de {{ contactTotalPages }} · {{ contactTotal }} mensajes</span>
            <button class="admin-remove" type="button" :disabled="contactPage >= contactTotalPages" @click="loadContactMessages(contactPage + 1)">Siguiente</button>
          </div>
        </section>

        <section v-if="selectedBooking" class="admin-card studio-card">
          <div class="admin-heading">
            <div>
              <p class="studio-eyebrow">Cita #{{ selectedBooking.id }} · {{ selectedBooking.user.fullName }}</p>
              <h2>{{ selectedBooking.bodyArea }} · {{ selectedBooking.size }}</h2>
            </div>
          </div>
          <p class="admin-help">{{ selectedBooking.idea }}</p>
          <div v-if="bookingImages.length" class="admin-reference-images">
            <figure v-for="image in bookingImages" :key="image.id">
              <img :src="image.previewUrl" :alt="`Referencia ${image.originalName}`" />
              <figcaption>{{ image.originalName }} · {{ Math.ceil(image.sizeBytes / 1024) }} KB</figcaption>
            </figure>
          </div>
          <p v-else class="admin-help">Esta solicitud no tiene imágenes de referencia.</p>
          <div v-if="bookingHistory.length" class="admin-history">
            <h3>Historial de estados</h3>
            <ol>
              <li v-for="entry in bookingHistory" :key="entry.id">
                <strong>{{ bookingStatusLabel(entry.toStatus) }}</strong>
                <span>{{ formatTimestamp(entry.changedAt) }} · {{ entry.actorEmail || 'Registro histórico' }}</span>
                <small v-if="entry.note">{{ entry.note }}</small>
              </li>
            </ol>
          </div>
          <form v-if="nextBookingStatuses(selectedBooking.status).length" class="admin-workflow" @submit.prevent="updateBooking">
            <label class="studio-field">
              Siguiente estado
              <select v-model="workflow.status" required>
                <option v-for="status in nextBookingStatuses(selectedBooking.status)" :key="status" :value="status">
                  {{ bookingStatusLabel(status) }}
                </option>
              </select>
            </label>
            <template v-if="workflow.status === 'quoted'">
              <label class="studio-field">
                Precio cotizado (COP)
                <input v-model.number="workflow.quotedPrice" type="number" min="0" step="1" required />
              </label>
              <label class="studio-field">
                Anticipo (COP)
                <input v-model.number="workflow.depositAmount" type="number" min="0" step="1" />
              </label>
              <label class="studio-field">
                Duración estimada (minutos)
                <input v-model.number="workflow.durationMinutes" type="number" min="30" max="480" step="1" />
              </label>
            </template>
            <label v-if="workflow.status === 'cancelled' || workflow.status === 'rejected'" class="studio-field">
              Motivo
              <textarea v-model.trim="workflow.reason" required minlength="3" maxlength="500" />
            </label>
            <label class="studio-field admin-workflow__notes">
              Nota privada para administración
              <textarea v-model.trim="workflow.adminNotes" maxlength="5000" />
            </label>
            <button class="studio-button" type="submit" :disabled="bookingSaving">
              {{ bookingSaving ? 'Guardando…' : 'Guardar actualización' }} <span>↗</span>
            </button>
          </form>
          <p v-else class="admin-help">Esta cita tiene un estado final y no admite nuevas transiciones.</p>
        </section>
      </template>
    </main>
  </StudioLayout>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import StudioLayout from '../components/StudioLayout.vue'

interface Artist { id: number; slug: string; displayName: string }
interface ScheduleWindow { key: number; weekday: number; opensAt: string; closesAt: string }
interface ArtistBlock { id: number; blockedDate: string; startsAt: string | null; endsAt: string | null; reason: string | null }
type BookingStatus = 'pending' | 'quoted' | 'confirmed' | 'completed' | 'cancelled' | 'rejected'
interface AdminBooking {
  id: number
  artist: string
  date: string
  time: string
  durationMinutes: number
  bodyArea: string
  size: string
  idea: string
  status: BookingStatus
  quotedPrice: string | null
  depositAmount: string | null
  adminNotes: string | null
  user: { id: number; email: string; fullName: string }
}
interface ContactMessage {
  id: number
  fullName: string
  email: string
  message: string
  createdAt: string
}
interface AdminPage<T> {
  data: T[]
  meta: { page: number; total: number; totalPages: number }
}
interface AdminReferenceImage {
  id: number
  originalName: string
  sizeBytes: number
  url: string
  previewUrl: string
}
interface BookingHistoryEntry {
  id: number
  toStatus: BookingStatus
  actorEmail: string | null
  note: string | null
  changedAt: string
}

const { user, api, initialize } = useAuth()
const weekdays = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
]
const artists = ref<Artist[]>([])
const adminBookings = ref<AdminBooking[]>([])
const bookingPage = ref(1)
const bookingTotalPages = ref(0)
const bookingTotal = ref(0)
const bookingSearch = ref('')
const bookingStatus = ref('')
const bookingSort = ref('createdAt')
const bookingSortOrder = ref<'ASC' | 'DESC'>('DESC')
const bookingStatuses: BookingStatus[] = ['pending', 'quoted', 'confirmed', 'completed', 'cancelled', 'rejected']
const contactMessages = ref<ContactMessage[]>([])
const contactPage = ref(1)
const contactTotalPages = ref(0)
const contactTotal = ref(0)
const contactSearch = ref('')
const contactSort = ref('createdAt')
const contactSortOrder = ref<'ASC' | 'DESC'>('DESC')
const contactLoading = ref(false)
const selectedArtistId = ref(0)
const selectedBookingId = ref(0)
const selectedBooking = computed(() => adminBookings.value.find((booking) => booking.id === selectedBookingId.value) ?? null)
const bookingImages = ref<AdminReferenceImage[]>([])
const bookingHistory = ref<BookingHistoryEntry[]>([])
const windows = ref<ScheduleWindow[]>([])
const blocks = ref<ArtistBlock[]>([])
const loading = ref(true)
const authorized = ref(false)
const saving = ref(false)
const bookingLoading = ref(false)
const bookingSaving = ref(false)
const message = ref('')
const isError = ref(false)
let nextWindowKey = 0
const blockForm = reactive({ date: '', startsAt: '', endsAt: '', reason: '' })
const workflow = reactive({
  status: 'quoted' as BookingStatus,
  quotedPrice: 0,
  depositAmount: 0,
  durationMinutes: 60,
  adminNotes: '',
  reason: '',
})

onMounted(async () => {
  await initialize()
  if (!user.value) {
    await navigateTo('/login')
    return
  }
  if (user.value.role !== 'admin') {
    authorized.value = false
    loading.value = false
    return
  }
  authorized.value = true
  try {
    artists.value = await api<Artist[]>('/artists')
    selectedArtistId.value = artists.value[0]?.id ?? 0
    await Promise.all([loadBookings(), loadContactMessages()])
  } catch {
    setMessage('No se pudieron cargar los artistas.', true)
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  bookingImages.value.forEach((image) => URL.revokeObjectURL(image.previewUrl))
})

watch(selectedArtistId, async (id) => {
  if (!id || !authorized.value) return
  message.value = ''
  try {
    const [schedule, currentBlocks] = await Promise.all([
      api<Array<Omit<ScheduleWindow, 'key'>>>(`/artists/${id}/schedule`),
      api<ArtistBlock[]>(`/artists/${id}/blocks`),
    ])
    windows.value = schedule.map((window) => ({ ...window, key: nextWindowKey++ }))
    blocks.value = currentBlocks
  } catch {
    setMessage('No se pudo cargar la agenda del artista.', true)
  }
})

function addWindow(): void {
  windows.value.push({ key: nextWindowKey++, weekday: 1, opensAt: '09:00', closesAt: '17:00' })
}

function removeWindow(index: number): void {
  windows.value.splice(index, 1)
}

async function saveSchedule(): Promise<void> {
  saving.value = true
  try {
    const schedule = await api<Array<Omit<ScheduleWindow, 'key'>>>(`/artists/${selectedArtistId.value}/schedule`, {
      method: 'PUT',
      body: { windows: windows.value.map(({ weekday, opensAt, closesAt }) => ({ weekday, opensAt, closesAt })) },
    })
    windows.value = schedule.map((window) => ({ ...window, key: nextWindowKey++ }))
    setMessage('La agenda semanal se guardó correctamente.')
  } catch (error: unknown) {
    setMessage(errorMessage(error, 'No se pudo guardar la agenda.'), true)
  } finally {
    saving.value = false
  }
}

async function createBlock(): Promise<void> {
  if (Boolean(blockForm.startsAt) !== Boolean(blockForm.endsAt)) {
    setMessage('Indica las dos horas o deja ambas vacías para bloquear el día completo.', true)
    return
  }
  saving.value = true
  try {
    await api(`/artists/${selectedArtistId.value}/blocks`, {
      method: 'POST',
      body: {
        date: blockForm.date,
        ...(blockForm.startsAt ? { startsAt: blockForm.startsAt, endsAt: blockForm.endsAt } : {}),
        ...(blockForm.reason ? { reason: blockForm.reason } : {}),
      },
    })
    blockForm.date = ''
    blockForm.startsAt = ''
    blockForm.endsAt = ''
    blockForm.reason = ''
    blocks.value = await api<ArtistBlock[]>(`/artists/${selectedArtistId.value}/blocks`)
    setMessage('El bloqueo se guardó correctamente.')
  } catch (error: unknown) {
    setMessage(errorMessage(error, 'No se pudo guardar el bloqueo.'), true)
  } finally {
    saving.value = false
  }
}

async function removeBlock(blockId: number): Promise<void> {
  saving.value = true
  try {
    await api(`/artists/${selectedArtistId.value}/blocks/${blockId}`, { method: 'DELETE' })
    blocks.value = blocks.value.filter((block) => block.id !== blockId)
    setMessage('El bloqueo se eliminó.')
  } catch (error: unknown) {
    setMessage(errorMessage(error, 'No se pudo eliminar el bloqueo.'), true)
  } finally {
    saving.value = false
  }
}

async function loadBookings(page = bookingPage.value): Promise<void> {
  bookingLoading.value = true
  try {
    const query = new URLSearchParams({
      page: String(page),
      pageSize: '10',
      sortBy: bookingSort.value,
      sortOrder: bookingSortOrder.value,
      ...(bookingSearch.value ? { search: bookingSearch.value } : {}),
      ...(bookingStatus.value ? { status: bookingStatus.value } : {}),
    })
    const result = await api<AdminPage<AdminBooking>>(`/bookings?${query.toString()}`)
    adminBookings.value = result.data
    bookingPage.value = result.meta.page
    bookingTotalPages.value = result.meta.totalPages
    bookingTotal.value = result.meta.total
    if (selectedBookingId.value && !result.data.some((booking) => booking.id === selectedBookingId.value)) {
      selectedBookingId.value = 0
    }
  } catch (error: unknown) {
    setMessage(errorMessage(error, 'No se pudieron cargar las solicitudes de cita.'), true)
  } finally {
    bookingLoading.value = false
  }
}

async function loadContactMessages(page = contactPage.value): Promise<void> {
  contactLoading.value = true
  try {
    const query = new URLSearchParams({
      page: String(page),
      pageSize: '10',
      sortBy: contactSort.value,
      sortOrder: contactSortOrder.value,
      ...(contactSearch.value ? { search: contactSearch.value } : {}),
    })
    const result = await api<AdminPage<ContactMessage>>(`/contact?${query.toString()}`)
    contactMessages.value = result.data
    contactPage.value = result.meta.page
    contactTotalPages.value = result.meta.totalPages
    contactTotal.value = result.meta.total
  } catch (error: unknown) {
    setMessage(errorMessage(error, 'No se pudieron cargar los mensajes de contacto.'), true)
  } finally {
    contactLoading.value = false
  }
}

async function selectBooking(booking: AdminBooking): Promise<void> {
  bookingImages.value.forEach((image) => URL.revokeObjectURL(image.previewUrl))
  selectedBookingId.value = booking.id
  workflow.status = nextBookingStatuses(booking.status)[0] ?? booking.status
  workflow.quotedPrice = Number(booking.quotedPrice ?? 0)
  workflow.depositAmount = Number(booking.depositAmount ?? 0)
  workflow.durationMinutes = booking.durationMinutes
  workflow.adminNotes = booking.adminNotes ?? ''
  workflow.reason = ''
  bookingImages.value = []
  bookingHistory.value = []
  try {
    const [images, history] = await Promise.all([
      api<Array<Omit<AdminReferenceImage, 'previewUrl'>>>(`/bookings/${booking.id}/images`),
      api<BookingHistoryEntry[]>(`/bookings/${booking.id}/history`),
    ])
    bookingImages.value = await Promise.all(images.map(async (image) => ({
      ...image,
      previewUrl: URL.createObjectURL(await api<Blob>(image.url, { responseType: 'blob' })),
    })))
    bookingHistory.value = history
  } catch (error: unknown) {
    setMessage(errorMessage(error, 'No se pudieron cargar las imágenes o el historial de la cita.'), true)
  }
}

async function updateBooking(): Promise<void> {
  if (!selectedBooking.value) return
  bookingSaving.value = true
  try {
    const body = {
      status: workflow.status,
      ...(workflow.status === 'quoted' ? {
        quotedPrice: workflow.quotedPrice,
        depositAmount: workflow.depositAmount,
        durationMinutes: workflow.durationMinutes,
      } : {}),
      ...(workflow.status === 'cancelled' || workflow.status === 'rejected' ? { reason: workflow.reason } : {}),
      ...(workflow.adminNotes ? { adminNotes: workflow.adminNotes } : {}),
    }
    await api(`/bookings/${selectedBooking.value.id}/status`, { method: 'PATCH', body })
    setMessage('La cita se actualizó y el cambio quedó registrado.')
    await loadBookings()
    const refreshed = selectedBooking.value
    if (refreshed) await selectBooking(refreshed)
  } catch (error: unknown) {
    setMessage(errorMessage(error, 'No se pudo actualizar la cita.'), true)
  } finally {
    bookingSaving.value = false
  }
}

function nextBookingStatuses(status: BookingStatus): BookingStatus[] {
  const transitions: Record<BookingStatus, BookingStatus[]> = {
    pending: ['quoted', 'rejected', 'cancelled'],
    quoted: ['confirmed', 'rejected', 'cancelled'],
    confirmed: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
    rejected: [],
  }
  return transitions[status]
}

function bookingStatusLabel(status: BookingStatus): string {
  const labels: Record<BookingStatus, string> = {
    pending: 'Pendiente',
    quoted: 'Cotizada',
    confirmed: 'Confirmada',
    completed: 'Realizada',
    cancelled: 'Cancelada',
    rejected: 'Rechazada',
  }
  return labels[status]
}

function formatCurrency(value: string): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`))
}

function errorMessage(error: unknown, fallback: string): string {
  const detail = (error as { data?: { message?: string | string[] } }).data?.message
  return Array.isArray(detail) ? detail.join('. ') : detail ?? fallback
}

function setMessage(value: string, error = false): void {
  message.value = value
  isError.value = error
}
</script>

<style scoped>
.admin-page > header { margin-bottom: 38px; }
.admin-page > .studio-notice { margin-bottom: 22px; }
.admin-card { margin-top: 20px; padding: clamp(20px, 4vw, 36px); }
.admin-heading { display: flex; align-items: end; justify-content: space-between; gap: 20px; }
.admin-heading h2 { margin: 0; font: 500 30px 'Playfair Display', serif; }
.admin-help { color: var(--studio-muted); font-size: 12px; line-height: 1.7; }
.admin-schedule { display: grid; gap: 12px; margin: 20px 0; }
.admin-window { display: grid; grid-template-columns: minmax(150px, 1fr) repeat(2, minmax(110px, .7fr)) auto; align-items: end; gap: 12px; }
.admin-remove { min-height: 42px; padding: 0 12px; border: 1px solid var(--studio-line); background: transparent; color: #f09191; cursor: pointer; font: 10px 'DM Mono', monospace; }
.admin-block-form { display: grid; grid-template-columns: repeat(4, minmax(120px, 1fr)) auto; align-items: end; gap: 12px; margin: 20px 0; }
.admin-block-list { display: grid; gap: 8px; margin: 22px 0 0; padding: 0; list-style: none; }
.admin-block-list li { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 12px; border-top: 1px solid var(--studio-line); color: var(--studio-muted); font-size: 12px; }
.admin-block-list strong { margin-right: 12px; color: var(--studio-paper); }
.admin-block-list small { display: block; margin-top: 5px; }
.admin-booking-list { display: grid; gap: 8px; margin-top: 20px; }
.admin-filters { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); align-items: end; gap: 12px; margin: 20px 0; }
.admin-pagination { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 14px; margin-top: 20px; color: var(--studio-muted); font-size: 11px; }
.admin-pagination button:disabled { cursor: not-allowed; opacity: .45; }
.admin-message-list { display: grid; gap: 12px; }
.admin-message-list article { padding: 16px; border: 1px solid var(--studio-line); }
.admin-message-list h3 { margin: 0; font: 500 20px 'Playfair Display', serif; }
.admin-message-list time, .admin-message-list a { color: var(--studio-muted); font-size: 11px; }
.admin-message-list p { margin: 14px 0 0; white-space: pre-wrap; overflow-wrap: anywhere; color: var(--studio-paper); font-size: 13px; line-height: 1.7; }
.admin-booking { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 14px; border: 1px solid var(--studio-line); }
.admin-booking h3 { margin: 0 0 6px; font: 500 18px 'Playfair Display', serif; }
.admin-booking span { display: block; margin-top: 3px; color: var(--studio-muted); font-size: 11px; }
.admin-booking__state { margin: 0 0 6px; color: var(--studio-red); font: 9px 'DM Mono', monospace; letter-spacing: .1em; text-transform: uppercase; }
.admin-reference-images { display: flex; flex-wrap: wrap; gap: 12px; margin: 20px 0; }
.admin-reference-images figure { width: min(190px, 42vw); margin: 0; }
.admin-reference-images img { display: block; width: 100%; aspect-ratio: 1; object-fit: cover; border: 1px solid var(--studio-line); }
.admin-reference-images figcaption { margin-top: 5px; color: var(--studio-muted); font-size: 10px; }
.admin-history { margin-top: 26px; }
.admin-history h3 { font: 500 20px 'Playfair Display', serif; }
.admin-history ol { display: grid; gap: 10px; margin: 0; padding-left: 20px; }
.admin-history li { padding-left: 5px; color: var(--studio-muted); font-size: 11px; }
.admin-history li strong, .admin-history li span, .admin-history li small { display: block; margin-bottom: 4px; }
.admin-history li strong { color: var(--studio-paper); }
.admin-workflow { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-top: 28px; }
.admin-workflow__notes { grid-column: 1 / -1; }
.admin-workflow .studio-button { justify-self: start; }
@media (max-width: 760px) {
  .admin-window { grid-template-columns: 1fr 1fr; }
  .admin-block-form { grid-template-columns: 1fr 1fr; }
  .admin-heading { align-items: start; flex-direction: column; }
  .admin-workflow { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 460px) {
  .admin-window, .admin-block-form { grid-template-columns: 1fr; }
  .admin-block-list li { align-items: start; flex-direction: column; }
  .admin-booking { align-items: start; flex-direction: column; }
  .admin-workflow { grid-template-columns: 1fr; }
}
</style>
