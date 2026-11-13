<template>
  <div class="studio-page">
    <header class="studio-header">
      <NuxtLink class="studio-brand" to="/" aria-label="Kage Tattoo Studio, inicio">
        <span class="studio-brand__mark">影</span>
        <span class="studio-brand__name">KAGE<span> / TATTOO</span></span>
      </NuxtLink>
      <button
        class="studio-menu-toggle"
        type="button"
        :aria-expanded="menuOpen"
        aria-controls="studio-navigation"
        @click="menuOpen = !menuOpen"
      >
        <span>{{ menuOpen ? 'Cerrar' : 'Menú' }}</span>
        <span aria-hidden="true">{{ menuOpen ? '×' : '＋' }}</span>
      </button>
      <nav id="studio-navigation" class="studio-navigation" :class="{ 'is-open': menuOpen }" aria-label="Navegación principal">
        <NuxtLink to="/studio" :class="{ 'is-active': active === 'studio' }">Estudio</NuxtLink>
        <NuxtLink to="/gallery" :class="{ 'is-active': active === 'gallery' }">Trabajos</NuxtLink>
        <NuxtLink to="/artists" :class="{ 'is-active': active === 'artists' }">Equipo</NuxtLink>
        <NuxtLink to="/booking" :class="{ 'is-active': active === 'booking' }">Reserva</NuxtLink>
        <NuxtLink to="/contact" :class="{ 'is-active': active === 'contact' }">Contacto</NuxtLink>
        <NuxtLink to="/profile" :class="{ 'is-active': active === 'profile' }">Mi perfil</NuxtLink>
        <NuxtLink to="/login" :class="{ 'is-active': active === 'login' }">Iniciar sesión</NuxtLink>
      </nav>
      <NuxtLink class="studio-header__cta" to="/booking">Agendar sesión <span aria-hidden="true">↗</span></NuxtLink>
    </header>

    <slot />

    <footer class="studio-footer">
      <NuxtLink class="studio-footer__brand" to="/">KAGE <span>/ TATTOO STUDIO</span></NuxtLink>
      <span>静けさの中に力あり</span>
      <div class="studio-footer__links">
        <NuxtLink to="/studio">Estudio</NuxtLink>
        <NuxtLink to="/gallery">Trabajos</NuxtLink>
        <NuxtLink to="/artists">Equipo</NuxtLink>
        <NuxtLink to="/booking">Reserva</NuxtLink>
        <NuxtLink to="/contact">Contacto</NuxtLink>
        <NuxtLink to="/login">Iniciar sesión</NuxtLink>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ active?: string }>()

const menuOpen = ref(false)
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;1,500;1,600&display=swap');

:root {
  --studio-night: #08090a;
  --studio-panel: #111719;
  --studio-panel-light: #192124;
  --studio-paper: #e9e6df;
  --studio-muted: #999b98;
  --studio-red: #c92629;
  --studio-line: rgba(233, 230, 223, .16);
}

.studio-page {
  min-height: 100vh;
  color: var(--studio-paper);
  background: radial-gradient(ellipse at 86% 7%, rgba(31, 55, 61, .25), transparent 35%), var(--studio-night);
}

.studio-header {
  position: relative;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 26px;
  min-height: 83px;
  margin: 0 5.5vw;
  border-bottom: 1px solid var(--studio-line);
}

.studio-brand {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 11px;
  font: 500 11px 'DM Mono', monospace;
  letter-spacing: .09em;
}

.studio-brand__mark {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--studio-red);
  color: var(--studio-red);
  font: italic 17px 'Playfair Display', serif;
}

.studio-brand__name span,
.studio-footer__brand span {
  color: var(--studio-red);
}

.studio-navigation {
  display: flex;
  align-items: center;
  gap: clamp(15px, 2.5vw, 35px);
  color: rgba(233, 230, 223, .7);
  font: 10px 'DM Mono', monospace;
  letter-spacing: .1em;
  text-transform: uppercase;
}

.studio-navigation a:last-child {
  display: inline-flex;
  min-height: 36px;
  align-self: center;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 0 15px;
  border: 1px solid rgba(233, 230, 223, .42);
  line-height: 1;
  vertical-align: middle;
}

.studio-navigation a:last-child:hover,
.studio-navigation a:last-child.is-active {
  border-color: var(--studio-paper);
  background: rgba(233, 230, 223, .06);
}

.studio-navigation a,
.studio-footer a {
  transition: color .2s ease;
}

.studio-navigation a:hover,
.studio-navigation a.is-active,
.studio-footer a:hover {
  color: var(--studio-paper);
}

.studio-navigation a.is-active::before {
  content: '•';
  margin-right: 7px;
  color: var(--studio-red);
}

.studio-header__cta {
  display: flex;
  flex: 0 0 auto;
  gap: 15px;
  align-items: center;
  font: 500 10px 'DM Mono', monospace;
  letter-spacing: .09em;
  text-transform: uppercase;
}

.studio-header__cta span,
.studio-footer__brand span {
  color: var(--studio-red);
}

.studio-menu-toggle {
  display: none;
}

.studio-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 25px 5.5vw;
  border-top: 1px solid var(--studio-line);
  color: #777a78;
  font: 9px 'DM Mono', monospace;
  letter-spacing: .1em;
  text-transform: uppercase;
}

.studio-footer__brand {
  color: var(--studio-paper);
}

.studio-footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  color: var(--studio-paper);
}

.studio-main {
  width: min(100% - 11vw, 1320px);
  margin: 0 auto;
  padding: 90px 0 110px;
}

.studio-eyebrow {
  margin: 0 0 19px;
  color: var(--studio-red);
  font: 500 10px 'DM Mono', monospace;
  letter-spacing: .16em;
  text-transform: uppercase;
}

.studio-eyebrow::before {
  display: inline-block;
  width: 26px;
  height: 1px;
  margin: 0 11px 3px 0;
  background: currentColor;
  content: '';
}

.studio-title {
  max-width: 850px;
  margin: 0;
  font: 500 clamp(48px, 7.3vw, 100px)/.98 'Playfair Display', serif;
  letter-spacing: -.045em;
}

.studio-title em {
  color: var(--studio-red);
  font-weight: 500;
}

.studio-lede {
  max-width: 610px;
  margin: 22px 0 0;
  color: var(--studio-muted);
  font-size: 14px;
  line-height: 1.8;
}

.studio-button {
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 0 19px;
  border: 1px solid transparent;
  background: var(--studio-paper);
  color: #101112;
  cursor: pointer;
  font: 500 10px 'DM Mono', monospace;
  letter-spacing: .1em;
  text-align: center;
  text-transform: uppercase;
  transition: transform .22s ease, background .22s ease, border-color .22s ease;
}

.studio-button:hover {
  transform: translateY(-2px);
  background: #fff;
}

.studio-button span {
  color: var(--studio-red);
  font-size: 16px;
}

.studio-button--outline {
  border-color: var(--studio-line);
  background: transparent;
  color: var(--studio-paper);
}

.studio-button--outline:hover {
  border-color: var(--studio-paper);
  background: rgba(233, 230, 223, .07);
  color: var(--studio-paper);
}

.studio-button--small {
  min-height: 38px;
  padding: 0 13px;
  font-size: 9px;
}

.studio-card {
  border: 1px solid var(--studio-line);
  background: linear-gradient(145deg, rgba(25, 33, 36, .86), rgba(14, 17, 18, .96));
}

.studio-field {
  display: flex;
  flex-direction: column;
  gap: 9px;
  color: var(--studio-paper);
  font: 10px 'DM Mono', monospace;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.studio-field input,
.studio-field select,
.studio-field textarea {
  width: 100%;
  min-height: 46px;
  padding: 12px;
  border: 1px solid rgba(233, 230, 223, .2);
  border-radius: 0;
  outline: none;
  background: #0b0e0f;
  color: var(--studio-paper);
  font: 13px 'Manrope', sans-serif;
  letter-spacing: normal;
  text-transform: none;
}

.studio-field textarea {
  min-height: 125px;
  resize: vertical;
}

.studio-field input:focus,
.studio-field select:focus,
.studio-field textarea:focus {
  border-color: var(--studio-red);
}

.studio-field option {
  background: #111719;
}

.studio-notice {
  padding: 14px 17px;
  border-left: 2px solid var(--studio-red);
  background: rgba(201, 38, 41, .08);
  color: #dfd8ce;
  font-size: 12px;
  line-height: 1.7;
}

.studio-empty {
  padding: 30px;
  border: 1px solid var(--studio-line);
  color: var(--studio-muted);
  font-size: 13px;
  line-height: 1.8;
}

.studio-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 920px) {
  .studio-header {
    gap: 16px;
    margin: 0 4vw;
  }

  .studio-navigation {
    gap: 15px;
    font-size: 9px;
  }

  .studio-header__cta {
    display: none;
  }

  .studio-main {
    width: min(100% - 8vw, 1320px);
  }
}

@media (max-width: 700px) {
  .studio-header {
    min-height: 72px;
    flex-wrap: wrap;
    padding: 14px 0;
  }

  .studio-menu-toggle {
    display: flex;
    align-items: center;
    gap: 9px;
    border: 0;
    background: transparent;
    color: var(--studio-paper);
    cursor: pointer;
    font: 10px 'DM Mono', monospace;
    letter-spacing: .1em;
    text-transform: uppercase;
  }

  .studio-menu-toggle span:last-child {
    color: var(--studio-red);
    font-size: 18px;
  }

  .studio-navigation {
    display: none;
    order: 3;
    width: 100%;
    align-items: stretch;
    flex-direction: column;
    gap: 0;
    padding: 8px 0 3px;
  }

  .studio-navigation.is-open {
    display: flex;
  }

  .studio-navigation a {
    padding: 12px 0;
    border-top: 1px solid var(--studio-line);
  }

  .studio-main {
    width: auto;
    padding: 66px 22px 78px;
  }

  .studio-title {
    font-size: clamp(48px, 15vw, 72px);
  }

  .studio-footer {
    padding: 24px 22px;
  }

  .studio-footer > span {
    order: 3;
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    transition-duration: .01ms !important;
    animation-duration: .01ms !important;
  }
}
</style>
