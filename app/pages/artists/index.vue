<template>
  <StudioLayout active="artists">
    <main class="studio-main artists-page">
      <p class="studio-eyebrow">Personas detrás de la tinta</p>
      <h1 class="studio-title">El equipo<br /><em>Kage.</em></h1>
      <p class="studio-lede">Un espacio para descubrir estilos, experiencia y trabajos. Los perfiles reales del equipo aún están pendientes de publicar.</p>

      <p class="studio-notice artists-notice">Los nombres, fotografías, años de experiencia y disponibilidad del equipo no están incluidos todavía. Estos perfiles de muestra no representan a personas reales del estudio.</p>

      <section class="artist-grid" aria-label="Perfiles del equipo">
        <article v-for="(artist, index) in artistProfiles" :key="artist.slug" class="artist-card">
          <NuxtLink class="artist-card__image" :to="`/artists/${artist.slug}`" :aria-label="`Consultar perfil de muestra ${artist.label}`">
            <img class="studio-image" :src="artist.image" :alt="`Imagen de referencia para ${artist.label}`" loading="lazy" />
            <span>KAGE / PERFIL {{ (index + 1).toString().padStart(2, '0') }}</span>
          </NuxtLink>
          <div class="artist-card__body">
            <div class="artist-card__heading">
              <div>
                <p class="artist-card__tag">Nombre por confirmar</p>
                <h2>{{ artist.label }}</h2>
              </div>
              <span class="artist-card__index">0{{ index + 1 }}</span>
            </div>
            <dl>
              <div><dt>Especialidad</dt><dd>{{ artist.specialty }}</dd></div>
              <div><dt>Experiencia</dt><dd>{{ artist.experience }}</dd></div>
            </dl>
            <div class="artist-card__actions">
              <NuxtLink class="studio-button studio-button--outline studio-button--small" :to="`/artists/${artist.slug}`">Consultar perfil <span>↗</span></NuxtLink>
              <NuxtLink class="artist-card__book" :to="`/booking?artist=${artist.slug}`">Reservar ↗</NuxtLink>
            </div>
          </div>
        </article>
      </section>
    </main>
  </StudioLayout>
</template>

<script setup lang="ts">
import StudioLayout from '../../components/StudioLayout.vue'
import { artistProfiles } from '../../data/studio'
</script>

<style scoped>
.artists-notice {
  max-width: 760px;
  margin: 35px 0 45px;
}

.artist-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.artist-card {
  overflow: hidden;
  border: 1px solid var(--studio-line);
  background: #101415;
}

.artist-card__image {
  position: relative;
  display: block;
  height: 340px;
  overflow: hidden;
  background: var(--studio-panel-light);
}

.artist-card__image img {
  transition: transform .5s ease;
}

.artist-card__image:hover img {
  transform: scale(1.04);
}

.artist-card__image::after {
  position: absolute;
  inset: 40% 0 0;
  background: linear-gradient(transparent, rgba(8, 9, 10, .8));
  content: '';
}

.artist-card__image > span {
  position: absolute;
  z-index: 1;
  bottom: 17px;
  left: 18px;
  color: var(--studio-paper);
  font: 9px 'DM Mono', monospace;
  letter-spacing: .12em;
}

.artist-card__body {
  padding: 22px;
}

.artist-card__heading {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.artist-card__tag {
  margin: 0 0 7px;
  color: var(--studio-red);
  font: 9px 'DM Mono', monospace;
  letter-spacing: .12em;
  text-transform: uppercase;
}

.artist-card h2 {
  margin: 0;
  font: 500 27px 'Playfair Display', serif;
}

.artist-card__index {
  color: var(--studio-red);
  font: 11px 'DM Mono', monospace;
}

.artist-card dl {
  margin: 20px 0;
}

.artist-card dl > div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 0;
  border-top: 1px solid var(--studio-line);
}

.artist-card dt {
  color: var(--studio-muted);
  font: 9px 'DM Mono', monospace;
  text-transform: uppercase;
}

.artist-card dd {
  margin: 0;
  font-size: 11px;
  text-align: right;
}

.artist-card__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.artist-card__book {
  color: var(--studio-paper);
  font: 9px 'DM Mono', monospace;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.artist-card__book:hover {
  color: var(--studio-red);
}

@media (max-width: 900px) {
  .artist-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .artist-grid {
    grid-template-columns: 1fr;
  }

  .artist-card__image {
    height: 76vw;
    max-height: 410px;
  }
}
</style>
