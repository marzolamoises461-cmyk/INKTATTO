<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <ClientOnly>
      <div class="kage-music">
        <div class="kage-music__player">
          <iframe
            :key="playerKey"
            :src="playerUrl"
            title="ACHO PR - fragmento de Arcángel"
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerpolicy="strict-origin-when-cross-origin"
          />
          <span class="kage-music__label">KAGE SOUND · ARCÁNGEL</span>
        </div>
        <button
          class="kage-music__button"
          type="button"
          :aria-label="isPlaying ? 'Detener música' : 'Reintentar música'"
          @click="toggleMusic"
        >
          {{ isPlaying ? 'Ⅱ' : '♫' }}
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
const playerUrl = computed(() =>
  `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&start=270&end=330&controls=1&modestbranding=1&rel=0&playsinline=1`,
)

onMounted(() => {
  isPlaying.value = true
})

function toggleMusic() {
  playerKey.value += 1
  isPlaying.value = true
}
</script>

<style>
.kage-music {
  position: fixed;
  right: 12px;
  bottom: 12px;
  z-index: 9999;
  display: flex;
  align-items: flex-end;
  gap: 6px;
  font-family: inherit;
}
.kage-music__player {
  width: 200px;
  height: 200px;
  overflow: hidden;
  border: 1px solid #ff0000;
  border-radius: 10px;
  background: #101010;
  box-shadow: 0 5px 18px #0009;
}
.kage-music__player iframe {
  display: block;
  width: 200px;
  height: 176px;
  border: 0;
}
.kage-music__label {
  display: block;
  height: 23px;
  padding: 5px 7px;
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .8px;
  text-align: center;
}
.kage-music__button {
  width: 38px;
  height: 38px;
  border: 1px solid #ff0000;
  border-radius: 50%;
  background: #101010;
  color: #ff0000;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
}
.kage-music__button:hover {
  background: #ff0000;
  color: #fff;
}
@media (max-width: 600px) {
  .kage-music {
    right: 8px;
    bottom: 8px;
  }
  .kage-music__player {
    width: 200px;
    height: 200px;
  }
}
</style>
