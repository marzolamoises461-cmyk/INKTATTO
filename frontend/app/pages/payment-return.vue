<template>
  <StudioLayout>
    <main class="studio-main payment-return">
      <p class="studio-eyebrow">Anticipo · Wompi</p>
      <h1 class="studio-title">Estado del<br /><em>pago.</em></h1>
      <p class="studio-lede" role="status">{{ message }}</p>
      <button class="studio-button" type="button" :disabled="loading" @click="checkStatus">
        {{ loading ? 'Consultando…' : 'Consultar estado confirmado' }} <span>↗</span>
      </button>
      <NuxtLink class="payment-return__link" to="/profile">Volver a mis solicitudes</NuxtLink>
    </main>
  </StudioLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import StudioLayout from '../components/StudioLayout.vue'

const route = useRoute()
const { user, api, initialize } = useAuth()
const message = ref('El retorno de Wompi no confirma por sí solo un pago.')
const loading = ref(false)

onMounted(async () => {
  await initialize()
  await checkStatus()
})

async function checkStatus(): Promise<void> {
  const bookingId = Number(route.query.bookingId)
  if (!Number.isSafeInteger(bookingId) || bookingId < 1) {
    message.value = 'No se encontró una cita válida para consultar.'
    return
  }
  if (!user.value) {
    message.value = 'Inicia sesión para consultar el estado de tu anticipo.'
    return
  }
  loading.value = true
  try {
    const result = await api<{ status: string }>(`/payments/bookings/${bookingId}`)
    message.value = result.status === 'approved'
      ? 'Wompi confirmó el pago. El estudio actualizará el seguimiento de tu cita.'
      : result.status === 'pending'
        ? 'El pago sigue pendiente. Este estado solo cambiará cuando el backend verifique el evento de Wompi.'
        : result.status === 'not_started'
          ? 'No hay un pago registrado para esta cita.'
          : `Wompi reporta el estado: ${result.status}.`
  } catch {
    message.value = 'No se pudo consultar el estado del pago. Inténtalo nuevamente más tarde.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.payment-return { display: grid; min-height: min(680px, calc(100vh - 170px)); align-content: center; justify-items: start; gap: 18px; }
.payment-return__link { color: var(--studio-muted); font: 10px 'DM Mono', monospace; letter-spacing: .1em; text-transform: uppercase; }
</style>
