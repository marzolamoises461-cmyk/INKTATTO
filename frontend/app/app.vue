<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <ClientOnly>
      <div class="kage-music" :class="{ 'kage-music--expanded': expanded }">
        <div class="kage-music__player">
          <iframe
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
          :aria-label="expanded ? 'Reducir reproductor' : 'Ampliar reproductor'"
          @click="expanded = !expanded"
        >
          {{ expanded ? '−' : '↗' }}
        </button>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const expanded = ref(false)
const videoId = 'ssdN7ZfavHs'
const playerUrl = computed(() =>
  `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&start=240&end=340&loop=1&playlist=${videoId}&controls=1&modestbranding=1&rel=0&playsinline=1`,
)
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
  transition: width .2s ease, height .2s ease;
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
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
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
.kage-music--expanded .kage-music__player {
  width: min(640px, calc(100vw - 64px));
  height: auto;
  aspect-ratio: 16 / 10;
}
.kage-music--expanded .kage-music__player iframe {
  width: 100%;
  height: calc(100% - 23px);
  aspect-ratio: 16 / 9;
}
.kage-music--expanded .kage-music__label {
  height: 23px;
}
@media (max-width: 600px) {
  .kage-music {
    right: 8px;
    bottom: 8px;
  }
  .kage-music--expanded .kage-music__player {
    width: calc(100vw - 58px);
  }
}
</style>
