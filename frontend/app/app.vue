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

      <div v-if="showMusicPrompt" class="kage-music-overlay" role="dialog" aria-modal="true" aria-labelledby="kage-music-title">
        <div class="kage-music-card">
          <div class="kage-music-note" aria-hidden="true">♫</div>
          <p class="kage-music-eyebrow">KAGE TATTOO STUDIO</p>
          <h2 id="kage-music-title">¿Activamos la música?</h2>
          <p class="kage-music-description">Acompaña tu visita con “Lento” – Koddy G.</p>
          <button class="kage-music-accept" type="button" @click="enableMusic">
            ACTIVAR MÚSICA
          </button>
          <button class="kage-music-decline" type="button" @click="showMusicPrompt = false">
            CONTINUAR SIN MÚSICA
          </button>
          <p v-if="audioError" class="kage-music-error" role="alert">
            No se pudo cargar la canción. Inténtalo de nuevo.
          </p>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const audioSrc = '/Lento%20-%20Koddy%20G%20(Video%20Oficial).mp3'
const backgroundAudio = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const audioError = ref(false)
const showMusicPrompt = ref(false)

const enableMusic = async () => {
  const audio = backgroundAudio.value
  if (!audio) return

  audioError.value = false
  try {
    audio.volume = 0.45
    await audio.play()
    showMusicPrompt.value = false
  } catch (error) {
    console.error('KAGE background music playback failed:', error)
    audioError.value = true
  }
}

onMounted(() => {
  // Mostrar la invitación al entrar. El navegador exige que el visitante
  // pulse el botón; no existe un permiso nativo para audio de fondo.
  showMusicPrompt.value = true
})
</script>

<style>
.kage-music-overlay {
  position: fixed;
  inset: 0;
  z-index: 100000;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.78);
  backdrop-filter: blur(7px);
}
.kage-music-card {
  width: min(100%, 390px);
  padding: 34px 28px 26px;
  border: 1px solid rgba(255, 0, 0, 0.65);
  border-radius: 18px;
  background: linear-gradient(145deg, #191919, #080808);
  color: #fff;
  text-align: center;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.65), 0 0 28px rgba(255, 0, 0, 0.12);
}
.kage-music-note {
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  margin: 0 auto 15px;
  border: 1px solid #ff0000;
  border-radius: 50%;
  color: #ff0000;
  font-size: 30px;
}
.kage-music-eyebrow {
  margin: 0 0 9px;
  color: #ff0000;
  font: 800 10px/1.4 Arial, sans-serif;
  letter-spacing: 3px;
}
.kage-music-card h2 {
  margin: 0 0 10px;
  color: #fff;
  font: 800 25px/1.2 Arial, sans-serif;
}
.kage-music-description {
  margin: 0 0 23px;
  color: #c9c9c9;
  font: 14px/1.5 Arial, sans-serif;
}
.kage-music-accept {
  width: 100%;
  padding: 14px 18px;
  border: 1px solid #ff0000;
  border-radius: 8px;
  background: #ff0000;
  color: #fff;
  font: 800 12px/1 Arial, sans-serif;
  letter-spacing: 1.2px;
  cursor: pointer;
}
.kage-music-accept:hover {
  background: #d90000;
}
.kage-music-decline {
  margin-top: 14px;
  padding: 8px 12px;
  border: 0;
  background: transparent;
  color: #aaa;
  font: 600 10px/1.4 Arial, sans-serif;
  letter-spacing: 1px;
  cursor: pointer;
}
.kage-music-decline:hover {
  color: #fff;
}
.kage-music-error {
  margin: 14px 0 0;
  color: #ff7777;
  font: 12px/1.4 Arial, sans-serif;
}
</style>
