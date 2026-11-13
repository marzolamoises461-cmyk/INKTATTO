<template>
  <StudioLayout active="studio">
    <main class="studio-main about-page">
      <header class="about-hero">
        <div>
          <p class="studio-eyebrow">El código del estudio</p>
          <h1 class="studio-title">Tinta con<br /><em>propósito.</em></h1>
          <p class="studio-lede">Cada pieza nace de una conversación. Estudiamos tu idea, su composición y su significado antes de llevarla a la piel.</p>
          <NuxtLink class="studio-button about-hero__cta" to="/booking">Conocer el proceso de reserva <span>↗</span></NuxtLink>
        </div>
        <figure class="about-image">
          <img class="studio-image" :src="fujiImage" alt="Samurái bajo los cerezos, frente al monte Fuji" />
          <figcaption>KAGE / Japón tradicional, mirada contemporánea</figcaption>
        </figure>
      </header>

      <section class="about-principles">
        <div>
          <p class="studio-eyebrow">Nuestra intención</p>
          <h2>Una historia<br /><em>que te pertenece.</em></h2>
        </div>
        <p>El lenguaje visual japonés inspira nuestro trabajo: criaturas míticas, naturaleza y símbolos cargados de significado. La idea del cliente marca el punto de partida; la composición se conversa y se adapta a cada proyecto.</p>
      </section>

      <section class="about-process">
        <div class="about-process__heading">
          <p class="studio-eyebrow">Un proceso en tres momentos</p>
          <h2>Del primer trazo<br /><em>a la piel.</em></h2>
        </div>
        <ol>
          <li>
            <span>01</span>
            <div>
              <h3>Conversamos</h3>
              <p>Comparte tu idea, referencias y el significado que quieres explorar.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h3>Componemos</h3>
              <p>Definimos juntos el motivo, su escala y cómo se relaciona con la zona del cuerpo.</p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h3>Concretamos</h3>
              <p>El estudio conversa contigo para revisar disponibilidad, duración y siguientes pasos.</p>
            </div>
          </li>
        </ol>
      </section>

      <section class="about-end">
        <div>
          <p class="studio-eyebrow">Un motivo, muchas lecturas</p>
          <h2>Descubre el<br /><em>archivo Kage.</em></h2>
        </div>
        <div class="about-end__actions">
          <NuxtLink class="studio-button" to="/gallery">Explorar tatuajes <span>↗</span></NuxtLink>
          <NuxtLink class="studio-button studio-button--outline" to="/artists">Conocer al equipo <span>↗</span></NuxtLink>
        </div>
      </section>
    </main>
  </StudioLayout>
</template>

<script setup lang="ts">
import StudioLayout from '../components/StudioLayout.vue'
import fujiImage from '../assets/ChatGPT Image 10 sept 2026, 15_29_35.png'
</script>

<style scoped>
.about-hero {
  display: grid;
  grid-template-columns: minmax(0, .85fr) minmax(0, 1fr);
  align-items: center;
  gap: clamp(35px, 8vw, 110px);
}

.about-hero .studio-title {
  font-size: clamp(58px, 8vw, 105px);
}

.about-hero__cta {
  margin-top: 29px;
}

.about-image {
  position: relative;
  height: clamp(400px, 56vw, 650px);
  margin: 0;
  overflow: hidden;
  background: var(--studio-panel-light);
}

.about-image::after {
  position: absolute;
  inset: 40% 0 0;
  background: linear-gradient(transparent, rgba(5, 6, 7, .7));
  content: '';
}

.about-image figcaption {
  position: absolute;
  z-index: 1;
  right: 18px;
  bottom: 17px;
  left: 18px;
  color: var(--studio-paper);
  font: 9px 'DM Mono', monospace;
  letter-spacing: .1em;
  text-transform: uppercase;
}

.about-principles {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8vw;
  align-items: end;
  margin-top: 115px;
  padding: 58px 0;
  border-top: 1px solid var(--studio-line);
  border-bottom: 1px solid var(--studio-line);
}

.about-principles h2,
.about-process h2,
.about-end h2 {
  margin: 0;
  font: 500 clamp(39px, 5.5vw, 72px)/1 'Playfair Display', serif;
  letter-spacing: -.04em;
}

.about-principles h2 em,
.about-process h2 em,
.about-end h2 em {
  color: var(--studio-red);
}

.about-principles > p {
  max-width: 520px;
  margin: 0;
  color: var(--studio-muted);
  font-size: 14px;
  line-height: 1.9;
}

.about-process {
  display: grid;
  grid-template-columns: .8fr 1fr;
  gap: 8vw;
  margin-top: 110px;
}

.about-process ol {
  margin: 0;
  padding: 0;
  list-style: none;
}

.about-process li {
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: 15px;
  padding: 20px 0;
  border-top: 1px solid var(--studio-line);
}

.about-process li > span {
  color: var(--studio-red);
  font: 11px 'DM Mono', monospace;
}

.about-process h3 {
  margin: 0 0 8px;
  font: 500 24px 'Playfair Display', serif;
}

.about-process li p {
  max-width: 470px;
  margin: 0;
  color: var(--studio-muted);
  font-size: 12px;
  line-height: 1.75;
}

.about-end {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 30px;
  margin-top: 110px;
  padding: 44px;
  border: 1px solid var(--studio-line);
  background: linear-gradient(110deg, rgba(25, 33, 36, .82), rgba(14, 17, 18, .96));
}

.about-end__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

@media (max-width: 750px) {
  .about-hero,
  .about-principles,
  .about-process {
    grid-template-columns: 1fr;
  }

  .about-image {
    height: 100vw;
    max-height: 570px;
  }

  .about-principles,
  .about-process {
    gap: 28px;
    margin-top: 75px;
  }

  .about-end {
    align-items: start;
    flex-direction: column;
    margin-top: 75px;
    padding: 28px 20px;
  }
}
</style>
