<template>
  <StudioLayout active="login">
    <main class="studio-main login-page">
      <section class="login-panel studio-card">
        <div class="login-panel__intro">
          <p class="studio-eyebrow">Área de clientes</p>
          <h1 class="studio-title">Tu espacio<br /><em>personal.</em></h1>
          <p class="studio-lede">Accede a tu cuenta de INKTATTO para gestionar tus solicitudes de cita.</p>
          <p class="login-panel__note">Tus datos de cuenta se guardan de forma segura en el servidor del estudio. Las contraseñas se almacenan cifradas con bcrypt.</p>
        </div>

        <form class="login-form" @submit.prevent="submit">
          <h2 class="login-form__heading">{{ registering ? 'Crear cuenta' : 'Iniciar sesión' }}</h2>
          <label v-if="registering" class="studio-field">
            Nombre completo
            <input v-model.trim="fullName" autocomplete="name" required maxlength="120" />
          </label>
          <label class="studio-field">
            Correo electrónico
            <input v-model.trim="email" type="email" autocomplete="email" required maxlength="190" />
          </label>
          <label class="studio-field">
            Contraseña
            <input v-model="password" type="password" :autocomplete="registering ? 'new-password' : 'current-password'" required :minlength="registering ? 8 : 1" maxlength="72" />
          </label>
          <p v-if="message" class="studio-notice" role="status">{{ message }}</p>
          <button class="studio-button login-form__submit" type="submit" :disabled="loading">
            {{ loading ? 'Procesando…' : registering ? 'Crear cuenta' : 'Continuar' }} <span>↗</span>
          </button>
          <button class="login-form__switch" type="button" @click="registering = !registering; message = ''">
            {{ registering ? 'Ya tengo una cuenta · Iniciar sesión' : '¿No tienes cuenta? · Crear una' }}
          </button>
          <NuxtLink v-if="!registering" class="login-form__recovery" to="/forgot-password">
            Olvidé mi contraseña
          </NuxtLink>
        </form>
      </section>
      <p class="login-footer">¿Ya tienes una idea? <NuxtLink to="/booking">Reserva una consulta <span>↗</span></NuxtLink></p>
    </main>
  </StudioLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import StudioLayout from '../components/StudioLayout.vue'

const { user, login, register, initialize } = useAuth()
const fullName = ref('')
const email = ref('')
const password = ref('')
const message = ref('')
const registering = ref(false)
const loading = ref(false)

onMounted(async () => {
  await initialize()
  if (user.value) await navigateTo('/profile')
})

async function submit() {
  message.value = ''
  loading.value = true
  try {
    if (registering.value) await register(fullName.value, email.value, password.value)
    else await login(email.value, password.value)
    password.value = ''
    await navigateTo('/profile')
  } catch (error: unknown) {
    const data = (error as { data?: { message?: string | string[] } }).data
    const detail = data?.message
    message.value = Array.isArray(detail) ? detail.join('. ') : detail ?? 'No se pudo completar el acceso. Revisa tus datos y que la API esté encendida.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page { display: grid; min-height: min(760px, calc(100vh - 170px)); align-content: center; }
.login-panel { display: grid; width: min(100%, 940px); grid-template-columns: 1fr .8fr; gap: clamp(35px, 8vw, 100px); margin: 0 auto; padding: clamp(27px, 6vw, 65px); }
.login-panel__intro .studio-title { font-size: clamp(47px, 6vw, 75px); }
.login-panel__note { margin-top: 23px; padding-left: 14px; border-left: 1px solid var(--studio-red); color: var(--studio-muted); font-size: 11px; line-height: 1.8; }
.login-form { display: flex; align-self: center; flex-direction: column; gap: 19px; }
.login-form__heading { margin: 0; font: 500 27px 'Playfair Display', serif; }
.login-form__submit { justify-content: space-between; }
.login-form__submit:disabled { opacity: .6; cursor: wait; }
.login-form__switch, .login-footer { border: 0; background: none; color: var(--studio-muted); cursor: pointer; font: 10px/1.8 'DM Mono', monospace; letter-spacing: .04em; text-align: left; }
.login-form__recovery { color: var(--studio-muted); font: 10px/1.8 'DM Mono', monospace; }
.login-form__recovery:hover { color: var(--studio-paper); }
.login-form__switch:hover, .login-footer a:hover { color: var(--studio-paper); }
.login-footer { width: min(100%, 940px); margin: 19px auto 0; }
.login-footer a, .login-footer a span { color: var(--studio-paper); }
.login-footer a span { color: var(--studio-red); }
@media (max-width: 700px) {
  .login-page { min-height: auto; align-content: start; }
  .login-panel { grid-template-columns: 1fr; gap: 30px; padding: 25px 20px; }
}
</style>
