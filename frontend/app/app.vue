<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <ClientOnly>
      <audio
        ref="backgroundAudio"
        :src="audioSrc"
        loop
        preload="auto"
        playsinline
        @play="isPlaying = true"
        @pause="isPlaying = false"
        @error="audioError = true"
      />

      <button
        class="kage-music-toggle"
        type="button"
        :aria-label="isPlaying ? 'Pausar música' : 'Activar música de fondo'"
        @click="toggleMusic"
      >
        <span class="kage-music-icon" aria-hidden="true">{{ isPlaying ? '♫' : '♪' }}</span>
        <span>{{ isPlaying ? 'MÚSICA: ON' : 'ACTIVAR MÚSICA' }}</span>
      </button>
      <p v-if="audioError" class="kage-music-error" role="status">
        No se pudo cargar la canción. Actualiza la página e inténtalo de nuevo.
      </p>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const audioSrc = '/Lento%20-%20Koddy%20G%20(Video%20Oficial).mp3'
const backgroundAudio = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const audioError = ref(false)

const toggleMusic = async () => {
  const audio = backgroundAudio.value
  if (!audio) return

  audioError.value = false
  if (!audio.paused) {
    audio.pause()
    return
  }

  try {
    audio.volume = 0.45
    audio.currentTime = audio.currentTime || 0
    await audio.play()
  } catch (error) {
    console.error('KAGE background music playback failed:', error)
  }
}

let retryPlayback: (() => void) | undefined

onMounted(() => {
  const audio = backgroundAudio.value
  if (!audio) return

  audio.volume = 0.45
  // Intentar autoplay; si el navegador lo bloquea, el botón permite
  // iniciar el audio mediante un clic explícito del visitante.
  const attemptAutoplay = async () => {
    try {
      await audio.play()
      window.removeEventListener('pointerdown', attemptAutoplay)
      window.removeEventListener('keydown', attemptAutoplay)
      retryPlayback = undefined
    } catch {
      // El navegador requiere interacción. El botón visible lo resuelve.
    }
  }

  retryPlayback = attemptAutoplay
  void attemptAutoplay()
  window.addEventListener('pointerdown', attemptAutoplay, { once: true })
  window.addEventListener('keydown', attemptAutoplay, { once: true })
})

onBeforeUnmount(() => {
  if (retryPlayback) {
    window.removeEventListener('pointerdown', retryPlayback)
    window.removeEventListener('keydown', retryPlayback)
  }
})
</script>

<style>
.kage-music-toggle {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 99999;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 12px 16px;
  border: 1px solid rgba(255, 0, 0, 0.75);
  border-radius: 999px;
  background: rgba(12, 12, 12, 0.94);
  color: #fff;
  font: 700 11px/1 Arial, sans-serif;
  letter-spacing: 1px;
  cursor: pointer;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.4);
}
.kage-music-toggle:hover {
  background: #1d1d1d;
  border-color: #ff0000;
}
.kage-music-icon {
  color: #ff0000;
  font-size: 20px;
  line-height: 1;
}
.kage-music-error {
  position: fixed;
  right: 18px;
  bottom: 68px;
  z-index: 99999;
  max-width: 280px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #171717;
  color: #fff;
  font: 12px/1.4 Arial, sans-serif;
}
</style>
