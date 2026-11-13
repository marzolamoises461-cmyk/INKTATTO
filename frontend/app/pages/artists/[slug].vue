<template>
  <StudioLayout active="artists">
    <main class="studio-main artist-profile">
      <NuxtLink class="artist-profile__back" to="/artists">← Volver al equipo</NuxtLink>
      <section class="artist-profile__hero">
        <img class="studio-image" :src="artist.image" :alt="`Imagen de referencia para ${artist.label}`" />
        <div>
          <p class="studio-eyebrow">Perfil de muestra · Datos pendientes</p>
          <h1 class="studio-title">{{ artist.label }}<br /><em>Kage Tattoo.</em></h1>
          <p class="studio-lede">Este perfil es una plantilla. El nombre, fotografía, biografía y trayectoria deben ser completados con información autorizada del equipo real.</p>
          <p class="artist-profile__specialty"><span>Especialidad</span>{{ artist.specialty }}</p>
          <p class="artist-profile__specialty"><span>Experiencia</span>{{ artist.experience }}</p>
          <NuxtLink class="studio-button" :to="`/booking?artist=${artist.slug}`">Consultar una sesión <span>↗</span></NuxtLink>
        </div>
      </section>
      <section class="artist-profile__work">
        <div class="artist-profile__work-heading">
          <div>
            <p class="studio-eyebrow">Trabajos de referencia</p>
            <h2>Una práctica<br /><em>en construcción.</em></h2>
          </div>
          <NuxtLink class="studio-button studio-button--outline" to="/gallery">Explorar la colección <span>↗</span></NuxtLink>
        </div>
        <p class="artist-profile__sample-note">Estos diseños ilustran la especialidad y no están atribuidos a una persona real.</p>
        <div class="artist-profile__samples">
          <NuxtLink v-for="design in sampleDesigns" :key="design.slug" :to="`/gallery/${design.slug}`">
            <img class="studio-image" :src="design.image" :alt="design.imageAlt" loading="lazy" />
            <span>{{ design.category }}</span>
            <h3>{{ design.name }}</h3>
          </NuxtLink>
        </div>
      </section>
    </main>
  </StudioLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import StudioLayout from '../../components/StudioLayout.vue'
import { artistProfiles, designs } from '../../data/studio'

const route = useRoute()
const artist = computed(() => artistProfiles.find((profile) => profile.slug === String(route.params.slug ?? '')) ?? artistProfiles[0]!)
const sampleCategories: Record<string, string[]> = {
  'artista-01': ['Dragones', 'Samuráis'],
  'artista-02': ['Hannya', 'Serpientes'],
  'artista-03': ['Koi', 'Sakura'],
}
const sampleDesigns = computed(() => designs.filter((design) => sampleCategories[artist.value.slug]?.includes(design.category)))
</script>

<style scoped>
.artist-profile__back {
  display: inline-block;
  margin-bottom: 28px;
  color: var(--studio-muted);
  font: 10px 'DM Mono', monospace;
  letter-spacing: .1em;
  text-transform: uppercase;
}

.artist-profile__hero {
  display: grid;
  grid-template-columns: minmax(0, .9fr) minmax(320px, 1fr);
  gap: 8vw;
  align-items: center;
}

.artist-profile__hero > img {
  min-height: 560px;
  max-height: 680px;
}

.artist-profile__hero .studio-title {
  font-size: clamp(48px, 6.6vw, 88px);
}

.artist-profile__specialty {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 14px 0;
  border-top: 1px solid var(--studio-line);
  font-size: 12px;
}

.artist-profile__specialty span {
  color: var(--studio-muted);
  font: 9px 'DM Mono', monospace;
  text-transform: uppercase;
}

.artist-profile__work {
  margin-top: 100px;
  padding-top: 35px;
  border-top: 1px solid var(--studio-line);
}

.artist-profile__work-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 25px;
}

.artist-profile__work h2 {
  margin: 0;
  font: 500 clamp(34px, 5vw, 64px)/1 'Playfair Display', serif;
}

.artist-profile__work h2 em {
  color: var(--studio-red);
}

.artist-profile__sample-note {
  color: var(--studio-muted);
  font-size: 11px;
  line-height: 1.6;
}

.artist-profile__samples {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.artist-profile__samples a {
  position: relative;
  display: flex;
  min-height: 280px;
  flex-direction: column;
  justify-content: end;
  overflow: hidden;
  padding: 18px;
  background: var(--studio-panel-light);
}

.artist-profile__samples a::after {
  position: absolute;
  inset: 35% 0 0;
  background: linear-gradient(transparent, rgba(4, 5, 5, .9));
  content: '';
}

.artist-profile__samples img {
  position: absolute;
  inset: 0;
  transition: transform .35s ease;
}

.artist-profile__samples a:hover img {
  transform: scale(1.04);
}

.artist-profile__samples span,
.artist-profile__samples h3 {
  position: relative;
  z-index: 1;
}

.artist-profile__samples span {
  color: #f06464;
  font: 9px 'DM Mono', monospace;
  text-transform: uppercase;
}

.artist-profile__samples h3 {
  margin: 7px 0 0;
  font: 500 23px 'Playfair Display', serif;
}

@media (max-width: 760px) {
  .artist-profile__hero {
    grid-template-columns: 1fr;
  }

  .artist-profile__hero > img {
    min-height: 380px;
    height: 90vw;
  }

  .artist-profile__work-heading {
    align-items: start;
    flex-direction: column;
  }

  .artist-profile__samples {
    grid-template-columns: 1fr;
  }
}
</style>
