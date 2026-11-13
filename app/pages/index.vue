<template>
  <div class="home">
    <header class="home-nav">
      <NuxtLink class="brand" to="/" aria-label="INKTATTO, inicio"><span class="brand-mark">影</span><span>INKTATTO <i>/ STUDIO</i></span></NuxtLink>
      <button class="menu-toggle" type="button" :aria-expanded="menuOpen" @click="menuOpen=!menuOpen">{{menuOpen?'Cerrar ×':'Menú +'}}</button>
      <nav :class="{'is-open':menuOpen}" aria-label="Navegación principal">
        <NuxtLink to="/studio" @click="menuOpen=false">Estudio</NuxtLink>
        <NuxtLink to="/gallery" @click="menuOpen=false">Galería</NuxtLink>
        <NuxtLink to="/artists" @click="menuOpen=false">Artistas</NuxtLink>
        <NuxtLink to="/booking" @click="menuOpen=false">Reservas</NuxtLink>
        <NuxtLink to="/contact" @click="menuOpen=false">Contacto</NuxtLink>
        <NuxtLink v-if="user" to="/profile" @click="menuOpen=false">Mi cuenta</NuxtLink>
        <NuxtLink v-if="user?.role==='admin'" to="/admin" @click="menuOpen=false">Administración</NuxtLink>
        <NuxtLink v-if="!user" to="/login" @click="menuOpen=false">Iniciar sesión</NuxtLink>
      </nav>
      <NuxtLink class="nav-cta" to="/booking">Agendar sesión <span>↗</span></NuxtLink>
    </header>

    <main>
      <section class="hero">
        <div class="hero-image" :style="{ backgroundImage: `url(${heroImage})` }" role="img" aria-label="Ilustración original del ninja de INKTATTO"></div>
        <div class="hero-shade"></div>
        <div class="hero-copy">
          <p class="eyebrow"><span></span> Arte japonés · Tatuajes con identidad</p>
          <h1>Tu historia<br /><em>en la piel.</em></h1>
          <p class="intro">Diseños con carácter, trazos cuidados y símbolos que cuentan algo más. Tu idea es el comienzo de cada pieza.</p>
          <div class="hero-actions"><NuxtLink class="button primary" to="/booking">Reservar consulta ↗</NuxtLink><NuxtLink class="button ghost" to="/gallery">Explorar galería</NuxtLink></div>
        </div>
        <div class="hero-index"><span>INKTATTO / 影</span><span>ARTE · PROCESO · IDENTIDAD</span></div>
      </section>

      <section class="intro section">
        <div><p class="eyebrow">01 / Nuestra filosofía</p><h2>Una pieza única.<br /><em>Una historia propia.</em></h2></div>
        <div><p>En INKTATTO cada proyecto empieza escuchando. Exploramos referencias, significado, composición y ubicación para construir un diseño pensado para ti.</p><NuxtLink class="text-link" to="/studio">Conoce el estudio ↗</NuxtLink></div>
      </section>

      <section class="featured section">
        <div class="section-heading"><div><p class="eyebrow">02 / Archivo visual</p><h2>Diseños que<br /><em>dejan huella.</em></h2></div><NuxtLink class="text-link" to="/gallery">Ver toda la galería ↗</NuxtLink></div>
        <div class="design-grid">
          <NuxtLink v-for="(design,index) in featured" :key="design.slug" class="design-card" :to="`/gallery/${design.slug}`">
            <div class="design-image"><img :src="design.image" :alt="design.imageAlt" loading="lazy"/><span>0{{index+1}} / {{design.category}}</span></div>
            <div class="design-caption"><h3>{{design.name}}</h3><span>↗</span></div>
          </NuxtLink>
        </div>
      </section>

      <section class="process section">
        <div><p class="eyebrow">03 / Cómo trabajamos</p><h2>De la idea<br /><em>a la tinta.</em></h2><p class="process-copy">Te acompañamos desde la primera conversación hasta la confirmación de tu sesión.</p><NuxtLink class="button primary" to="/booking">Comenzar mi reserva ↗</NuxtLink></div>
        <ol><li><b>01</b><div><h3>Cuéntanos tu idea</h3><p>Comparte el motivo, referencias y el significado que buscas.</p></div></li><li><b>02</b><div><h3>Definimos el proyecto</h3><p>Elegimos estilo, zona del cuerpo, escala y artista.</p></div></li><li><b>03</b><div><h3>Confirmamos contigo</h3><p>El equipo revisa tu solicitud y confirma disponibilidad.</p></div></li></ol>
      </section>

      <section class="closing"><p class="eyebrow">Tu piel. Tu historia.</p><h2>¿Empezamos a<br /><em>darle forma?</em></h2><div><NuxtLink class="button primary" to="/booking">Agendar una consulta ↗</NuxtLink><NuxtLink class="button ghost" to="/artists">Conocer artistas</NuxtLink></div></section>
    </main>
    <footer class="home-footer"><NuxtLink class="brand" to="/"><span class="brand-mark">影</span><span>INKTATTO <i>/ STUDIO</i></span></NuxtLink><span>El arte también cuenta historias.</span><div><NuxtLink to="/contact">Contacto</NuxtLink><NuxtLink to="/gallery">Galería</NuxtLink><NuxtLink to="/booking">Reservas</NuxtLink></div></footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { designs } from '../data/studio'
import heroImage from '~/assets/ChatGPT Image 10 sept 2026, 15_29_35.png'
const {user,initialize}=useAuth()
const menuOpen=ref(false)
const featured=computed(()=>designs.slice(0,4))
onMounted(()=>{void initialize()})
</script>

<style scoped>
.home{--night:#08090a;--paper:#e9e6df;--muted:#a1a19c;--red:#c92629;min-height:100vh;background:var(--night);color:var(--paper)}.home-nav{height:82px;margin:0 5.5vw;display:flex;align-items:center;justify-content:space-between;gap:25px;border-bottom:1px solid #ffffff25;position:relative;z-index:5}.brand{display:flex;align-items:center;gap:11px;color:var(--paper);text-decoration:none;font:11px 'DM Mono',monospace;letter-spacing:.13em;white-space:nowrap}.brand i{color:var(--muted);font-style:normal}.brand-mark{font:28px serif;color:var(--red)}.home-nav nav{display:flex;align-items:center;gap:clamp(13px,2vw,28px)}.home-nav nav a,.home-footer a{color:var(--muted);text-decoration:none;font:9px 'DM Mono',monospace;letter-spacing:.08em;text-transform:uppercase}.home-nav nav a:hover,.home-footer a:hover{color:var(--paper)}.nav-cta,.button{display:inline-flex;align-items:center;justify-content:center;gap:18px;min-height:46px;padding:0 18px;text-decoration:none;font:10px 'DM Mono',monospace;letter-spacing:.07em;text-transform:uppercase}.nav-cta,.primary{background:var(--red);color:white}.nav-cta{white-space:nowrap}.menu-toggle{display:none;background:none;border:0;color:var(--paper)}.hero{min-height:min(760px,calc(100vh - 82px));position:relative;display:flex;align-items:center;padding:70px 10vw;overflow:hidden}.hero-image{position:absolute;inset:0;background-position:center 42%;background-size:cover;background-repeat:no-repeat;opacity:.52}.hero-shade{position:absolute;inset:0;background:linear-gradient(90deg,#08090a 5%,#08090ae8 38%,#08090a30 100%),linear-gradient(0deg,#08090a 0%,transparent 40%)}.hero-copy{position:relative;max-width:650px}.eyebrow{color:var(--red);font:9px 'DM Mono',monospace;letter-spacing:.17em;text-transform:uppercase}.eyebrow span{display:inline-block;width:22px;height:1px;margin:0 10px 3px 0;background:var(--red)}h1,h2{font:500 clamp(52px,7.5vw,100px)/.98 'Playfair Display',serif;letter-spacing:-.045em;margin:24px 0}h1 em,h2 em{color:var(--red);font-weight:500}.intro{max-width:470px;color:#c3c1ba;font-size:14px;line-height:1.9}.hero-actions,.closing>div{display:flex;gap:13px;flex-wrap:wrap;margin-top:32px}.ghost{border:1px solid #ffffff55;color:var(--paper)}.hero-index{position:absolute;right:5.5vw;bottom:25px;left:5.5vw;display:flex;justify-content:space-between;color:#aaa;font:9px 'DM Mono',monospace;letter-spacing:.12em}.section{padding:110px 9vw}.intro{display:grid;grid-template-columns:1fr 1fr;gap:10vw;border-bottom:1px solid #ffffff20}.intro h2,.section-heading h2,.process h2{font-size:clamp(43px,5.5vw,72px)}.intro>div:last-child{max-width:490px;padding-top:30px;color:#b9b8b2;font-size:14px;line-height:2}.text-link{display:inline-block;margin-top:20px;color:var(--paper);font:10px 'DM Mono',monospace;text-decoration:none;text-transform:uppercase;letter-spacing:.1em}.section-heading{display:flex;justify-content:space-between;align-items:end;margin-bottom:40px}.section-heading .text-link{margin-bottom:30px}.design-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.design-card{color:var(--paper);text-decoration:none;min-width:0}.design-image{height:340px;position:relative;overflow:hidden;background:#151a1c}.design-image img{width:100%;height:100%;object-fit:cover;transition:transform .5s}.design-card:hover img{transform:scale(1.05)}.design-image span{position:absolute;bottom:12px;left:12px;background:#08090acc;padding:8px;color:white;font:8px 'DM Mono',monospace;text-transform:uppercase}.design-caption{display:flex;align-items:center;justify-content:space-between;padding:15px 2px}.design-caption h3{font:500 20px 'Playfair Display',serif;margin:0}.design-caption span{color:var(--red)}.process{display:grid;grid-template-columns:1fr 1fr;gap:10vw;background:#111719}.process-copy{max-width:360px;color:var(--muted);line-height:1.8;margin:25px 0}.process ol{list-style:none;margin:0;padding:0}.process li{display:flex;gap:24px;padding:25px 0;border-bottom:1px solid #ffffff24}.process li b{color:var(--red);font:11px 'DM Mono',monospace}.process li h3{font:500 24px 'Playfair Display',serif;margin:0 0 8px}.process li p{margin:0;color:var(--muted);font-size:12px;line-height:1.8}.closing{text-align:center;padding:110px 20px}.closing h2{font-size:clamp(50px,7vw,88px)}.closing>div{justify-content:center}.home-footer{min-height:100px;padding:25px 5.5vw;border-top:1px solid #ffffff24;display:flex;align-items:center;justify-content:space-between;gap:20px}.home-footer>span{color:var(--muted);font-size:11px}.home-footer>div{display:flex;gap:20px}@media(max-width:1000px){.home-nav nav{gap:12px}.home-nav nav a{font-size:8px}.design-grid{grid-template-columns:repeat(2,1fr)}.design-image{height:42vw;max-height:380px}}@media(max-width:700px){.home-nav{height:70px;margin:0 20px}.menu-toggle{display:block;margin-left:auto}.home-nav nav{display:none;position:absolute;top:69px;left:-20px;right:-20px;padding:12px 22px;background:#101415;border-bottom:1px solid #ffffff30;align-items:stretch;flex-direction:column}.home-nav nav.is-open{display:flex}.home-nav nav a{padding:13px 0;border-bottom:1px solid #ffffff18;font-size:10px}.nav-cta{min-height:36px;padding:0 10px;font-size:8px}.hero{min-height:680px;padding:80px 25px}.hero-shade{background:linear-gradient(90deg,#08090aee,#08090a66),linear-gradient(0deg,#08090a,transparent 60%)}.hero-index{font-size:7px;left:22px;right:22px}.section{padding:75px 24px}.intro,.process{grid-template-columns:1fr;gap:25px}.intro>div:last-child{padding:0}.section-heading{align-items:start;flex-direction:column}.section-heading .text-link{margin:0}.design-grid{gap:12px}.design-image{height:55vw}.design-caption h3{font-size:16px}.process{gap:40px}.home-footer{align-items:flex-start;flex-direction:column;padding:28px 22px}.home-footer>div{flex-wrap:wrap}}
</style>