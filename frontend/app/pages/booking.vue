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
                  <option v-for="artist in artists" :key="artist.id" :value="String(artist.id)">{{ artist.name }} · {{ artist.specialty }}</option>
                </select>
              </label>
              <label class="studio-field">
                Fecha preferida *
                <input v-model="form.date" name="date" type="date" :min="minDate" required />
              </label>
              <fieldset class="booking-time">
                <legend class="studio-field__legend">Horario preferido *</legend>
                <p v-if="loadingSlots">Consultando disponibilidad…</p><p v-else-if="!form.artist || !form.date">Selecciona artista y fecha para ver horarios.</p><p v-else-if="!timeSlots.length">No hay horarios disponibles.</p><div v-else class="booking-time__options">
                  <label v-for="time in timeSlots" :key="time" :class="{ 'is-selected': form.time === time }">
                    <input v-model="form.time" type="radio" name="time" :value="time" required />
                    <span>{{ time }}</span>
                  </label>
                </div>
                <p>Opciones orientativas; el estudio debe confirmar disponibilidad.</p>
              </fieldset>
            </div>
          </section>

          <section class="booking-step">
            <p class="booking-step__number">03 / Tu idea</p>
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
          <button class="studio-button booking-submit" type="submit" :disabled="submitting">{{ submitting ? 'Enviando…' : 'Enviar solicitud al estudio' }} <span>↗</span></button>
        </form>

        <aside class="booking-summary studio-card">
          <p class="studio-eyebrow">Resumen</p>
          <h2>Tu consulta<br /><em>empieza aquí.</em></h2>
          <dl>
            <div><dt>Artista</dt><dd>{{ artistLabel || 'Por elegir' }}</dd></div>
            <div><dt>Fecha</dt><dd>{{ formattedDate || 'Por elegir' }}</dd></div>
            <div><dt>Horario</dt><dd>{{ form.time || 'Por elegir' }}</dd></div>
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
const timeSlots = ref<string[]>([])\nconst artists = ref<Array<{id:number;name:string;specialty:string}>>([])\nconst referenceImages = ref<File[]>([])\nconst loadingSlots = ref(false)
const bodyAreas = ['Brazo', 'Espalda', 'Pierna', 'Hombro', 'Pecho', 'Costillas', 'Otra zona']
const sizes = ['Pequeño · hasta 8 cm', 'Mediano · 8–18 cm', 'Grande · más de 18 cm', 'Por definir en consulta']
const form = reactive({ name: '', email: '', artist: '', date: '', time: '', bodyArea: '', size: '', idea: '' })
const minDate = ref('')
const confirmation = ref('')
const formError = ref('')
const submitting = ref(false)

onMounted(async () => {
  const today = new Date()
  minDate.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const requestedArtist = Number(route.query.artistId ?? '')
  try { artists.value = await api('/staff') as typeof artists.value; if (artists.value.some(artist => artist.id === requestedArtist)) form.artist = String(requestedArtist) } catch { formError.value = 'No se pudo cargar la lista de artistas.' }
  await initialize()
  if (user.value) {
    form.name = user.value.fullName
    form.email = user.value.email
  }
})

const artistLabel = computed(() => artists.value.find((artist) => String(artist.id) === form.artist)?.name ?? '')
watch([() => form.artist, () => form.date], loadAvailability)\n\nasync function loadAvailability() {\n  form.time = ''; timeSlots.value = [];\n  if (!form.artist || !form.date) return;\n  loadingSlots.value = true;\n  try { const result = await api(`/bookings/availability?artistId=${encodeURIComponent(form.artist)}&date=${encodeURIComponent(form.date)}`) as {slots:string[]}; timeSlots.value = result.slots; }\n  catch (error: unknown) { formError.value = (error as {data?:{message?:string}}).data?.message ?? 'No se pudo consultar la agenda.'; }\n  finally { loadingSlots.value = false; }\n}\nfunction onImagesSelected(event: Event) {\n  const input = event.target as HTMLInputElement; const files = Array.from(input.files ?? []);\n  if (files.length > 5) { formError.value = 'Puedes seleccionar máximo 5 imágenes.'; input.value = ''; return; }\n  if (files.some(file => !['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 5*1024*1024)) { formError.value = 'Cada imagen debe ser JPG, PNG o WEBP y pesar máximo 5 MB.'; input.value = ''; return; }\n  referenceImages.value = files;\n}\n\nconst formattedDate = computed(() => form.date
  ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'long' }).format(new Date(`${form.date}T12:00:00`))
  : '')

async function submitRequest() {
  formError.value = ''
  confirmation.value = ''
  if (!user.value) {
    formError.value = 'Completa tus datos de contacto para enviar la solicitud.'
    return
  }
  if (!form.artist || !form.date || !form.time || !form.bodyArea || !form.size || form.idea.length < 10) {
    formError.value = 'Completa todos los campos obligatorios. La idea debe tener al menos 10 caracteres.'
    return
  }
  if (form.date < minDate.value) {
    formError.value = 'Elige una fecha de hoy o posterior.'
    return
  }
  submitting.value = true
  try {
    await api('/bookings', {
      method: 'POST',
      body: {
        artistId: Number(form.artist),
        date: form.date,
        time: form.time,
        bodyArea: form.bodyArea,
        size: form.size,
        idea: form.idea,
      },
    })
    confirmation.value = '¡Solicitud enviada! Quedó guardada en la base de datos del estudio como pendiente. El equipo debe confirmar la fecha y el horario.'
    form.idea = ''
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
  background: rgba(255, 0, 0, .08);
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

.booking-time > p {
  margin: 10px 0 0;
  color: #858885;
  font-size: 11px;
  line-height: 1.6;
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
