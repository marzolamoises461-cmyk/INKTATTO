<template>
  <StudioLayout active="login">
    <main class="studio-main verify-page">
      <section class="studio-card verify-card">
        <p class="studio-eyebrow">Verificación de cuenta</p>
        <h1 class="studio-title">Tu correo,<br /><em>confirmado.</em></h1>
        <p class="studio-lede" role="status">{{ message }}</p>
        <NuxtLink v-if="verified" class="studio-button" to="/login">Iniciar sesión <span>↗</span></NuxtLink>
        <NuxtLink v-else class="studio-button" to="/login">Volver a iniciar sesión <span>↗</span></NuxtLink>
      </section>
    </main>
  </StudioLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import StudioLayout from '../components/StudioLayout.vue'

const route = useRoute()
const { api } = useAuth()
const message = ref('Verificando el enlace…')
const verified = ref(false)

onMounted(async () => {
  const token = route.query.token
  if (typeof token !== 'string' || !token) {
    message.value = 'El enlace de verificación no es válido.'
    return
  }

  try {
    const response = await api<{ message: string }>('/auth/email/verify', {
      method: 'POST',
      body: { token },
    })
    message.value = response.message
    verified.value = true
  } catch {
    message.value = 'El enlace de verificación no es válido o expiró. Puedes solicitar uno nuevo desde la pantalla de acceso.'
  }
})
</script>

<style scoped>
.verify-page { display: grid; min-height: min(680px, calc(100vh - 170px)); place-items: center; }
.verify-card { width: min(100%, 620px); padding: clamp(30px, 7vw, 65px); }
.verify-card .studio-title { font-size: clamp(48px, 7vw, 78px); }
.verify-card .studio-button { margin-top: 25px; }
</style>
