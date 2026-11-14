<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <ClientOnly>
      <audio
        ref="backgroundAudio"
        :src="audioSrc"
        autoplay
        loop
        preload="auto"
        aria-hidden="true"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const audioSrc = '/Lento%20-%20Koddy%20G%20(Video%20Oficial).mp3'
const backgroundAudio = ref<HTMLAudioElement | null>(null)

let retryPlayback: (() => void) | undefined

onMounted(() => {
  const audio = backgroundAudio.value
  if (!audio) return

  audio.volume = 0.35

  const startPlayback = async () => {
    try {
      await audio.play()
      window.removeEventListener('pointerdown', startPlayback)
      window.removeEventListener('keydown', startPlayback)
      retryPlayback = undefined
    } catch {
      // Los navegadores pueden bloquear el autoplay con sonido.
      // Se vuelve a intentar tras la primera interacción del visitante.
    }
  }

  retryPlayback = startPlayback
  void startPlayback()
  window.addEventListener('pointerdown', startPlayback)
  window.addEventListener('keydown', startPlayback)
})

onBeforeUnmount(() => {
  if (retryPlayback) {
    window.removeEventListener('pointerdown', retryPlayback)
    window.removeEventListener('keydown', retryPlayback)
  }
})
</script>

<style>
/* Reproductor de fondo: no ocupa espacio ni muestra controles. */
audio[aria-hidden='true'] {
  display: none;
}
</style>
