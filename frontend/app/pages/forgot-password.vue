<template>
  <StudioLayout active="login">
    <main class="studio-main recovery-page">
      <section class="recovery-panel studio-card">
        <p class="studio-eyebrow">Seguridad de la cuenta</p>
        <h1 class="studio-title">Recupera tu<br /><em>acceso.</em></h1>
        <p class="studio-lede">Te enviaremos un enlace de un solo uso si encontramos una cuenta activa con ese correo.</p>
        <form class="recovery-form" @submit.prevent="submit">
          <label class="studio-field">
            Correo electrónico
            <input v-model.trim="email" type="email" autocomplete="email" required maxlength="190" />
          </label>
          <p v-if="message" class="studio-notice" role="status">{{ message }}</p>
          <button class="studio-button" type="submit" :disabled="loading">
            {{ loading ? 'Enviando…' : 'Enviar instrucciones' }} <span>↗</span>
          </button>
          <NuxtLink to="/login" class="recovery-link">Volver a iniciar sesión</NuxtLink>
        </form>
      </section>
    </main>
  </StudioLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import StudioLayout from '../components/StudioLayout.vue'

const { api } = useAuth()
const email = ref('')
const message = ref('')
const loading = ref(false)

async function submit() {
  loading.value = true
  message.value = ''
  try {
    const result = await api<{ message: string }>('/auth/password/forgot', {
      method: 'POST',
      body: { email: email.value },
    })
    message.value = result.message
  } catch (error: unknown) {
    const detail = (error as { data?: { message?: string } }).data?.message
    message.value = detail ?? 'No se pudo enviar el correo. Comprueba la configuración de correo del estudio.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.recovery-page { display: grid; min-height: min(700px, calc(100vh - 170px)); align-content: center; }
.recovery-panel { width: min(100%, 560px); margin: 0 auto; padding: clamp(26px, 6vw, 55px); }
.recovery-panel .studio-title { font-size: clamp(44px, 7vw, 70px); }
.recovery-panel .studio-title em { color: var(--studio-red); }
.recovery-form { display: grid; gap: 18px; margin-top: 30px; }
.recovery-form .studio-button { justify-content: space-between; }
.recovery-form .studio-button:disabled { opacity: .6; cursor: wait; }
.recovery-link { color: var(--studio-muted); font: 10px 'DM Mono', monospace; }
</style>
