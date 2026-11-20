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
      </template>
    </main>
  </StudioLayout>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import StudioLayout from '../components/StudioLayout.vue'

interface Artist { id: number; slug: string; displayName: string }
interface ScheduleWindow { key: number; weekday: number; opensAt: string; closesAt: string }
interface ArtistBlock { id: number; blockedDate: string; startsAt: string | null; endsAt: string | null; reason: string | null }

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
const selectedArtistId = ref(0)
const windows = ref<ScheduleWindow[]>([])
const blocks = ref<ArtistBlock[]>([])
const loading = ref(true)
const authorized = ref(false)
const saving = ref(false)
const message = ref('')
const isError = ref(false)
let nextWindowKey = 0
const blockForm = reactive({ date: '', startsAt: '', endsAt: '', reason: '' })

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
  } catch {
    setMessage('No se pudieron cargar los artistas.', true)
  } finally {
    loading.value = false
  }
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
@media (max-width: 760px) {
  .admin-window { grid-template-columns: 1fr 1fr; }
  .admin-block-form { grid-template-columns: 1fr 1fr; }
  .admin-heading { align-items: start; flex-direction: column; }
}
@media (max-width: 460px) {
  .admin-window, .admin-block-form { grid-template-columns: 1fr; }
  .admin-block-list li { align-items: start; flex-direction: column; }
}
</style>
