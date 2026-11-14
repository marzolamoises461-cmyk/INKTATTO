<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <ClientOnly>
      <audio
        ref="backgroundAudio"
        :src="currentTrack?.file"
        preload="auto"
        playsinline
        @play="isPlaying = true"
        @pause="isPlaying = false"
        @ended="playNext"
        @error="audioError = true"
      />

      <div v-if="showMusicPrompt" class="kage-music-overlay" role="dialog" aria-modal="true" aria-labelledby="kage-music-title">
        <div class="kage-music-card">
          <div class="kage-music-note" aria-hidden="true">♫</div>
          <p class="kage-music-eyebrow">KAGE TATTOO STUDIO</p>
          <h2 id="kage-music-title">¿Activamos la música?</h2>
          <p class="kage-music-description">Acompaña tu visita con nuestra selección musical.</p>
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

      <section v-if="musicEnabled" class="kage-player" :class="{ 'kage-player-expanded': playerExpanded }" aria-label="Reproductor musical KAGE">
        <button class="kage-player-main" type="button" @click="playerExpanded = !playerExpanded" :aria-expanded="playerExpanded">
          <span class="kage-player-disc" :class="{ spinning: isPlaying }">♫</span>
          <span class="kage-player-track">
            <strong>{{ currentTrack?.title || 'Biblioteca KAGE' }}</strong>
            <small>{{ currentTrack?.artist || 'Selecciona una canción' }} · {{ isPlaying ? 'REPRODUCIENDO' : 'EN PAUSA' }}</small>
          </span>
          <span class="kage-player-chevron">{{ playerExpanded ? '⌄' : '⌃' }}</span>
        </button>

        <div class="kage-player-controls">
          <button type="button" aria-label="Canción anterior" @click="playPrevious">|◀</button>
          <button class="kage-play-button" type="button" :aria-label="isPlaying ? 'Pausar' : 'Reproducir'" @click="togglePlayback">
            {{ isPlaying ? 'Ⅱ' : '▶' }}
          </button>
          <button type="button" aria-label="Canción siguiente" @click="playNext">▶|</button>
          <label class="kage-volume">VOL
            <input v-model.number="volume" type="range" min="0" max="1" step="0.05" @input="updateVolume">
          </label>
        </div>

        <div v-if="playerExpanded" class="kage-library">
          <div class="kage-library-heading">
            <strong>BIBLIOTECA MUSICAL</strong>
            <span>{{ tracks.length }} {{ tracks.length === 1 ? 'CANCIÓN' : 'CANCIONES' }}</span>
          </div>
          <div class="kage-categories">
            <button
              v-for="category in categories"
              :key="category"
              type="button"
              :class="{ active: selectedCategory === category }"
              @click="selectedCategory = category"
            >{{ category }}</button>
          </div>
          <button
            v-for="track in filteredTracks"
            :key="track.id"
            class="kage-track-row"
            :class="{ selected: currentTrack?.id === track.id }"
            type="button"
            @click="selectTrack(track)"
          >
            <span class="kage-track-play">{{ currentTrack?.id === track.id && isPlaying ? '♫' : '▶' }}</span>
            <span><strong>{{ track.title }}</strong><small>{{ track.artist }}</small></span>
            <small class="kage-track-category">{{ track.category }}</small>
          </button>
          <p v-if="!filteredTracks.length" class="kage-empty-category">Próximamente añadiremos canciones a esta categoría.</p>
          <p class="kage-library-hint">La biblioteca se amplía agregando archivos MP3 y registrándolos en <code>public/musica/playlist.json</code>.</p>
        </div>
        <p v-if="audioError" class="kage-player-error" role="status">No se pudo reproducir este archivo de audio.</p>
      </section>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

type MusicTrack = {
  id: string
  title: string
  artist: string
  category: string
  file: string
}

const backgroundAudio = ref<HTMLAudioElement | null>(null)
const tracks = ref<MusicTrack[]>([])
const currentIndex = ref(0)
const isPlaying = ref(false)
const audioError = ref(false)
const showMusicPrompt = ref(false)
const musicEnabled = ref(false)
const playerExpanded = ref(false)
const selectedCategory = ref('Todas')
const volume = ref(0.45)

const currentTrack = computed(() => tracks.value[currentIndex.value])
const categories = computed(() => ['Todas', ...new Set(tracks.value.map(track => track.category))])
const filteredTracks = computed(() => selectedCategory.value === 'Todas'
  ? tracks.value
  : tracks.value.filter(track => track.category === selectedCategory.value))

const playIndex = async (index: number) => {
  if (!tracks.value.length) return
  currentIndex.value = (index + tracks.value.length) % tracks.value.length
  audioError.value = false
  await new Promise(resolve => setTimeout(resolve, 0))
  const audio = backgroundAudio.value
  if (!audio) return
  audio.volume = volume.value
  try {
    await audio.play()
    isPlaying.value = true
  } catch (error) {
    console.error('KAGE music playback failed:', error)
    audioError.value = true
    isPlaying.value = false
  }
}

const enableMusic = async () => {
  musicEnabled.value = true
  showMusicPrompt.value = false
  await playIndex(currentIndex.value)
}

const togglePlayback = async () => {
  const audio = backgroundAudio.value
  if (!audio) return
  if (audio.paused) {
    if (!currentTrack.value) return
    try {
      audio.volume = volume.value
      await audio.play()
      isPlaying.value = true
      audioError.value = false
    } catch (error) {
      console.error('KAGE music playback failed:', error)
      audioError.value = true
    }
  } else {
    audio.pause()
    isPlaying.value = false
  }
}

const playNext = () => { void playIndex(currentIndex.value + 1) }
const playPrevious = () => { void playIndex(currentIndex.value - 1) }
const selectTrack = (track: MusicTrack) => {
  const index = tracks.value.findIndex(item => item.id === track.id)
  if (index >= 0) void playIndex(index)
}
const updateVolume = () => {
  if (backgroundAudio.value) backgroundAudio.value.volume = volume.value
}

onMounted(async () => {
  try {
    const playlist = await $fetch<{ tracks: MusicTrack[] }>('/musica/playlist.json')
    tracks.value = Array.isArray(playlist.tracks) ? playlist.tracks : []
  } catch (error) {
    console.error('KAGE playlist could not be loaded:', error)
    audioError.value = true
  }
  showMusicPrompt.value = true
})
</script>

<style>
.kage-music-overlay {
  position: fixed; inset: 0; z-index: 100000; display: grid; place-items: center;
  padding: 20px; background: rgba(0, 0, 0, .78); backdrop-filter: blur(7px);
}
.kage-music-card {
  width: min(100%, 390px); padding: 34px 28px 26px; border: 1px solid rgba(255, 0, 0, .65);
  border-radius: 18px; background: linear-gradient(145deg, #191919, #080808); color: #fff;
  text-align: center; box-shadow: 0 18px 60px rgba(0, 0, 0, .65), 0 0 28px rgba(255, 0, 0, .12);
}
.kage-music-note {
  display: grid; place-items: center; width: 58px; height: 58px; margin: 0 auto 15px;
  border: 1px solid #ff0000; border-radius: 50%; color: #ff0000; font-size: 30px;
}
.kage-music-eyebrow { margin: 0 0 9px; color: #ff0000; font: 800 10px/1.4 Arial,sans-serif; letter-spacing: 3px; }
.kage-music-card h2 { margin: 0 0 10px; color: #fff; font: 800 25px/1.2 Arial,sans-serif; }
.kage-music-description { margin: 0 0 23px; color: #c9c9c9; font: 14px/1.5 Arial,sans-serif; }
.kage-music-accept {
  width: 100%; padding: 14px 18px; border: 1px solid #ff0000; border-radius: 8px;
  background: #ff0000; color: #fff; font: 800 12px/1 Arial,sans-serif; letter-spacing: 1.2px; cursor: pointer;
}
.kage-music-accept:hover { background: #d90000; }
.kage-music-decline {
  margin-top: 14px; padding: 8px 12px; border: 0; background: transparent; color: #aaa;
  font: 600 10px/1.4 Arial,sans-serif; letter-spacing: 1px; cursor: pointer;
}
.kage-music-decline:hover { color: #fff; }
.kage-music-error,.kage-player-error { margin: 14px 0 0; color: #ff7777; font: 12px/1.4 Arial,sans-serif; }
.kage-player {
  position: fixed; right: 18px; bottom: 18px; z-index: 99999; width: min(360px, calc(100vw - 28px));
  overflow: hidden; border: 1px solid rgba(255,0,0,.55); border-radius: 14px;
  background: rgba(12,12,12,.97); color: #fff; box-shadow: 0 8px 32px rgba(0,0,0,.55);
  font-family: Arial,sans-serif;
}
.kage-player-main { display:flex; align-items:center; gap:11px; width:100%; padding:12px 14px; border:0; background:transparent; color:#fff; text-align:left; cursor:pointer; }
.kage-player-disc { display:grid; place-items:center; flex:0 0 38px; height:38px; border:1px solid #ff0000; border-radius:50%; color:#ff0000; font-size:21px; }
.kage-player-disc.spinning { animation:kage-spin 4s linear infinite; }
@keyframes kage-spin { to { transform:rotate(360deg); } }
.kage-player-track { display:grid; min-width:0; flex:1; gap:4px; }
.kage-player-track strong { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:13px; }
.kage-player-track small { color:#aaa; font-size:9px; letter-spacing:.8px; }
.kage-player-chevron { color:#ff0000; font-size:20px; }
.kage-player-controls { display:flex; align-items:center; justify-content:center; gap:18px; padding:0 14px 12px; }
.kage-player-controls button { border:0; background:transparent; color:#fff; font-size:15px; cursor:pointer; }
.kage-player-controls .kage-play-button { display:grid; place-items:center; width:34px; height:34px; border-radius:50%; background:#ff0000; font-weight:800; }
.kage-volume { display:flex; align-items:center; gap:6px; margin-left:auto; color:#aaa; font-size:9px; }
.kage-volume input { width:70px; accent-color:#ff0000; }
.kage-library { border-top:1px solid #333; padding:13px; }
.kage-library-heading { display:flex; justify-content:space-between; gap:8px; margin-bottom:10px; font-size:10px; letter-spacing:1px; }
.kage-library-heading span { color:#ff0000; font-size:9px; }
.kage-categories { display:flex; gap:6px; overflow-x:auto; padding-bottom:10px; }
.kage-categories button { flex:0 0 auto; padding:6px 9px; border:1px solid #444; border-radius:20px; background:#171717; color:#bbb; font-size:10px; cursor:pointer; }
.kage-categories button.active { border-color:#ff0000; background:#310909; color:#fff; }
.kage-track-row { display:flex; align-items:center; gap:10px; width:100%; padding:9px 7px; border:0; border-top:1px solid #292929; background:transparent; color:#fff; text-align:left; cursor:pointer; }
.kage-track-row.selected { background:rgba(255,0,0,.09); }
.kage-track-play { color:#ff0000; }
.kage-track-row span:nth-child(2) { display:grid; flex:1; gap:3px; }
.kage-track-row strong { font-size:11px; }
.kage-track-row small { color:#aaa; font-size:10px; }
.kage-track-row .kage-track-category { color:#ff7777; }
.kage-empty-category { color:#aaa; font-size:11px; text-align:center; }
.kage-library-hint { margin:10px 0 0; color:#777; font-size:9px; line-height:1.5; }
.kage-library-hint code { color:#ff7777; }
.kage-player-error { padding:0 13px 12px; }
@media (max-width:480px) {
  .kage-player { right:10px; bottom:10px; width:calc(100vw - 20px); }
}
</style>
