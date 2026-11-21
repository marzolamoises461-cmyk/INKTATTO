<template>
  <StudioLayout active="contact">
    <main class="studio-main contact-page">
      <header>
        <p class="studio-eyebrow">Estamos para escucharte</p>
        <h1 class="studio-title">Hablemos de<br /><em>tu idea.</em></h1>
        <p class="studio-lede">Escríbenos para conversar sobre una pieza, el proceso o una consulta. Tu mensaje se guardará para que el estudio pueda responderte.</p>
      </header>

      <div class="contact-layout">
        <form class="contact-form studio-card" @submit.prevent="sendMessage">
          <p class="studio-eyebrow">Cuéntanos</p>
          <label class="studio-field">
            Tu nombre *
            <input v-model.trim="form.name" autocomplete="name" required maxlength="100" />
          </label>
          <label class="studio-field">
            Correo electrónico *
            <input v-model.trim="form.email" type="email" autocomplete="email" required maxlength="254" />
          </label>
          <label class="studio-field">
            Mensaje *
            <textarea v-model.trim="form.message" required minlength="10" maxlength="1500" placeholder="¿Qué te gustaría saber o crear?" />
          </label>
          <p v-if="message" class="studio-notice" :role="isError ? 'alert' : 'status'">{{ message }}</p>
          <button class="studio-button contact-submit" type="submit" :disabled="sending">
            {{ sending ? 'Enviando…' : 'Enviar mensaje' }} <span>↗</span>
          </button>
        </form>

        <aside class="contact-information">
          <section>
            <p class="studio-eyebrow">Contacto directo</p>
            <a href="mailto:hola@kagetattoo.es" class="contact-value">hola@kagetattoo.es <span>↗</span></a>
            <p class="contact-caption">Correo publicado en el sitio.</p>
          </section>
          <section>
            <p class="studio-eyebrow">Teléfono</p>
            <p class="contact-value">No publicado</p>
            <p class="contact-caption">Consulta por correo si necesitas otro canal.</p>
          </section>
          <section>
            <p class="studio-eyebrow">Estudio</p>
            <p class="contact-value">Madrid</p>
            <p class="contact-caption">La dirección concreta no está publicada.</p>
          </section>
          <section>
            <p class="studio-eyebrow">Horarios</p>
            <p class="contact-value">Por confirmar</p>
            <p class="contact-caption">Contacta con el estudio para consultar disponibilidad.</p>
          </section>
          <section>
            <p class="studio-eyebrow">Redes sociales</p>
            <a class="contact-value" href="https://www.instagram.com/kage.tattoo/" target="_blank" rel="noreferrer">@kage.tattoo <span>↗</span></a>
            <p class="contact-caption">Perfil enlazado desde la portada actual.</p>
          </section>
        </aside>
      </div>
    </main>
  </StudioLayout>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import StudioLayout from '../components/StudioLayout.vue'

const { api } = useAuth()
const form = reactive({ name: '', email: '', message: '' })
const message = ref('')
const isError = ref(false)
const sending = ref(false)

async function sendMessage() {
  if (sending.value) return
  sending.value = true
  message.value = ''
  isError.value = false
  try {
    const result = await api<{ message: string }>('/contact', { method: 'POST', body: form })
    message.value = result.message
    form.name = ''
    form.email = ''
    form.message = ''
  } catch (error: unknown) {
    const detail = (error as { data?: { message?: string | string[] } }).data?.message
    message.value = Array.isArray(detail) ? detail.join('. ') : detail ?? 'No se pudo enviar el mensaje. Inténtalo más tarde.'
    isError.value = true
  } finally {
    sending.value = false
  }
}
</script>

<style scoped>
.contact-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(290px, .8fr);
  gap: clamp(35px, 8vw, 110px);
  margin-top: 55px;
}

.contact-form {
  display: grid;
  gap: 18px;
  padding: clamp(23px, 4vw, 43px);
}

.contact-form .studio-eyebrow {
  margin-bottom: 3px;
}

.contact-submit {
  justify-content: space-between;
}

.contact-information {
  display: grid;
  align-content: start;
  gap: 0;
}

.contact-information section {
  padding: 20px 0;
  border-bottom: 1px solid var(--studio-line);
}

.contact-information section:first-child {
  padding-top: 0;
}

.contact-value {
  display: inline-block;
  margin: 0;
  font: 500 clamp(19px, 2vw, 25px) 'Playfair Display', serif;
}

.contact-value span {
  color: var(--studio-red);
  font: 15px 'DM Mono', monospace;
}

.contact-caption {
  margin: 7px 0 0;
  color: var(--studio-muted);
  font-size: 11px;
  line-height: 1.6;
}

@media (max-width: 750px) {
  .contact-layout {
    grid-template-columns: 1fr;
  }
}
</style>
