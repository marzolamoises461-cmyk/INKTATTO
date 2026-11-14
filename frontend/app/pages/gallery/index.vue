<template>
  <StudioLayout active="gallery">
    <main class="studio-main gallery-page">
      <header class="gallery-heading">
        <div>
          <p class="studio-eyebrow">Archivo de Kage · Colección</p>
          <h1 class="studio-title">Explora nuestros<br /><em>trabajos.</em></h1>
          <p class="studio-lede">Motivos japoneses, trazados con intención. Filtra la colección y descubre el significado detrás de cada pieza.</p>
        </div>
        <p class="gallery-count"><span>{{ filteredDesigns.length.toString().padStart(2, '0') }}</span> piezas<br />en la colección</p>
      </header>

      <section class="gallery-toolbar" aria-label="Filtrar diseños por categoría">
        <div class="gallery-filters">
          <button
            v-for="category in categories"
            :key="category"
            type="button"
            :class="{ 'is-selected': selectedCategory === category }"
            :aria-pressed="selectedCategory === category"
            @click="selectedCategory = category"
          >
            {{ category }}
          </button>
        </div>
        <label class="gallery-select studio-field">
          <span>Filtrar por motivo</span>
          <select v-model="selectedCategory">
            <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
          </select>
        </label>
      </section>

      <p v-if="storageMessage" class="studio-notice gallery-notice" role="status">{{ storageMessage }}</p>

      <section class="gallery-grid" aria-label="Diseños de tatuaje">
        <article v-for="(design, index) in filteredDesigns" :key="design.slug" class="gallery-card">
          <NuxtLink class="gallery-card__image-link" :to="`/gallery/${design.slug}`" :aria-label="`Ver diseño ${design.name}`">
            <img class="studio-image gallery-card__image" :src="design.image" :alt="design.imageAlt" :loading="index > 2 ? 'lazy' : 'eager'" />
            <span class="gallery-card__number">K — {{ (index + 1).toString().padStart(2, '0') }}</span>
            <span class="gallery-card__view">Ver diseño ↗</span>
          </NuxtLink>
          <div class="gallery-card__body">
            <div>
              <p class="gallery-card__category">{{ design.category }}</p>
              <h2><NuxtLink :to="`/gallery/${design.slug}`">{{ design.name }}</NuxtLink></h2>
              <p class="gallery-card__price">{{ formatPrice(design.price) }}</p>
            </div>
            <button
              class="gallery-card__favorite"
              type="button"
              :aria-label="favorites.includes(design.slug) ? `Quitar ${design.name} de favoritos` : `Guardar ${design.name} en favoritos`"
              :aria-pressed="favorites.includes(design.slug)"
              @click="toggle(design.slug)"
            >{{ favorites.includes(design.slug) ? '♥' : '♡' }}</button>
          </div>
        </article>
      </section>

      <p v-if="filteredDesigns.length === 0" class="studio-empty">Aún no hay piezas publicadas en esta categoría.</p>
      <aside class="gallery-footnote">Piezas de referencia. Cada tatuaje se diseña a medida y se adapta a la persona y zona elegidas.</aside>
    </main>
  </StudioLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import StudioLayout from '../../components/StudioLayout.vue'
import { categories, designs } from '../../data/studio'
import { readFavorites, toggleFavorite } from '../../utils/studio-storage'

const selectedCategory = ref('Todos')
const favorites = ref<string[]>([])
const storageMessage = ref('')
const filteredDesigns = computed(() => selectedCategory.value === 'Todos'
  ? designs
  : designs.filter((design) => design.category === selectedCategory.value))

onMounted(() => {
  try {
    favorites.value = readFavorites()
  } catch (error) {
    storageMessage.value = error instanceof Error ? error.message : 'No se pudieron cargar los favoritos.'
  }
})

function formatPrice(value: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)
}

function toggle(slug: string) {
  try {
    favorites.value = toggleFavorite(slug)
    storageMessage.value = ''
  } catch (error) {
    storageMessage.value = error instanceof Error ? error.message : 'No se pudo actualizar el favorito.'
  }
}
</script>

<style scoped>
.gallery-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 35px;
}

.gallery-heading .studio-title {
  font-size: clamp(58px, 8vw, 108px);
}

.gallery-count {
  flex: 0 0 auto;
  margin: 0 0 8px;
  color: var(--studio-muted);
  font: 10px/1.8 'DM Mono', monospace;
  letter-spacing: .11em;
  text-align: right;
  text-transform: uppercase;
}

.gallery-count span {
  color: var(--studio-red);
  font-size: 28px;
}

.gallery-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 30px;
  align-items: center;
  margin: 55px 0 25px;
  padding: 16px 0;
  border-top: 1px solid var(--studio-line);
  border-bottom: 1px solid var(--studio-line);
}

.gallery-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.gallery-filters button {
  padding: 9px 11px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--studio-muted);
  cursor: pointer;
  font: 10px 'DM Mono', monospace;
  letter-spacing: .06em;
  text-transform: uppercase;
  transition: border-color .2s ease, color .2s ease;
}

.gallery-filters button:hover,
.gallery-filters button.is-selected {
  border-color: var(--studio-red);
  color: var(--studio-paper);
}

.gallery-select {
  display: none;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px 18px;
}

.gallery-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--studio-line);
  background: #101415;
  transition: border-color .25s ease, transform .25s ease;
}

.gallery-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 0, 0, .6);
}

.gallery-card__image-link {
  position: relative;
  display: block;
  height: clamp(250px, 25vw, 350px);
  overflow: hidden;
  background: var(--studio-panel-light);
}

.gallery-card__image {
  transition: transform .6s ease;
}

.gallery-card:hover .gallery-card__image {
  transform: scale(1.04);
}

.gallery-card__number,
.gallery-card__view {
  position: absolute;
  bottom: 14px;
  color: var(--studio-paper);
  font: 9px 'DM Mono', monospace;
  letter-spacing: .11em;
  text-transform: uppercase;
}

.gallery-card__number {
  left: 14px;
  padding: 7px 9px;
  background: rgba(8, 9, 10, .72);
}

.gallery-card__view {
  right: 14px;
  opacity: 0;
  transition: opacity .2s ease;
}

.gallery-card:hover .gallery-card__view {
  opacity: 1;
}

.gallery-card__body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 18px;
}

.gallery-card__category {
  margin: 0 0 8px;
  color: var(--studio-red);
  font: 9px 'DM Mono', monospace;
  letter-spacing: .12em;
  text-transform: uppercase;
}

.gallery-card h2 {
  margin: 0;
  font: 500 clamp(18px, 1.7vw, 23px) 'Playfair Display', serif;
}

.gallery-card__price {
  margin: 9px 0 0;
  color: var(--studio-paper);
  font: 600 13px 'DM Mono', monospace;
  letter-spacing: .04em;
}

.gallery-card__favorite {
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  border: 1px solid var(--studio-line);
  background: transparent;
  color: var(--studio-red);
  cursor: pointer;
  font-size: 20px;
  transition: background .2s ease;
}

.gallery-card__favorite:hover {
  background: rgba(255, 0, 0, .12);
}

.gallery-notice {
  margin-bottom: 22px;
}

.gallery-footnote {
  margin-top: 32px;
  color: #777a78;
  font: 10px/1.7 'DM Mono', monospace;
  letter-spacing: .04em;
}

@media (max-width: 850px) {
  .gallery-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 620px) {
  .gallery-heading {
    align-items: start;
    flex-direction: column;
    gap: 20px;
  }

  .gallery-heading .studio-title {
    font-size: clamp(54px, 14vw, 78px);
  }

  .gallery-count {
    text-align: left;
  }

  .gallery-toolbar {
    margin-top: 35px;
  }

  .gallery-filters {
    display: none;
  }

  .gallery-select {
    display: flex;
    width: 100%;
  }

  .gallery-grid {
    gap: 16px 10px;
  }

  .gallery-card__image-link {
    height: 54vw;
    min-height: 180px;
  }

  .gallery-card__body {
    padding: 12px 10px;
  }

  .gallery-card h2 {
    font-size: 17px;
  }
}
</style>
