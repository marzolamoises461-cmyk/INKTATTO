<template>
  <StudioLayout active="gallery">
    <main v-if="design" class="studio-main detail-page">
      <NuxtLink class="detail-back" to="/gallery">← Volver a trabajos</NuxtLink>
      <section class="detail-hero">
        <div class="detail-image">
          <img class="studio-image" :src="design.image" :alt="design.imageAlt" />
          <span class="detail-image__caption">KAGE · {{ design.category }}</span>
        </div>
        <div class="detail-copy">
          <p class="studio-eyebrow">{{ design.category }} · Archivo de diseño</p>
          <h1 class="studio-title">{{ design.name }}</h1>
          <p class="detail-description">{{ design.description }}</p>
          <button
            class="studio-button studio-button--outline detail-favorite"
            type="button"
            :aria-pressed="isFavorite"
            @click="toggle"
          >{{ isFavorite ? '♥ Guardado en favoritos' : '♡ Guardar diseño' }}</button>
          <p v-if="storageMessage" class="studio-notice" role="status">{{ storageMessage }}</p>
          <NuxtLink class="studio-button detail-booking" to="/booking">Reservar sesión <span>↗</span></NuxtLink>
          <p class="detail-note">La disponibilidad y la duración final se confirman durante la consulta.</p>
        </div>
      </section>

      <section class="detail-information">
        <div>
          <p class="studio-eyebrow">Detrás del símbolo</p>
          <h2>Su <em>significado.</em></h2>
          <p>{{ design.meaning }}</p>
        </div>
        <dl>
          <div><dt>Estilo artístico</dt><dd>{{ design.style }}</dd></div>
          <div><dt>Zona recomendada</dt><dd>{{ design.bodyArea }}</dd></div>
          <div><dt>Tiempo estimado</dt><dd>{{ design.duration }}</dd></div>
        </dl>
      </section>

      <section class="related-section">
        <div class="related-heading">
          <div>
            <p class="studio-eyebrow">Continúa explorando</p>
            <h2>Diseños <em>relacionados.</em></h2>
          </div>
          <NuxtLink class="detail-back" to="/gallery">Toda la colección ↗</NuxtLink>
        </div>
        <div class="related-grid">
          <NuxtLink v-for="item in relatedDesigns" :key="item.slug" class="related-card" :to="`/gallery/${item.slug}`">
            <img class="studio-image" :src="item.image" :alt="item.imageAlt" loading="lazy" />
            <span>{{ item.category }}</span>
            <h3>{{ item.name }}</h3>
          </NuxtLink>
        </div>
      </section>
    </main>
    <main v-else class="studio-main">
      <p class="studio-eyebrow">Diseño no encontrado</p>
      <h1 class="studio-title">Esta pieza aún<br /><em>no está en el archivo.</em></h1>
      <NuxtLink class="studio-button detail-booking" to="/gallery">Volver a la galería <span>↗</span></NuxtLink>
    </main>
  </StudioLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import StudioLayout from '../../components/StudioLayout.vue'
import { designs } from '../../data/studio'
import { readFavorites, toggleFavorite } from '../../utils/studio-storage'

const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))
const design = computed(() => designs.find((item) => item.slug === slug.value))
const relatedDesigns = computed(() => {
  const related = designs.filter((item) => item.slug !== slug.value && item.category === design.value?.category)
  return (related.length ? related : designs.filter((item) => item.slug !== slug.value)).slice(0, 3)
})
const favorites = ref<string[]>([])
const storageMessage = ref('')
const isFavorite = computed(() => favorites.value.includes(slug.value))

onMounted(() => {
  try {
    favorites.value = readFavorites()
  } catch (error) {
    storageMessage.value = error instanceof Error ? error.message : 'No se pudieron cargar los favoritos.'
  }
})

function toggle() {
  try {
    favorites.value = toggleFavorite(slug.value)
    storageMessage.value = ''
  } catch (error) {
    storageMessage.value = error instanceof Error ? error.message : 'No se pudo actualizar el favorito.'
  }
}
</script>

<style scoped>
.detail-back {
  display: inline-block;
  margin-bottom: 25px;
  color: var(--studio-muted);
  font: 10px 'DM Mono', monospace;
  letter-spacing: .1em;
  text-transform: uppercase;
}

.detail-back:hover {
  color: var(--studio-paper);
}

.detail-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(330px, .8fr);
  gap: clamp(35px, 7vw, 100px);
  align-items: center;
}

.detail-image {
  position: relative;
  min-height: 520px;
  max-height: 700px;
  overflow: hidden;
  background: var(--studio-panel);
}

.detail-image__caption {
  position: absolute;
  bottom: 18px;
  left: 18px;
  padding: 9px 12px;
  background: rgba(8, 9, 10, .78);
  color: var(--studio-paper);
  font: 9px 'DM Mono', monospace;
  letter-spacing: .12em;
  text-transform: uppercase;
}

.detail-copy .studio-title {
  font-size: clamp(48px, 6vw, 78px);
}

.detail-description {
  margin: 24px 0;
  color: var(--studio-muted);
  font-size: 14px;
  line-height: 1.9;
}

.detail-favorite,
.detail-booking {
  width: 100%;
  margin-top: 12px;
}

.detail-note {
  color: #828582;
  font-size: 11px;
  line-height: 1.7;
}

.detail-information {
  display: grid;
  grid-template-columns: .9fr 1fr;
  gap: 8vw;
  margin-top: 110px;
  padding: 55px 0;
  border-top: 1px solid var(--studio-line);
  border-bottom: 1px solid var(--studio-line);
}

.detail-information h2,
.related-heading h2 {
  margin: 0 0 20px;
  font: 500 clamp(34px, 4.5vw, 58px)/1.05 'Playfair Display', serif;
  letter-spacing: -.04em;
}

.detail-information h2 em,
.related-heading h2 em {
  color: var(--studio-red);
}

.detail-information > div > p:last-child {
  max-width: 440px;
  color: var(--studio-muted);
  font-size: 13px;
  line-height: 1.85;
}

.detail-information dl {
  display: grid;
  gap: 0;
  margin: 0;
}

.detail-information dl > div {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 17px 0;
  border-bottom: 1px solid var(--studio-line);
}

.detail-information dl > div:first-child {
  border-top: 1px solid var(--studio-line);
}

.detail-information dt {
  color: var(--studio-muted);
  font: 9px 'DM Mono', monospace;
  letter-spacing: .1em;
  text-transform: uppercase;
}

.detail-information dd {
  max-width: 58%;
  margin: 0;
  text-align: right;
  font-size: 12px;
  line-height: 1.6;
}

.related-section {
  margin-top: 95px;
}

.related-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 25px;
  margin-bottom: 25px;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.related-card {
  position: relative;
  display: flex;
  min-height: 260px;
  flex-direction: column;
  justify-content: end;
  overflow: hidden;
  padding: 20px;
  background: var(--studio-panel-light);
}

.related-card::after {
  position: absolute;
  inset: 25% 0 0;
  background: linear-gradient(transparent, rgba(5, 6, 7, .92));
  content: '';
}

.related-card img {
  position: absolute;
  inset: 0;
  transition: transform .4s ease;
}

.related-card:hover img {
  transform: scale(1.04);
}

.related-card span,
.related-card h3 {
  position: relative;
  z-index: 1;
}

.related-card span {
  color: #f06464;
  font: 9px 'DM Mono', monospace;
  letter-spacing: .12em;
  text-transform: uppercase;
}

.related-card h3 {
  margin: 8px 0 0;
  font: 500 22px 'Playfair Display', serif;
}

@media (max-width: 760px) {
  .detail-hero,
  .detail-information {
    grid-template-columns: 1fr;
  }

  .detail-image {
    min-height: 390px;
    height: 110vw;
    max-height: 620px;
  }

  .detail-information {
    gap: 25px;
    margin-top: 75px;
  }

  .related-grid {
    grid-template-columns: 1fr;
  }

  .related-card {
    min-height: 300px;
  }
}

@media (max-width: 500px) {
  .related-heading {
    align-items: start;
    flex-direction: column;
  }
}
</style>
