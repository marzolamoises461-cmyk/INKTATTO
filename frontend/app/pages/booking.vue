<template>
  <StudioLayout active="booking">
    <main class="studio-main booking-page">
      <header class="booking-heading">
        <div>
          <p class="studio-eyebrow">Una conversación antes de la tinta</p>
          <h1 class="studio-title">Reserva una<br /><em>consulta.</em></h1>
          <p class="studio-lede">Cuéntanos qué tienes en mente. La fecha y el horario son preferencias y deberán ser confirmados por el estudio.</p>
        </div>
        <p class="booking-aside">01 <span>/</span> Solicitud<br />02 <span>/</span> Confirmación del estudio</p>
      </header>

      <p class="studio-notice booking-disclaimer">Las solicitudes se guardan en la base de datos del estudio. Necesitas iniciar sesión para enviar una solicitud; el equipo confirmará la disponibilidad.</p>

      <p v-if="!user" class="studio-notice booking-disclaimer">Para enviar una solicitud, <NuxtLink to="/login">inicia sesión o crea tu cuenta ↗</NuxtLink>.</p>

      <div class="booking-layout">
        <form class="booking-form studio-card" @submit.prevent="submitRequest">
          <section class="booking-step">
            <p class="booking-step__number">01 / Contacto</p>
            <div class="booking-fields booking-fields--two">
              <label class="studio-field">
                Tu nombre *
                <input v-model.trim="form.name" name="name" autocomplete="name" required maxlength="120" :readonly="Boolean(user)" />
              </label>
              <label class="studio-field">
                Correo electrónico *
                <input v-model.trim="form.email" name="email" type="email" autocomplete="email" required maxlength="190" :readonly="Boolean(user)" />
              </label>
            </div>
          </section>

          <section class="booking-step">
            <p class="booking-step__number">02 / Preferencias de sesión</p>
            <div class="booking-fields booking-fields--two">
              <label class="studio-field">
                Tatuador/a *
                <select v-model="form.artist" name="artist" required>
                  <option disabled value="">Selecciona un perfil</option>
                  <option v-for="artist in artists" :key="artist.slug" :value="artist.slug">{{ artist.displayName }}</option>
                </select>
              </label>
              <label class="studio-field">
                Fecha preferida *
                <input v-model="form.date" name="date" type="date" :min="minDate" required />
              </label>
              <label class="studio-field">
                Duración estimada
                <select v-model.number="form.durationMinutes" name="durationMinutes">
                  <option :value="60">1 hora</option>
                  <option :value="120">2 horas</option>
                  <option :value="180">3 horas</option>
                </select>
              </label>
              <fieldset class="booking-time">
                <legend class="studio-field__legend">Horario preferido *</legend>
                <p v-if="availabilityLoading" class="booking-time__message">Consultando disponibilidad...</p>
                <p v-else-if="availabilityMessage" class="booking-time__message booking-time__message--error" role="alert">{{ availabilityMessage }}</p>
                <p v-else-if="!form.artist || !form.date" class="booking-time__message">Selecciona artista y fecha para consultar horarios.</p>
                <p v-else-if="!timeSlots.length" class="booking-time__message">No hay horarios disponibles para esta fecha y duración.</p>
                <div v-else class="booking-time__options">
                  <label v-for="time in timeSlots" :key="time" :class="{ 'is-selected': form.time === time }">
                    <input v-model="form.time" type="radio" name="time" :value="time" required />
                    <span>{{ time }}</span>
                  </label>
                </div>
                <p>La disponibilidad puede cambiar antes de que el estudio confirme la solicitud.</p>
              </fieldset>
            </div>
          </section>

          <section class="booking-step">
            <p class="booking-step__number">03 / Referencias visuales</p>
            <label class="studio-field">
              Imágenes del tatuaje (1 a 5, JPG, PNG o WEBP; máximo 5 MB cada una) *
              <input
                type="file"
                name="images"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                multiple
                :required="selectedFiles.length === 0"
                @change="handleFiles"
              />
            </label>
            <div v-if="imagePreviews.length" class="booking-image-previews">
              <figure v-for="(preview, index) in imagePreviews" :key="preview.url">
                <img :src="preview.url" :alt="`Vista previa ${index + 1}: ${preview.file.name}`" />
                <figcaption>
                  <span>{{ preview.file.name }}</span>
                  <button type="button" :aria-label="`Quitar ${preview.file.name}`" @click="removeImage(index)">Quitar</button>
                </figcaption>
              </figure>
            </div>
          </section>

          <section class="booking-step">
            <p class="booking-step__number">04 / Tu idea</p>
            <div class="booking-fields booking-fields--two">
              <label class="studio-field">
                Zona del cuerpo *
                <select v-model="form.bodyArea" name="bodyArea" required>
                  <option disabled value="">Selecciona una zona</option>
                  <option v-for="area in bodyAreas" :key="area" :value="area">{{ area }}</option>
                </select>
              </label>
              <label class="studio-field">
                Tamaño aproximado *
                <select v-model="form.size" name="size" required>
                  <option disabled value="">Selecciona un tamaño</option>
                  <option v-for="size in sizes" :key="size" :value="size">{{ size }}</option>
                </select>
              </label>
              <label class="studio-field booking-idea">
                Describe tu idea *
                <textarea v-model.trim="form.idea" name="idea" required minlength="10" maxlength="1200" placeholder="Motivo, referencias o significado que te gustaría explorar..." />
                <span class="booking-character-count">{{ form.idea.length }} / 1200</span>
              </label>
            </div>
          </section>

          <p v-if="formError" class="booking-error" role="alert">{{ formError }}</p>
          <p v-if="confirmation" class="studio-notice" role="status">{{ confirmation }}</p>
          <button class="studio-button booking-submit" type="submit" :disabled="submitting || availabilityLoading">{{ submitting ? 'Enviando…' : 'Enviar solicitud al estudio' }} <span>↗</span></button>
        </form>

        <aside class="booking-summary studio-card">
          <p class="studio-eyebrow">Resumen</p>
          <h2>Tu consulta<br /><em>empieza aquí.</em></h2>
          <dl>
            <div><dt>Artista</dt><dd>{{ artistLabel || 'Por elegir' }}</dd></div>
            <div><dt>Fecha</dt><dd>{{ formattedDate || 'Por elegir' }}</dd></div>
            <div><dt>Horario</dt><dd>{{ form.time || 'Por elegir' }}</dd></div>
            <div><dt>Duración</dt><dd>{{ form.durationMinutes / 60 }} h</dd></div>
            <div><dt>Zona</dt><dd>{{ form.bodyArea || 'Por elegir' }}</dd></div>
            <div><dt>Tamaño</dt><dd>{{ form.size || 'Por elegir' }}</dd></div>
          </dl>
          <p class="booking-summary__note">Al enviar la solicitud, se guarda en la base de datos del estudio. El equipo revisará tu petición y confirmará la disponibilidad.</p>
          <NuxtLink class="booking-contact-link" to="/contact">Contactar con el estudio ↗</NuxtLink>
        </aside>
      </div>
    </main>
  </StudioLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import StudioLayout from '../components/StudioLayout.vue'

const route = useRoute()
const { user, api, initialize } = useAuth()
const bodyAreas = ['Brazo', 'Espalda', 'Pierna', 'Hombro', 'Pecho', 'Costillas', 'Otra zona']
const sizes = ['Pequeño · hasta 8 cm', 'Mediano · 8–18 cm', 'Grande · más de 18 cm', 'Por definir en consulta']
interface ArtistOption { id: number; slug: string; displayName: string }
const artists = ref<ArtistOption[]>([])
const timeSlots = ref<string[]>([])
const form = reactive({ name: '', email: '', artist: '', date: '', time: '', durationMinutes: 60, bodyArea: '', size: '', idea: '' })
const minDate = ref('')
const confirmation = ref('')
const formError = ref('')
const availabilityMessage = ref('')
const availabilityLoading = ref(false)
const submitting = ref(false)
const selectedFiles = ref<File[]>([])
const imagePreviews = ref<Array<{ file: File; url: string }>>([])
let availabilityRequest = 0

onMounted(async () => {
  const dateParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const datePart = (type: Intl.DateTimeFormatPartTypes) => dateParts.find((part) => part.type === type)?.value ?? ''
  minDate.value = `${datePart('year')}-${datePart('month')}-${datePart('day')}`
  const requestedArtist = String(route.query.artist ?? '')
  try {
    artists.value = await api<ArtistOption[]>('/artists')
    if (artists.value.some((artist) => artist.slug === requestedArtist)) form.artist = requestedArtist
  } catch {
    availabilityMessage.value = 'No se pudo cargar la lista de artistas. Inténtalo de nuevo más tarde.'
  }
  await initialize()
  if (user.value) {
    form.name = user.value.fullName
    form.email = user.value.email
  }
})

watch(
  () => [form.artist, form.date, form.durationMinutes] as const,
  async ([artist, date, duration]) => {
    const requestId = ++availabilityRequest
    timeSlots.value = []
    availabilityLoading.value = false
    form.time = ''
    availabilityMessage.value = ''
    if (!artist || !date) return
    availabilityLoading.value = true
    try {
      const result = await api<{ date: string; slots: string[] }>(
        `/artists/${encodeURIComponent(artist)}/availability?date=${encodeURIComponent(date)}&durationMinutes=${duration}`,
      )
      if (requestId === availabilityRequest) timeSlots.value = result.slots
    } catch {
      if (requestId === availabilityRequest) {
        availabilityMessage.value = 'No se pudo consultar la agenda del artista.'
      }
    } finally {
      if (requestId === availabilityRequest) availabilityLoading.value = false
    }
  },
)

const artistLabel = computed(() => artists.value.find((artist) => artist.slug === form.artist)?.displayName ?? '')
const formattedDate = computed(() => form.date
  ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'long' }).format(new Date(`${form.date}T12:00:00`))
  : '')

function handleFiles(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
  if (files.length < 1 || files.length > 5) {
    formError.value = 'Adjunta entre 1 y 5 imágenes.'
    input.value = ''
    return
  }
  if (files.some((file) => !allowedTypes.has(file.type) || file.size > 5 * 1024 * 1024)) {
    formError.value = 'Cada imagen debe ser JPG, PNG o WEBP y pesar máximo 5 MB.'
    input.value = ''
    return
  }
  formError.value = ''
  setSelectedFiles(files)
}

function setSelectedFiles(files: File[]) {
  imagePreviews.value.forEach((preview) => URL.revokeObjectURL(preview.url))
  selectedFiles.value = files
  imagePreviews.value = files.map((file) => ({ file, url: URL.createObjectURL(file) }))
}

function removeImage(index: number) {
  const remaining = selectedFiles.value.filter((_, fileIndex) => fileIndex !== index)
  setSelectedFiles(remaining)
  const input = document.querySelector<HTMLInputElement>('input[name="images"]')
  if (input) input.value = ''
}

async function submitRequest() {
  formError.value = ''
  confirmation.value = ''
  if (!user.value) {
    formError.value = 'Inicia sesión para enviar y consultar tus solicitudes.'
    return
  }
  if (!form.artist || !form.date || !form.time || !form.bodyArea || !form.size || form.idea.length < 10 || selectedFiles.value.length < 1) {
    formError.value = 'Completa todos los campos y adjunta al menos una imagen. La idea debe tener al menos 10 caracteres.'
    return
  }
  if (form.date < minDate.value) {
    formError.value = 'Elige una fecha de hoy o posterior.'
    return
  }
  submitting.value = true
  try {
    const payload = new FormData()
    payload.append('artist', form.artist)
    payload.append('date', form.date)
    payload.append('time', form.time)
    payload.append('durationMinutes', String(form.durationMinutes))
    payload.append('bodyArea', form.bodyArea)
    payload.append('size', form.size)
    payload.append('idea', form.idea)
    selectedFiles.value.forEach((file) => payload.append('images', file))
    await api('/bookings', {
      method: 'POST',
      body: payload,
    })
    confirmation.value = '¡Solicitud enviada! Quedó guardada en la base de datos del estudio como pendiente. El equipo debe confirmar la fecha y el horario.'
    form.idea = ''
    form.time = ''
    setSelectedFiles([])
  } catch (error: unknown) {
    const detail = (error as { data?: { message?: string | string[] } }).data?.message
    formError.value = Array.isArray(detail) ? detail.join('. ') : detail ?? 'No se pudo enviar la solicitud. Comprueba tu conexión e inténtalo de nuevo.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.booking-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 30px;
}

.booking-aside {
  flex: 0 0 auto;
  margin: 0 0 8px;
  color: var(--studio-muted);
  font: 10px/2 'DM Mono', monospace;
  letter-spacing: .1em;
  text-transform: uppercase;
}

.booking-aside span {
  margin: 0 7px;
  color: var(--studio-red);
}

.booking-disclaimer {
  margin: 35px 0;
}

.booking-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(280px, .7fr);
  align-items: start;
  gap: 22px;
}

.booking-form {
  padding: clamp(22px, 4vw, 48px);
}

.booking-step {
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid var(--studio-line);
}

.booking-step__number {
  margin: 0 0 19px;
  color: var(--studio-red);
  font: 10px 'DM Mono', monospace;
  letter-spacing: .12em;
  text-transform: uppercase;
}

.booking-fields {
  display: grid;
  gap: 18px;
}

.booking-fields--two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.booking-time {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
  grid-column: 1 / -1;
}

.studio-field__legend {
  margin-bottom: 10px;
  color: var(--studio-paper);
  font: 10px 'DM Mono', monospace;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.booking-time__options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.booking-time__options label {
  display: grid;
  min-height: 43px;
  place-items: center;
  border: 1px solid var(--studio-line);
  color: var(--studio-muted);
  cursor: pointer;
  font: 11px 'DM Mono', monospace;
  transition: border-color .2s ease, color .2s ease, background .2s ease;
}

.booking-time__options label:hover,
.booking-time__options label.is-selected {
  border-color: var(--studio-red);
  background: rgba(201, 38, 41, .08);
  color: var(--studio-paper);
}

.booking-time__options input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.booking-time__options label:focus-within {
  outline: 1px solid var(--studio-red);
}

.booking-time__message {
  margin: 0;
  color: var(--studio-muted);
  font-size: 11px;
  line-height: 1.6;
}

.booking-time__message--error {
  color: #f09191;
}

.booking-time > p {
  margin: 10px 0 0;
  color: #858885;
  font-size: 11px;
  line-height: 1.6;
}

.booking-image-previews {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.booking-image-previews figure {
  min-width: 0;
  margin: 0;
  border: 1px solid var(--studio-line);
  background: rgba(0, 0, 0, .2);
}

.booking-image-previews img {
  display: block;
  width: 100%;
  height: 125px;
  object-fit: cover;
}

.booking-image-previews figcaption {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 8px;
  color: var(--studio-muted);
  font: 9px 'DM Mono', monospace;
}

.booking-image-previews figcaption span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.booking-image-previews button {
  flex: 0 0 auto;
  border: 0;
  background: none;
  color: #f09191;
  cursor: pointer;
  font: inherit;
}

.booking-idea {
  grid-column: 1 / -1;
}

.booking-character-count {
  align-self: end;
  color: var(--studio-muted);
  font: 9px 'DM Mono', monospace;
}

.booking-error {
  margin: 12px 0;
  color: #f09191;
  font-size: 12px;
  line-height: 1.6;
}

.booking-submit {
  width: 100%;
}

.booking-summary {
  position: sticky;
  top: 22px;
  padding: 27px;
}

.booking-summary .studio-eyebrow {
  margin-bottom: 16px;
}

.booking-summary h2 {
  margin: 0 0 25px;
  font: 500 clamp(30px, 3vw, 42px)/1.06 'Playfair Display', serif;
}

.booking-summary h2 em {
  color: var(--studio-red);
}

.booking-summary dl {
  margin: 0;
}

.booking-summary dl > div {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 0;
  border-top: 1px solid var(--studio-line);
}

.booking-summary dt {
  color: var(--studio-muted);
  font: 9px 'DM Mono', monospace;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.booking-summary dd {
  margin: 0;
  font-size: 11px;
  text-align: right;
}

.booking-summary__note {
  margin: 20px 0;
  color: var(--studio-muted);
  font-size: 11px;
  line-height: 1.7;
}

.booking-contact-link {
  color: var(--studio-paper);
  font: 9px 'DM Mono', monospace;
  letter-spacing: .09em;
  text-transform: uppercase;
}

.booking-contact-link:hover {
  color: var(--studio-red);
}

@media (max-width: 820px) {
  .booking-layout {
    grid-template-columns: 1fr;
  }

  .booking-summary {
    position: static;
  }
}

@media (max-width: 600px) {
  .booking-heading {
    align-items: start;
    flex-direction: column;
  }

  .booking-fields--two {
    grid-template-columns: 1fr;
  }

  .booking-time {
    grid-column: auto;
  }

  .booking-idea {
    grid-column: auto;
  }

  .booking-time__options {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
