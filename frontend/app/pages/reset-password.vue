<template>
  <StudioLayout active="login">
    <main class="studio-main recovery-page">
      <section class="recovery-panel studio-card">
        <p class="studio-eyebrow">Seguridad de la cuenta</p>
        <h1 class="studio-title">Nueva<br /><em>contraseña.</em></h1>
        <form class="recovery-form" @submit.prevent="submit">
          <label class="studio-field">
            Contraseña nueva
            <input v-model="password" type="password" autocomplete="new-password" required minlength="8" maxlength="72" />
          </label>
          <label class="studio-field">
            Confirmar contraseña
            <input v-model="confirmation" type="password" autocomplete="new-password" required minlength="8" maxlength="72" />
          </label>
          <p v-if="message" class="studio-notice" role="status">{{ message }}</p>
          <button class="studio-button" type="submit" :disabled="loading || !resetToken">
            {{ loading ? 'Actualizando…' : 'Actualizar contraseña' }} <span>↗</span>
          </button>
          <NuxtLink to="/login" class="recovery-link">Volver a iniciar sesión</NuxtLink>
        </form>
      </section>
    </main>
  </StudioLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import StudioLayout from '../components/StudioLayout.vue'

const route = useRoute()
const { api } = useAuth()
const resetToken = ref('')
const password = ref('')
const confirmation = ref('')
const message = ref('')
const loading = ref(false)

onMounted(() => {
  resetToken.value = typeof route.query.token === 'string' ? route.query.token : ''
  if (!resetToken.value) message.value = 'El enlace no contiene un token válido. Solicita uno nuevo.'
})

async function submit() {
  message.value = ''
  if (password.value !== confirmation.value) {
    message.value = 'Las contraseñas no coinciden.'
    return
  }
  loading.value = true
  try {
    const result = await api<{ message: string }>('/auth/password/reset', {
      method: 'POST',
      body: { token: resetToken.value, password: password.value },
    })
    password.value = ''
    confirmation.value = ''
    message.value = result.message
  } catch (error: unknown) {
    const detail = (error as { data?: { message?: string } }).data?.message
    message.value = detail ?? 'No se pudo actualizar la contraseña. Solicita un nuevo enlace.'
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
