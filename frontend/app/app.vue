<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <ClientOnly>
      <div class="kage-music">
        <div v-if="isPlaying" class="kage-music__player">
          <div class="kage-music__label">KAGE SOUND · ARCÁNGEL</div>
          <iframe
            :key="playerKey"
            :src="playerUrl"
            title="ACHO PR - fragmento de Arcángel"
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          />
        </div>
        <button
          class="kage-music__button"
          type="button"
          :aria-label="isPlaying ? 'Detener música' : 'Reproducir música de fondo'"
          @click="toggleMusic"
        >
          <span aria-hidden="true">{{ isPlaying ? 'Ⅱ' : '♫' }}</span>
          <span>{{ isPlaying ? 'DETENER' : 'MÚSICA' }}</span>
        </button>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const isPlaying = ref(true)
const playerKey = ref(0)
const videoId = 'ssdN7ZfavHs'
// La parte solicitada de Arcángel comienza en 04:20 (260 segundos).
const playerUrl = computed(() =>
  `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&start=260&controls=1&modestbranding=1&rel=0&playsinline=1`,
)

onMounted(() => {\n  // Intenta iniciar el fragmento automáticamente al cargar la web.\n  isPlaying.value = true\n})\n\nfunction toggleMusic() {
  if (isPlaying.value) {
    isPlaying.value = false
    return
  }
  playerKey.value += 1
  isPlaying.value = true
}
</script>

<style>
.kage-music {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  font-family: inherit;
}
.kage-music__button {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  min-height: 46px;
  padding: 0 18px;
  border: 1px solid #ff0000;
  border-radius: 999px;
  background: #101010;
  color: #fff;
  box-shadow: 0 5px 24px #0009;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.4px;
  cursor: pointer;
  transition: transform .2s ease, background .2s ease;
}
.kage-music__button:hover {
  transform: translateY(-2px);
  background: #ff0000;
}
.kage-music__button span:first-child {
  color: #ff0000;
  font-size: 19px;
  line-height: 1;
}
.kage-music__button:hover span:first-child {
  color: #fff;
}
.kage-music__player {
  width: min(280px, calc(100vw - 40px));
  overflow: hidden;
  border: 1px solid #ff0000;
  border-radius: 12px;
  background: #101010;
  box-shadow: 0 8px 30px #000b;
}
.kage-music__label {
  padding: 9px 12px;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.2px;
}
.kage-music__player iframe {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  border: 0;
}
@media (max-width: 600px) {
  .kage-music {
    right: 12px;
    bottom: 12px;
  }
  .kage-music__button {
    min-height: 42px;
    padding: 0 15px;
  }
}
</style>
