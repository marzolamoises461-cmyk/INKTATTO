<template>
  <main class="samurai-page">
    <nav class="site-nav" aria-label="Navegación principal">
      <a class="brand" href="#inicio" aria-label="Kage, inicio">
        <span class="brand__mark">影</span>
        <span class="brand__name">KAGE<span> / TATTOO</span></span>
      </a>
      <div id="home-navigation" class="site-nav__links" :class="{ 'is-open': menuOpen }">
        <a :class="{ 'is-active': activePage === 'inicio' }" href="#inicio" @click="menuOpen = false">Inicio</a>
        <a :class="{ 'is-active': activePage === 'estudio' }" href="#estudio" @click="menuOpen = false">El estudio</a>
        <a :class="{ 'is-active': activePage === 'galeria' }" href="#galeria" @click="menuOpen = false">Trabajos</a>
        <a :class="{ 'is-active': activePage === 'reserva' }" href="#reserva" @click="menuOpen = false">Reserva</a>
        <a :class="{ 'is-active': activePage === 'equipo' }" href="#equipo" @click="menuOpen = false">Equipo</a>
        <a :class="{ 'is-active': activePage === 'contacto' }" href="#contacto" @click="menuOpen = false">Contacto</a>
        <a :class="{ 'is-active': activePage === 'perfil' }" href="#perfil" @click="menuOpen = false">Mi perfil</a>
      </div>
      <button class="mobile-nav-toggle" type="button" :aria-expanded="menuOpen" aria-controls="home-navigation" @click="menuOpen = !menuOpen">{{ menuOpen ? 'Cerrar ×' : 'Menú +' }}</button>
      <div class="nav-actions">
        <a class="nav-action" href="#reserva"><span>Agendar sesión</span><span aria-hidden="true">↗</span></a>
        <a class="nav-login" href="#acceso">Iniciar sesión</a>
      </div>
    </nav>

    <section id="inicio" v-show="activePage === 'inicio'" class="hero page-screen" aria-labelledby="hero-title">
      <div class="hero__image"></div>
      <div class="hero__veil"></div>

      <div class="hero__content">
        <p class="eyebrow"><span></span> Estudio de tatuaje japonés · Madrid</p>
        <h1 id="hero-title">Tu historia<br /><em>en la piel.</em></h1>
        <p class="hero__intro">Tatuajes con alma de grabado, trazados con paciencia y respeto por el lenguaje visual del Japón tradicional.</p>
        <div class="hero__actions">
          <a class="button button--solid" href="#reserva">Reservar consulta <span>↗</span></a>
          <a class="button button--quiet" href="#galeria"><span class="play">▶</span> Ver portafolio</a>
        </div>
      </div>

      <div class="hero__footer">
        <p>彫 <span>/</span> Hori</p>
        <p class="scroll-cue"><span></span> Pasa a la siguiente página</p>
        <p>01 <span>/</span> {{ pageCount.toString().padStart(2, '0') }}</p>
      </div>
    </section>

    <section id="estudio" v-show="activePage === 'estudio'" class="studio-about page-screen">
      <header class="studio-about__hero">
        <div>
          <p class="eyebrow"><span></span> Kage · El espacio y su filosofía</p>
          <h1>Conoce<br /><em>nuestro estudio.</em></h1>
          <p class="studio-about__lede">Un lugar para conversar, explorar una idea y darle forma con calma. Cada proyecto empieza escuchando lo que quieres llevar contigo.</p>
          <a class="button button--solid" href="#reserva">Solicitar una consulta <span>↗</span></a>
        </div>
        <figure class="studio-about__hero-image">
          <img
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1500&q=85"
            alt="Interior de referencia con iluminación cálida y materiales naturales"
            fetchpriority="high"
          />
          <figcaption>Una referencia visual del ambiente que inspira Kage</figcaption>
        </figure>
      </header>

      <div class="studio-about__intro">
        <p class="eyebrow"><span></span> Una pausa antes de la tinta</p>
        <p>Creemos que una buena experiencia empieza mucho antes de la sesión: con una conversación clara, atención a los detalles y espacio para que cada idea encuentre su forma.</p>
      </div>

      <section class="studio-about__section" aria-labelledby="studio-about-spaces">
        <header class="studio-about__heading">
          <div><p class="eyebrow"><span></span> El espacio</p><h2 id="studio-about-spaces">Un entorno<br /><em>para crear.</em></h2></div>
          <p>La luz, el orden y una atmósfera tranquila acompañan cada etapa del proceso. Estas imágenes son referencias de ambientación; las fotografías propias del estudio se incorporarán cuando estén disponibles.</p>
        </header>
        <div class="studio-about__spaces">
          <figure v-for="(space, index) in studioSpaces" :key="space.title" class="studio-about__space">
            <div class="studio-about__image"><img :src="space.image" :alt="space.alt" loading="lazy" /><span>0{{ index + 1 }}</span></div>
            <figcaption><h3>{{ space.title }}</h3><p>{{ space.description }}</p></figcaption>
          </figure>
        </div>
      </section>

      <section class="studio-about__section" aria-labelledby="studio-about-styles">
        <header class="studio-about__heading">
          <div><p class="eyebrow"><span></span> Lenguajes de la tinta</p><h2 id="studio-about-styles">Estilos con<br /><em>personalidad.</em></h2></div>
          <p>Algunas formas de expresión que pueden inspirar tu proyecto. La disponibilidad de cada estilo se confirma directamente con el equipo al conversar sobre tu idea.</p>
        </header>
        <div class="studio-about__styles">
          <article v-for="style in studioStyles" :key="style.name" class="studio-about__style">
            <div class="studio-about__image"><img :src="style.image" :alt="style.alt" loading="lazy" /><span>{{ style.index }}</span></div>
            <div><h3>{{ style.name }}</h3><p>{{ style.description }}</p></div>
          </article>
        </div>
      </section>

      <section class="studio-about__section studio-about__artists" aria-labelledby="studio-about-artists">
        <header class="studio-about__heading">
          <div><p class="eyebrow"><span></span> Personas detrás de la tinta</p><h2 id="studio-about-artists">Nuestros<br /><em>artistas.</em></h2></div>
          <p>Una primera referencia de los perfiles disponibles. Los nombres y fotografías reales del equipo están pendientes de publicación.</p>
        </header>
        <div class="studio-about__artist-list">
          <article v-for="(artist, index) in artistProfiles" :key="artist.slug" class="studio-about__artist">
            <img :src="artist.image" :alt="`Imagen de referencia para ${artist.label}`" loading="lazy" />
            <div><p>Perfil de referencia · 0{{ index + 1 }}</p><h3>{{ artist.label }}</h3><span>{{ artist.specialty }}</span></div>
            <span class="studio-about__artist-note">Presentación por confirmar</span>
          </article>
        </div>
        <a class="text-link" href="#equipo">Ver la sección Equipo <span>↗</span></a>
      </section>

      <section class="studio-about__care" aria-labelledby="studio-about-care">
        <div class="studio-about__mark" aria-hidden="true">影</div>
        <div>
          <p class="eyebrow"><span></span> Cuidado y confianza</p>
          <h2 id="studio-about-care">La seguridad<br />también es parte del <em>arte.</em></h2>
          <p>La preparación del espacio y la higiene son esenciales en cualquier sesión. Antes de tu cita, puedes consultar con el estudio los cuidados, materiales y protocolos que aplican a tu proyecto.</p>
        </div>
        <ul>
          <li><span>01</span><div><h3>Espacio preparado</h3><p>Resuelve tus dudas sobre la preparación del área de trabajo antes de la sesión.</p></div></li>
          <li><span>02</span><div><h3>Higiene conversada</h3><p>El equipo puede explicarte las prácticas de limpieza y cuidado pertinentes a tu cita.</p></div></li>
          <li><span>03</span><div><h3>Cuidados claros</h3><p>Conoce las indicaciones de cuidado que correspondan a tu tatuaje y a tu sesión.</p></div></li>
        </ul>
      </section>

      <section class="studio-about__experience" aria-labelledby="studio-about-experience">
        <div><p class="eyebrow"><span></span> Tu experiencia</p><h2 id="studio-about-experience">De la idea<br /><em>a la cita.</em></h2></div>
        <div>
          <p>Te acompañamos desde la primera consulta: conversamos sobre tu idea y referencias, exploramos el diseño contigo y coordinamos los detalles para preparar la cita. El siguiente paso siempre se confirma de forma directa con el estudio.</p>
          <ol>
            <li><span>01</span> Comparte tu idea y lo que quieres expresar.</li>
            <li><span>02</span> Conversa sobre el diseño, el estilo y su composición.</li>
            <li><span>03</span> Revisa los detalles y solicita tu cita.</li>
          </ol>
        </div>
      </section>

      <section class="studio-about__end">
        <div>
          <p class="eyebrow"><span></span> Tu historia empieza aquí</p>
          <h2>Hablemos de<br /><em>tu próxima pieza.</em></h2>
          <p>Cuéntanos qué tienes en mente y el estudio te orientará sobre los siguientes pasos.</p>
        </div>
        <a class="button button--solid" href="#reserva">Ir a Reserva <span>↗</span></a>
      </section>
    </section>

    <section id="trabajos" v-show="activePage === 'especialidades'" class="feature-section page-screen">
      <div class="feature-image" role="img" aria-label="Tatuaje inspirado en un guerrero samurái"></div>
      <div class="feature-content">
        <p class="eyebrow"><span></span> Especialidades</p>
        <p class="feature-index">01 — 03</p>
        <h2>Diseños que<br /><em>resisten.</em></h2>
        <p>Japonés tradicional, blackwork y composiciones a medida. Dragones, máscaras Hannya, koi y símbolos con una lectura contemporánea.</p>
        <a class="button button--outline" href="#galeria">Explorar diseños <span>↗</span></a>
      </div>
    </section>

    <section v-show="activePage === 'frase'" class="quote-section page-screen">
      <p class="quote-mark">“</p>
      <blockquote>La piel recuerda<br />lo que el tiempo<br /><em>no borra.</em></blockquote>
      <p class="quote-source">— Reserva tu consulta · hola@kagetattoo.es · @kage.tattoo</p>
    </section>

    <section id="proceso" v-show="activePage === 'proceso'" class="home-screen process-screen page-screen">
      <p class="eyebrow"><span></span> El proceso Kage</p>
      <h2>Una idea.<br /><em>Una historia.</em></h2>
      <p class="screen-intro">Cada proyecto comienza escuchando lo que quieres expresar. Conversamos sobre el motivo, su significado y la manera de adaptarlo a ti.</p>
      <div class="process-steps">
        <article><span>01 / CONVERSAMOS</span><h3>Tu idea es el inicio.</h3><p>Cuéntanos el motivo, las referencias y la historia que quieres llevar contigo.</p></article>
        <article><span>02 / COMPONEMOS</span><h3>Diseñamos con intención.</h3><p>Definimos estilo, tamaño y zona del cuerpo antes de planificar la pieza.</p></article>
        <article><span>03 / COORDINAMOS</span><h3>Confirmamos contigo.</h3><p>El estudio revisa la solicitud y confirma disponibilidad y siguientes pasos.</p></article>
      </div>
      <a class="button button--solid" href="#reserva">Empezar una consulta <span>↗</span></a>
    </section>

    <section id="galeria" v-show="activePage === 'galeria'" class="home-screen gallery-screen page-screen">
      <header class="screen-heading">
        <div>
          <p class="eyebrow"><span></span> Archivo de Kage · Colección</p>
          <h2>Explora nuestros<br /><em>trabajos.</em></h2>
          <p class="screen-intro">Descubre los motivos, filtra por categoría y consulta el significado de cada diseño.</p>
        </div>
        <span class="screen-counter">{{ visibleDesigns.length.toString().padStart(2, '0') }} / PIEZAS</span>
      </header>
      <div class="category-filters" aria-label="Filtrar trabajos por categoría">
        <button v-for="category in categories" :key="category" type="button" :class="{ 'is-active': selectedCategory === category }" :aria-pressed="selectedCategory === category" @click="selectedCategory = category">{{ category }}</button>
      </div>
      <div v-if="storageMessage" class="screen-notice" role="status">{{ storageMessage }}</div>

      <section v-if="selectedDesign" id="detalle" class="tattoo-detail" aria-label="Detalle del tatuaje seleccionado">
        <button class="screen-back" type="button" @click="clearSelectedDesign">← Volver a todos los trabajos</button>
        <div class="tattoo-detail__layout">
          <img :src="selectedDesign.image" :alt="selectedDesign.imageAlt" />
          <div class="tattoo-detail__copy">
            <p class="eyebrow"><span></span> {{ selectedDesign.category }} · Archivo de diseño</p>
            <h3>{{ selectedDesign.name }}</h3>
            <p>{{ selectedDesign.description }}</p>
            <dl>
              <div><dt>Significado</dt><dd>{{ selectedDesign.meaning }}</dd></div>
              <div><dt>Estilo artístico</dt><dd>{{ selectedDesign.style }}</dd></div>
              <div><dt>Zona recomendada</dt><dd>{{ selectedDesign.bodyArea }}</dd></div>
              <div><dt>Tiempo estimado</dt><dd>{{ selectedDesign.duration }}</dd></div>
            </dl>
            <div class="inline-actions">
              <button class="button button--outline" type="button" @click="toggleFavorite(selectedDesign.slug)">{{ favorites.includes(selectedDesign.slug) ? '♥ En favoritos' : '♡ Guardar diseño' }}</button>
              <a class="button button--solid" href="#reserva">Reservar sesión <span>↗</span></a>
            </div>
          </div>
        </div>
        <div class="related-designs">
          <p class="eyebrow"><span></span> Diseños relacionados</p>
          <div class="related-designs__grid">
            <button v-for="design in relatedDesigns" :key="design.slug" type="button" @click="selectDesign(design)">
              <img :src="design.image" :alt="design.imageAlt" loading="lazy" />
              <span>{{ design.category }}</span><strong>{{ design.name }}</strong>
            </button>
          </div>
        </div>
      </section>

      <div v-else class="home-design-grid">
        <article v-for="design in visibleDesigns" :key="design.slug" class="home-design-card">
          <button class="home-design-card__image" type="button" :aria-label="`Ver detalle de ${design.name}`" @click="selectDesign(design)">
            <img :src="design.image" :alt="design.imageAlt" loading="lazy" />
            <span>{{ design.category }}</span>
          </button>
          <div class="home-design-card__caption">
            <button class="home-design-card__title" type="button" @click="selectDesign(design)">{{ design.name }}</button>
            <button class="favorite-button" type="button" :aria-label="favorites.includes(design.slug) ? `Quitar ${design.name} de favoritos` : `Guardar ${design.name} en favoritos`" :aria-pressed="favorites.includes(design.slug)" @click="toggleFavorite(design.slug)">{{ favorites.includes(design.slug) ? '♥' : '♡' }}</button>
          </div>
        </article>
      </div>
    </section>

    <section id="reserva" v-show="activePage === 'reserva'" class="home-screen booking-screen page-screen">
      <p class="eyebrow"><span></span> Una conversación antes de la tinta</p>
      <h2>Reserva una<br /><em>consulta.</em></h2>
      <p class="screen-intro">Comparte tu idea y tus preferencias. Tu solicitud quedará registrada en la cuenta y podrá ser revisada por el estudio.</p>
      <p v-if="!isAuthenticated" class="screen-notice">Para enviar una solicitud debes iniciar sesión o crear una cuenta. <a href="#acceso">Ir al acceso ↗</a></p>
      <div class="booking-layout">
        <form class="screen-form booking-form" @submit.prevent="submitBooking">
          <label class="screen-field">Tu nombre *<input v-model.trim="booking.name" autocomplete="name" required maxlength="100" /></label>
          <label class="screen-field">Correo electrónico *<input v-model.trim="booking.email" type="email" autocomplete="email" required maxlength="254" /></label>
          <label class="screen-field">Tatuador/a *
            <select v-model="booking.artist" required><option disabled value="">Selecciona un perfil</option><option v-for="artist in artistProfiles" :key="artist.slug" :value="artist.slug">{{ artist.label }} · {{ artist.specialty }}</option></select>
          </label>
          <label class="screen-field">Fecha preferida *<input v-model="booking.date" type="date" :min="minDate" required /></label>
          <label class="screen-field">Horario preferido *<select v-model="booking.time" required><option disabled value="">Selecciona una hora</option><option v-for="time in timeSlots" :key="time" :value="time">{{ formatBookingTime(time) }}</option></select><small>Selecciona una hora entre las 9:00 AM y las 5:00 PM.</small></label>
          <label class="screen-field">Zona del cuerpo *<select v-model="booking.bodyArea" required><option disabled value="">Selecciona una zona</option><option v-for="area in bodyAreas" :key="area">{{ area }}</option></select></label>
          <label class="screen-field">Tamaño aproximado *<select v-model="booking.size" required><option disabled value="">Selecciona el tamaño</option><option v-for="size in sizes" :key="size">{{ size }}</option></select></label>
          <label class="screen-field screen-field--full">Describe tu idea *<textarea v-model.trim="booking.idea" minlength="10" maxlength="1200" required placeholder="Motivo, referencias o significado que te gustaría explorar..." /><small>{{ booking.idea.length }} / 1200</small></label>
          <p v-if="bookingError" class="screen-error" role="alert">{{ bookingError }}</p>
          <p v-if="bookingMessage" class="screen-notice screen-field--full" role="status">{{ bookingMessage }}</p>
          <button class="button button--solid screen-field--full" type="submit" :disabled="isSubmitting">{{ isSubmitting ? 'Enviando…' : 'Enviar solicitud al estudio' }} <span>↗</span></button>
        </form>
        <aside class="booking-summary">
          <p class="eyebrow"><span></span> Resumen</p><h3>Tu consulta<br /><em>empieza aquí.</em></h3>
          <dl><div><dt>Artista</dt><dd>{{ bookingArtist || 'Por elegir' }}</dd></div><div><dt>Fecha</dt><dd>{{ bookingDate || 'Por elegir' }}</dd></div><div><dt>Horario</dt><dd>{{ booking.time || 'Por elegir' }}</dd></div><div><dt>Zona</dt><dd>{{ booking.bodyArea || 'Por elegir' }}</dd></div><div><dt>Tamaño</dt><dd>{{ booking.size || 'Por elegir' }}</dd></div></dl>
        </aside>
      </div>
    </section>

    <section id="equipo" v-show="activePage === 'equipo'" class="home-screen artists-screen page-screen">
      <p class="eyebrow"><span></span> Personas detrás de la tinta</p>
      <h2>El equipo<br /><em>Kage.</em></h2>
      <p class="screen-intro">Perfiles de muestra con especialidades de referencia. Los nombres, fotos y experiencia reales están pendientes de confirmar.</p>
      <p class="screen-notice">No se atribuyen estos diseños ni datos a personas reales del estudio.</p>
      <div class="artist-grid">
        <article v-for="artist in artistProfiles" :key="artist.slug" class="artist-card">
          <img :src="artist.image" :alt="`Imagen de referencia para ${artist.label}`" loading="lazy" />
          <div><p>{{ artist.specialty }}</p><h3>{{ artist.label }}</h3><span>{{ artist.experience }}</span>
            <button class="button button--outline" type="button" @click="selectedArtist = artist">Consultar perfil <span>↗</span></button>
            <a class="artist-book-link" href="#reserva" @click="booking.artist = artist.slug">Reservar una cita ↗</a>
          </div>
        </article>
      </div>
      <section v-if="selectedArtist" class="artist-detail">
        <button class="screen-back" type="button" @click="selectedArtist = null">← Cerrar perfil</button>
        <h3>{{ selectedArtist.label }} <em>/ {{ selectedArtist.specialty }}</em></h3>
        <p>Perfil de muestra: la biografía y trayectoria deben completarse con información autorizada del equipo.</p>
        <p>Los trabajos de referencia de esta especialidad están en la galería. <a href="#galeria">Explorar diseños ↗</a></p>
        <a class="button button--solid" href="#reserva" @click="booking.artist = selectedArtist.slug">Solicitar consulta <span>↗</span></a>
      </section>
    </section>

    <section id="perfil" v-show="activePage === 'perfil'" class="home-screen profile-screen page-screen">
      <p class="eyebrow"><span></span> Área de clientes · Este navegador</p>
      <h2>Tu espacio<br /><em>Kage.</em></h2>
      <p class="screen-intro">{{ isAuthenticated ? 'Tu cuenta y tus solicitudes sincronizadas con el estudio.' : 'Inicia sesión para consultar tus solicitudes y sincronizar tu información.' }}</p>
      <p v-if="profileMessage" class="screen-notice" role="status">{{ profileMessage }}</p>
      <section class="client-profile">
        <div class="screen-heading"><div><p class="eyebrow"><span></span> Información del usuario</p><h3>{{ profile.name || 'Perfil sin completar' }}</h3><p v-if="currentUser" class="profile-role">{{ currentUser.role === 'admin' ? 'Administrador' : 'Cliente registrado' }}</p></div><div class="inline-actions"><button v-if="isAuthenticated" class="button button--outline" type="button" @click="editingProfile = !editingProfile">{{ editingProfile ? 'Cerrar edición' : 'Editar mis datos' }}</button><button v-if="isAuthenticated" class="button button--outline" type="button" @click="logout">Cerrar sesión</button><a v-else class="button button--solid" href="#acceso">Iniciar sesión</a></div></div>
        <form v-if="editingProfile" class="profile-edit" @submit.prevent="saveClientProfile">
          <label class="screen-field">Nombre<input v-model.trim="profileDraft.name" autocomplete="name" required maxlength="100" /></label>
          <label class="screen-field">Correo electrónico<input v-model.trim="profileDraft.email" type="email" autocomplete="email" required maxlength="254" /></label>
          <button class="button button--solid" type="submit">Guardar datos <span>↗</span></button>
        </form>
        <dl v-else class="profile-data"><div><dt>Nombre</dt><dd>{{ profile.name || 'Aún no indicado' }}</dd></div><div><dt>Correo</dt><dd>{{ profile.email || 'Aún no indicado' }}</dd></div></dl>
      </section>
      <section class="profile-subsection"><div class="screen-heading"><div><p class="eyebrow"><span></span> Agenda</p><h3>Próximas <em>solicitudes.</em></h3></div><a class="text-link" href="#reserva">Nueva solicitud <span>↗</span></a></div><p class="small-disclaimer">Las solicitudes no son citas confirmadas. Para modificar una cita real, contacta con el estudio.</p>
        <article v-for="request in upcomingBookings" :key="request.id" class="saved-booking"><div><strong>{{ request.bodyArea }} · {{ request.time }}</strong><span>{{ displayDate(request.date) }} · {{ artistName(request.artist) }} · {{ request.status }}</span></div><div v-if="request.status === 'Solicitud pendiente'" class="cancel-actions"><template v-if="pendingCancellation === request.id"><span>¿Cancelar solicitud?</span><button type="button" @click="cancelBooking(request.id)">Sí, cancelar</button><button type="button" @click="pendingCancellation = null">Volver</button></template><button v-else type="button" @click="pendingCancellation = request.id">Cancelar solicitud</button></div></article>
        <p v-if="!upcomingBookings.length" class="empty-message">No tienes solicitudes próximas guardadas.</p>
      </section>
      <section class="profile-subsection"><div class="screen-heading"><div><p class="eyebrow"><span></span> Archivo personal</p><h3>Historial de <em>reservas.</em></h3></div></div>
        <article v-for="request in historyBookings" :key="request.id" class="saved-booking"><div><strong>{{ request.bodyArea }} · {{ request.time }}</strong><span>{{ displayDate(request.date) }} · {{ artistName(request.artist) }} · {{ request.status }}</span></div></article>
        <p v-if="!historyBookings.length" class="empty-message">Las solicitudes pasadas y canceladas aparecerán aquí.</p>
      </section>
      <section class="profile-subsection"><div class="screen-heading"><div><p class="eyebrow"><span></span> Colección personal</p><h3>Diseños <em>favoritos.</em></h3></div><a class="text-link" href="#galeria">Explorar trabajos <span>↗</span></a></div>
        <div v-if="favoriteDesigns.length" class="favorite-grid"><button v-for="design in favoriteDesigns" :key="design.slug" type="button" @click="selectDesign(design)"><img :src="design.image" :alt="design.imageAlt" loading="lazy" /><span>{{ design.category }}</span><strong>{{ design.name }}</strong></button></div><p v-else class="empty-message">Guarda un diseño desde la galería y aparecerá aquí.</p>
      </section>
      <section v-if="isAdmin" class="profile-subsection admin-panel">
        <div class="screen-heading"><div><p class="eyebrow"><span></span> Zona privada</p><h3>Administración <em>Kage.</em></h3></div><button class="button button--outline" type="button" :disabled="adminLoading" @click="loadAdminDashboard">{{ adminLoading ? 'Actualizando…' : 'Actualizar datos' }}</button></div>
        <p v-if="adminMessage" class="screen-notice" role="status">{{ adminMessage }}</p>
        <h4>Solicitudes recibidas · {{ adminBookings.length }}</h4>
        <article v-for="request in adminBookings" :key="request.id" class="saved-booking">
          <div><strong>#{{ request.id }} · {{ request.user?.fullName || 'Cliente' }} · {{ request.bodyArea }}</strong><span>{{ request.user?.email }} · {{ displayDate(request.date) }} · {{ request.time }} · {{ request.status === 'pending' ? 'Pendiente' : request.status === 'confirmed' ? 'Confirmada' : 'Cancelada' }}</span><span>{{ request.artist }} · {{ request.size }} · {{ request.idea }}</span></div>
          <div class="cancel-actions" v-if="request.status === 'pending'"><button type="button" @click="updateAdminBooking(request.id, 'confirmed')">Confirmar</button><button type="button" @click="updateAdminBooking(request.id, 'cancelled')">Cancelar</button></div>
        </article>
        <p v-if="!adminBookings.length" class="empty-message">Todavía no hay solicitudes registradas.</p>
        <h4>Clientes registrados · {{ adminUsers.length }}</h4>
        <article v-for="account in adminUsers" :key="account.id" class="saved-booking">
          <div><strong>{{ account.fullName }}</strong><span>{{ account.email }} · {{ account.role === 'admin' ? 'Administrador' : 'Cliente' }} · {{ account.isActive ? 'Cuenta activa' : 'Cuenta desactivada' }}</span></div>
          <button v-if="account.id !== currentUser?.id" type="button" @click="toggleUserActive(account)">{{ account.isActive ? 'Desactivar cuenta' : 'Activar cuenta' }}</button>
        </article>
      </section>
    </section>

    <section id="contacto" v-show="activePage === 'contacto'" class="home-screen contact-screen page-screen">
      <p class="eyebrow"><span></span> Estamos para escucharte</p>
      <h2>Hablemos de<br /><em>tu idea.</em></h2>
      <p class="screen-intro">Cuéntanos sobre tu proyecto. El formulario prepara un correo en tu dispositivo; el sitio no tiene un servicio de envío conectado.</p>
      <div class="contact-layout">
        <form class="screen-form contact-form" @submit.prevent="sendContact">
          <label class="screen-field">Tu nombre *<input v-model.trim="contact.name" required maxlength="100" autocomplete="name" /></label>
          <label class="screen-field">Correo electrónico *<input v-model.trim="contact.email" type="email" required maxlength="254" autocomplete="email" /></label>
          <label class="screen-field screen-field--full">Mensaje *<textarea v-model.trim="contact.message" required minlength="10" maxlength="1500" placeholder="¿Qué te gustaría saber o crear?" /></label>
          <p v-if="contactMessage" class="screen-notice screen-field--full" role="status">{{ contactMessage }}</p>
          <button class="button button--solid screen-field--full" type="submit">Preparar mensaje <span>↗</span></button>
        </form>
        <div class="contact-details">
          <div><span>Correo electrónico</span><a href="mailto:hola@kagetattoo.es">hola@kagetattoo.es ↗</a></div>
          <div><span>Ubicación indicada en portada</span><strong>Madrid</strong><small>La dirección del estudio no está publicada.</small></div>
          <div><span>Teléfono y horarios</span><strong>No publicados</strong><small>Consulta disponibilidad por correo.</small></div>
          <div><span>Redes sociales</span><a href="https://www.instagram.com/kage.tattoo/" target="_blank" rel="noreferrer">@kage.tattoo ↗</a></div>
        </div>
      </div>
    </section>

    <section id="acceso" v-show="activePage === 'acceso'" class="home-screen access-screen page-screen">
      <div class="access-panel">
        <div><p class="eyebrow"><span></span> Área de clientes</p><h2>Tu espacio<br /><em>personal.</em></h2><p>{{ isRegister ? 'Crea tu cuenta para enviar y consultar solicitudes.' : 'Accede a tu cuenta para gestionar tus solicitudes y datos.' }}</p></div>
        <form class="screen-form" @submit.prevent="submitLogin">
          <label v-if="isRegister" class="screen-field">Nombre completo<input v-model.trim="registerName" autocomplete="name" required maxlength="120" /></label>
          <label class="screen-field">Correo electrónico<input v-model.trim="loginEmail" type="email" required autocomplete="email" maxlength="190" /></label>
          <label class="screen-field">Contraseña<input v-model="loginPassword" type="password" required :autocomplete="isRegister ? 'new-password' : 'current-password'" minlength="6" maxlength="72" /></label>
          <p v-if="loginMessage" class="screen-notice" role="status">{{ loginMessage }}</p>
          <button class="button button--solid" type="submit" :disabled="isSubmitting">{{ isSubmitting ? 'Procesando…' : (isRegister ? 'Crear cuenta' : 'Iniciar sesión') }} <span>↗</span></button>
          <button class="text-link" type="button" @click="isRegister = !isRegister; loginMessage = ''">{{ isRegister ? 'Ya tengo una cuenta · Iniciar sesión' : '¿No tienes cuenta? Crear una' }}</button>
          <a class="text-link" href="#perfil">Ir a mi perfil <span>↗</span></a>
        </form>
      </div>
    </section>

    <footer v-show="activePage === 'acceso'" class="site-footer">
      <span>© 2026 Kage Tattoo Studio</span>
      <span>静けさの中に力あり</span>
      <span class="footer-links">
        <a href="#equipo">Equipo</a>
        <a href="#contacto">Contacto</a>
        <a href="#perfil">Mi perfil</a>
        <a href="#proceso">Proceso</a>
        <a href="#acceso">Iniciar sesión</a>
        <a href="#inicio">Volver arriba ↑</a>
      </span>
    </footer>

    <div class="book-controls" aria-label="Controles de páginas">
      <button type="button" :disabled="activePageIndex === 0" aria-label="Página anterior" @click="turnPage(-1)">← <span>Anterior</span></button>
      <span class="book-controls__count">{{ (activePageIndex + 1).toString().padStart(2, '0') }} <i>/</i> {{ pageCount.toString().padStart(2, '0') }}</span>
      <button type="button" :disabled="activePageIndex === pageCount - 1" aria-label="Página siguiente" @click="turnPage(1)"><span>Siguiente</span> →</button>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import heroImage from '~/assets/ChatGPT Image 10 sept 2026, 15_29_35.png'
import { artistProfiles, categories, designs, type TattooDesign } from '~/data/studio'
import { AUTH_TOKEN_KEY, type ApiBooking, type ApiUser, normalizeApiError } from '~/utils/api-client'
import {
  formatBookingDate,
  readBookings,
  readFavorites,
  readProfile,
  saveFavorites,
  type BookingRequest,
  type ClientProfile,
} from '~/utils/studio-storage'

const heroStyle = `url("${heroImage}")`
const menuOpen = ref(false)
const studioSpaces = [
  {
    title: 'Un espacio sereno',
    description: 'Un ambiente de referencia pensado para conversar y dar forma a cada proyecto.',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85',
    alt: 'Interior contemporáneo de referencia, con luz natural',
  },
  {
    title: 'Zona de trabajo',
    description: 'Un vistazo de inspiración a los detalles y la preparación del entorno.',
    image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=85',
    alt: 'Espacio de interiorismo de referencia con superficies claras',
  },
  {
    title: 'El ambiente Kage',
    description: 'Texturas y contrastes que evocan el lenguaje visual del estudio.',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85',
    alt: 'Interior de referencia con tonos oscuros y luz cálida',
  },
]
const studioStyles = [
  {
    index: '01 / CONTRASTE',
    name: 'Blackwork',
    description: 'Composiciones de alto contraste que construyen formas con tinta negra.',
    image: designs[2]!.image,
    alt: 'Diseño de tatuaje de referencia con composición oscura',
  },
  {
    index: '02 / DETALLE',
    name: 'Fine line',
    description: 'Trazos delicados y detalles sutiles en composiciones de línea fina.',
    image: designs[5]!.image,
    alt: 'Composición de tatuaje de referencia con trazos finos',
  },
  {
    index: '03 / SOMBRA',
    name: 'Realismo',
    description: 'Volumen y profundidad que evocan la riqueza de una imagen.',
    image: designs[0]!.image,
    alt: 'Detalle de tatuaje de referencia con sombras y textura',
  },
  {
    index: '04 / TRADICIÓN',
    name: 'Japonés tradicional',
    description: 'Motivos, naturaleza y símbolos inspirados en el imaginario japonés.',
    image: designs[1]!.image,
    alt: 'Guerrero frente al monte Fuji y flores de sakura',
  },
  {
    index: '05 / COLOR',
    name: 'Tradicional',
    description: 'Siluetas reconocibles, líneas expresivas y composiciones con carácter.',
    image: designs[3]!.image,
    alt: 'Tatuaje de inspiración japonesa en el brazo',
  },
]
const pageIds = ['inicio', 'estudio', 'especialidades', 'frase', 'proceso', 'galeria', 'reserva', 'equipo', 'perfil', 'contacto', 'acceso']
const pageCount = pageIds.length
const activePage = ref('inicio')
const activePageIndex = computed(() => pageIds.indexOf(activePage.value))
const selectedCategory = ref('Todos')
const selectedDesign = ref<TattooDesign | null>(null)
const selectedArtist = ref<(typeof artistProfiles)[number] | null>(null)
const favorites = ref<string[]>([])
const bookings = ref<BookingRequest[]>([])
const profile = ref<ClientProfile>({ name: '', email: '' })
const profileDraft = reactive({ name: '', email: '' })
const editingProfile = ref(false)
const profileMessage = ref('')
const storageMessage = ref('')
const bookingMessage = ref('')
const bookingError = ref('')
const contactMessage = ref('')
const loginMessage = ref('')
const pendingCancellation = ref<string | null>(null)
const minDate = ref('')
const loginEmail = ref('')
const loginPassword = ref('')
const registerName = ref('')
const isRegister = ref(false)
const isSubmitting = ref(false)
const authToken = ref('')
const currentUser = ref<ApiUser | null>(null)
const isAuthenticated = computed(() => Boolean(authToken.value && currentUser.value))
const isAdmin = computed(() => currentUser.value?.role === 'admin')
const adminBookings = ref<(ApiBooking & { user?: ApiUser })[]>([])
const adminUsers = ref<(ApiUser & { isActive: boolean })[]>([])
const adminMessage = ref('')
const adminLoading = ref(false)
const runtimeConfig = useRuntimeConfig()
const apiBase = String(runtimeConfig.public.apiBase).replace(/\/$/, '')
const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
const formatBookingTime = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  const suffix = hours < 12 ? 'AM' : 'PM'
  const displayHour = hours % 12 || 12
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${suffix}`
}
const bodyAreas = ['Brazo', 'Espalda', 'Pierna', 'Hombro', 'Pecho', 'Costillas', 'Otra zona']
const sizes = ['Pequeño · hasta 8 cm', 'Mediano · 8–18 cm', 'Grande · más de 18 cm', 'Por definir en consulta']
const booking = reactive({
  name: '',
  email: '',
  artist: '',
  date: '',
  time: '',
  bodyArea: '',
  size: '',
  idea: '',
})
const contact = reactive({ name: '', email: '', message: '' })

const visibleDesigns = computed(() => selectedCategory.value === 'Todos'
  ? designs
  : designs.filter((design) => design.category === selectedCategory.value))
const relatedDesigns = computed(() => {
  if (!selectedDesign.value) return []
  const sameCategory = designs.filter((design) => design.slug !== selectedDesign.value?.slug && design.category === selectedDesign.value?.category)
  return (sameCategory.length ? sameCategory : designs.filter((design) => design.slug !== selectedDesign.value?.slug)).slice(0, 3)
})
const favoriteDesigns = computed(() => favorites.value
  .map((slug) => designs.find((design) => design.slug === slug))
  .filter((design): design is TattooDesign => design !== undefined))
const today = new Date()
const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
const upcomingBookings = computed(() => bookings.value.filter((request) => request.date >= todayKey && (request.status === 'Solicitud pendiente' || request.status === 'Solicitud confirmada')))
const historyBookings = computed(() => bookings.value.filter((request) => request.date < todayKey || request.status === 'Solicitud cancelada'))
const bookingArtist = computed(() => artistProfiles.find((artist) => artist.slug === booking.artist)?.label ?? '')
const bookingDate = computed(() => booking.date
  ? new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' }).format(new Date(`${booking.date}T12:00:00`))
  : '')

onMounted(() => {
  const today = new Date()
  minDate.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  loadLocalData()
  void loadAccountData()
  window.addEventListener('hashchange', handleHashChange)
  window.addEventListener('keydown', handlePageKeydown)
  document.addEventListener('click', handlePageLinkClick)
  setPageFromHash()
})
onUnmounted(() => {
  window.removeEventListener('hashchange', handleHashChange)
  window.removeEventListener('keydown', handlePageKeydown)
  document.removeEventListener('click', handlePageLinkClick)
})

function loadLocalData() {
  try {
    favorites.value = readFavorites()
    profile.value = readProfile()
    profileDraft.name = profile.value.name
    profileDraft.email = profile.value.email
    authToken.value = localStorage.getItem(AUTH_TOKEN_KEY) || ''
  } catch (error) {
    storageMessage.value = error instanceof Error ? error.message : 'No se pudieron cargar los datos guardados en este navegador.'
    profileMessage.value = storageMessage.value
  }
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {})
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (authToken.value) headers.set('Authorization', `Bearer ${authToken.value}`)
  const response = await fetch(`${apiBase}${path}`, { ...options, headers })
  const payload = await response.json().catch(() => null)
  if (!response.ok) throw new Error(normalizeApiError(payload, `La solicitud falló (HTTP ${response.status}).`))
  return payload as T
}

function mapApiBooking(item: ApiBooking): BookingRequest {
  return {
    id: String(item.id), artist: item.artist, date: String(item.date).slice(0, 10), time: String(item.time).slice(0, 5),
    bodyArea: item.bodyArea, size: item.size, idea: item.idea,
    name: item.user?.fullName || profile.value.name, email: item.user?.email || profile.value.email,
    status: item.status === 'confirmed' ? 'Solicitud confirmada' : item.status === 'cancelled' ? 'Solicitud cancelada' : 'Solicitud pendiente',
    createdAt: item.createdAt,
  }
}

async function loadAccountData() {
  if (!authToken.value) {
    bookings.value = readBookings()
    return
  }
  try {
    const response = await apiRequest<{ user: ApiUser }>('/auth/profile')
    currentUser.value = response.user
    profile.value = { name: response.user.fullName, email: response.user.email }
    booking.name = profile.value.name; booking.email = profile.value.email
    profileDraft.name = profile.value.name
    profileDraft.email = profile.value.email
    const remoteBookings = await apiRequest<ApiBooking[]>('/bookings/mine')
    bookings.value = remoteBookings.map(mapApiBooking)
    if (isAdmin.value) await loadAdminDashboard()
    profileMessage.value = ''
  } catch (error) {
    authToken.value = ''
    currentUser.value = null
    localStorage.removeItem(AUTH_TOKEN_KEY)
    bookings.value = readBookings()
    profileMessage.value = error instanceof Error ? `No se pudo sincronizar tu cuenta: ${error.message}` : 'No se pudo sincronizar tu cuenta.'
  }
}

function selectDesign(design: TattooDesign) {
  selectedDesign.value = design
  navigateToPage('detalle')
}

function clearSelectedDesign() {
  selectedDesign.value = null
  navigateToPage('galeria')
}

function handleHashChange() {
  setPageFromHash()
}

function setPageFromHash() {
  const hash = decodeURIComponent(window.location.hash.slice(1))
  const aliases: Record<string, string> = {
    trabajos: 'especialidades',
    detalle: 'galeria',
  }
  const page = aliases[hash] ?? hash
  if (pageIds.includes(page)) activePage.value = page
  if (hash !== 'detalle' && hash !== 'galeria') selectedDesign.value = null
}

function navigateToPage(page: string) {
  const aliases: Record<string, string> = {
    trabajos: 'especialidades',
    detalle: 'galeria',
  }
  const destination = aliases[page] ?? page
  if (!pageIds.includes(destination)) return
  activePage.value = destination
  if (page === 'detalle' || page === 'galeria') selectedDesign.value = page === 'detalle' ? selectedDesign.value : null
  if (window.location.hash !== `#${page}`) window.location.hash = page
  window.scrollTo({ top: 0, behavior: 'auto' })
}

function handlePageLinkClick(event: MouseEvent) {
  const target = event.target
  if (!(target instanceof Element)) return
  const link = target.closest<HTMLAnchorElement>('a[href^="#"]')
  if (!link) return
  const hash = decodeURIComponent(link.hash.slice(1))
  const aliases: Record<string, string> = { trabajos: 'especialidades', detalle: 'galeria' }
  const destination = aliases[hash] ?? hash
  if (!pageIds.includes(destination)) return
  event.preventDefault()
  menuOpen.value = false
  if (hash !== 'detalle' && hash !== 'galeria') selectedDesign.value = null
  navigateToPage(hash)
}

function turnPage(direction: number) {
  const nextIndex = Math.min(pageCount - 1, Math.max(0, activePageIndex.value + direction))
  navigateToPage(pageIds[nextIndex]!)
}

function handlePageKeydown(event: KeyboardEvent) {
  if (event.altKey || event.ctrlKey || event.metaKey || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) return
  if (event.key === 'ArrowRight' || event.key === 'PageDown') turnPage(1)
  if (event.key === 'ArrowLeft' || event.key === 'PageUp') turnPage(-1)
}

function toggleFavorite(slug: string) {
  try {
    favorites.value = favorites.value.includes(slug)
      ? favorites.value.filter((favorite) => favorite !== slug)
      : [...favorites.value, slug]
    saveFavorites(favorites.value)
    storageMessage.value = ''
  } catch (error) {
    storageMessage.value = error instanceof Error ? error.message : 'No se pudo guardar el favorito en este navegador.'
  }
}

async function submitBooking() {
  bookingError.value = ''
  bookingMessage.value = ''
  if (!isAuthenticated.value) { bookingError.value = 'Inicia sesión o crea una cuenta antes de enviar tu solicitud.'; navigateToPage('acceso'); return }
  if (!booking.artist || !booking.date || !booking.time || !booking.bodyArea || !booking.size || booking.idea.length < 10) {
    bookingError.value = 'Completa todos los campos obligatorios. La idea debe tener al menos 10 caracteres.'; return
  }
  if (booking.date < minDate.value) { bookingError.value = 'Elige una fecha de hoy o posterior.'; return }
  isSubmitting.value = true
  try {
    await apiRequest<ApiBooking>('/bookings', { method: 'POST', body: JSON.stringify({ artist: booking.artist, date: booking.date, time: booking.time, bodyArea: booking.bodyArea, size: booking.size, idea: booking.idea }) })
    const remoteBookings = await apiRequest<ApiBooking[]>('/bookings/mine')
    bookings.value = remoteBookings.map(mapApiBooking)
    bookingMessage.value = '¡Solicitud enviada! El estudio la recibió y revisará la disponibilidad. La cita aún no está confirmada.'
    booking.idea = ''
    navigateToPage('perfil')
  } catch (error) {
    bookingError.value = error instanceof Error ? `No se pudo enviar la solicitud: ${error.message}` : 'No se pudo enviar la solicitud.'
  } finally { isSubmitting.value = false }
}

async function saveClientProfile() {
  if (!isAuthenticated.value) { profileMessage.value = 'Inicia sesión para actualizar tu perfil.'; return }
  try {
    const response = await apiRequest<{ user: ApiUser }>('/auth/profile', { method: 'PATCH', body: JSON.stringify({ fullName: profileDraft.name, email: profileDraft.email }) })
    currentUser.value = response.user
    profile.value = { name: response.user.fullName, email: response.user.email }
    booking.name = profile.value.name; booking.email = profile.value.email
    profileDraft.name = profile.value.name; profileDraft.email = profile.value.email
    editingProfile.value = false
    profileMessage.value = 'Tus datos se actualizaron en tu cuenta.'
  } catch (error) { profileMessage.value = error instanceof Error ? `No se pudo actualizar el perfil: ${error.message}` : 'No se pudo actualizar el perfil.' }
}

async function cancelBooking(id: string) {
  const request = bookings.value.find((item) => item.id === id)
  if (!request || request.status !== 'Solicitud pendiente' || !isAuthenticated.value) return
  try {
    await apiRequest<ApiBooking>(`/bookings/${encodeURIComponent(id)}/cancel`, { method: 'PATCH' })
    const remoteBookings = await apiRequest<ApiBooking[]>('/bookings/mine')
    bookings.value = remoteBookings.map(mapApiBooking)
    pendingCancellation.value = null
    profileMessage.value = 'La solicitud fue cancelada en el sistema del estudio.'
  } catch (error) { profileMessage.value = error instanceof Error ? `No se pudo cancelar: ${error.message}` : 'No se pudo cancelar la solicitud.' }
}

function displayDate(value: string) {
  return formatBookingDate(value)
}

function artistName(slug: string) {
  return artistProfiles.find((artist) => artist.slug === slug)?.label ?? 'Artista por confirmar'
}

function sendContact() {
  const subject = encodeURIComponent(`Consulta desde la web de Kage Tattoo · ${contact.name}`)
  const body = encodeURIComponent(`Nombre: ${contact.name}\nCorreo: ${contact.email}\n\n${contact.message}`)
  contactMessage.value = 'Se abrirá tu aplicación de correo con el mensaje preparado. El sitio no lo envía automáticamente.'
  window.location.href = `mailto:hola@kagetattoo.es?subject=${subject}&body=${body}`
}

async function submitLogin() {
  loginMessage.value = ''
  isSubmitting.value = true
  try {
    const path = isRegister.value ? '/auth/register' : '/auth/login'
    const body = isRegister.value
      ? { fullName: registerName.value.trim(), email: loginEmail.value.trim(), password: loginPassword.value }
      : { email: loginEmail.value.trim(), password: loginPassword.value }
    const response = await apiRequest<{ token: string; user: ApiUser }>(path, { method: 'POST', body: JSON.stringify(body) })
    authToken.value = response.token
    currentUser.value = response.user
    localStorage.setItem(AUTH_TOKEN_KEY, response.token)
    profile.value = { name: response.user.fullName, email: response.user.email }
    profileDraft.name = profile.value.name; profileDraft.email = profile.value.email
    loginPassword.value = ''
    isRegister.value = false
    loginMessage.value = 'Acceso correcto. Tu cuenta está conectada.'
    await loadAccountData()
    navigateToPage('perfil')
  } catch (error) {
    loginMessage.value = error instanceof Error ? error.message : 'No se pudo iniciar sesión.'
  } finally { isSubmitting.value = false }
}


async function loadAdminDashboard() {
  if (!isAdmin.value) return
  adminLoading.value = true
  adminMessage.value = ''
  try {
    const [requests, accounts] = await Promise.all([
      apiRequest<(ApiBooking & { user?: ApiUser })[]>('/bookings'),
      apiRequest<(ApiUser & { isActive: boolean })[]>('/users'),
    ])
    adminBookings.value = requests
    adminUsers.value = accounts
  } catch (error) {
    adminMessage.value = error instanceof Error ? `No se pudo cargar la administración: ${error.message}` : 'No se pudo cargar la administración.'
  } finally { adminLoading.value = false }
}

async function updateAdminBooking(id: number, status: 'confirmed' | 'cancelled') {
  try {
    await apiRequest<ApiBooking>(`/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
    await loadAdminDashboard()
    adminMessage.value = status === 'confirmed' ? 'La solicitud quedó confirmada.' : 'La solicitud quedó cancelada.'
  } catch (error) { adminMessage.value = error instanceof Error ? error.message : 'No se pudo actualizar la solicitud.' }
}

async function toggleUserActive(account: ApiUser & { isActive: boolean }) {
  try {
    await apiRequest<ApiUser & { isActive: boolean }>(`/users/${account.id}`, { method: 'PATCH', body: JSON.stringify({ isActive: !account.isActive }) })
    await loadAdminDashboard()
    adminMessage.value = account.isActive ? 'Cuenta desactivada.' : 'Cuenta activada.'
  } catch (error) { adminMessage.value = error instanceof Error ? error.message : 'No se pudo actualizar la cuenta.' }
}

function logout() {
  authToken.value = ''
  currentUser.value = null
  localStorage.removeItem(AUTH_TOKEN_KEY)
  bookings.value = readBookings()
  profileMessage.value = 'Has cerrado sesión.'
  navigateToPage('acceso')
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;1,500;1,600&display=swap');

:root {
  --ink: #101112;
  --night: #08090a;
  --paper: #e9e6df;
  --muted: #898a86;
  --red: #c92629;
}

* { box-sizing: border-box; }
html, body, #__nuxt { width: 100%; height: 100%; overflow: hidden; }
body { margin: 0; background: var(--night); color: var(--paper); font-family: 'Manrope', sans-serif; }
a { color: inherit; text-decoration: none; }
.samurai-page { position: relative; width: 100%; height: 100dvh; overflow: hidden; background: var(--night); }
.page-screen { position: absolute; inset: 0; min-height: 0; overflow: auto; padding-bottom: 105px; animation: page-turn .36s cubic-bezier(.2,.75,.25,1) both; }
.hero { height: 100%; min-height: 0; position: relative; display: flex; flex-direction: column; padding: 105px 5.5vw 30px; isolation: isolate; }
.hero__image { position: absolute; inset: 0; z-index: -2; background-image: v-bind(heroStyle); background-size: cover; background-position: center; animation: reveal 1.4s ease both; }
.hero__veil { position: absolute; inset: 0; z-index: -1; background: linear-gradient(90deg, rgba(5,6,7,.82) 0%, rgba(5,6,7,.43) 43%, rgba(5,6,7,.07) 80%), linear-gradient(0deg, rgba(5,6,7,.75), transparent 40%, rgba(5,6,7,.26)); }
.site-nav { position: absolute; z-index: 20; top: 0; right: 0; left: 0; display: flex; align-items: center; justify-content: space-between; gap: 20px; min-height: 76px; padding: 14px 5.5vw; border-bottom: 1px solid rgba(233,230,223,.18); background: rgba(8,9,10,.96); animation: rise .9s .1s ease both; }
.brand { display: flex; align-items: center; gap: 11px; font: 500 11px 'DM Mono', monospace; letter-spacing: .09em; }
.brand__mark { display: grid; place-items: center; width: 26px; height: 26px; border: 1px solid var(--red); color: var(--red); font-family: 'Playfair Display', serif; font-size: 17px; font-style: italic; }
.brand__name span { color: var(--red); }
.site-nav__links { display: flex; gap: 35px; color: rgba(233,230,223,.7); font: 400 10px 'DM Mono', monospace; text-transform: uppercase; letter-spacing: .12em; }
.site-nav__links a { transition: color .25s ease; }
.site-nav__links a:hover, .site-nav__links .is-active { color: var(--paper); }
.site-nav__links .is-active::before { content: '•'; color: var(--red); margin-right: 7px; }
.nav-actions { display: flex; align-items: center; gap: 25px; }
.nav-action { display: flex; gap: 17px; align-items: center; color: var(--paper); font: 500 10px 'DM Mono', monospace; text-transform: uppercase; letter-spacing: .1em; }
.nav-login { min-height: 36px; padding: 0 13px; border: 1px solid rgba(233,230,223,.45); background: transparent; color: var(--paper); font: 500 10px 'DM Mono', monospace; text-transform: uppercase; letter-spacing: .1em; cursor: pointer; transition: border-color .25s ease, background .25s ease; }
.nav-login:hover { border-color: var(--paper); background: rgba(233,230,223,.08); }
.nav-action span:last-child, .button span, .text-link span { color: var(--red); font-size: 16px; }
.hero__content { margin: auto 0; padding: 90px 0 70px; max-width: 600px; animation: rise 1s .2s ease both; }
.eyebrow { margin: 0 0 24px; color: var(--red); font: 500 10px 'DM Mono', monospace; letter-spacing: .17em; text-transform: uppercase; }
.eyebrow span { display: inline-block; width: 28px; height: 1px; vertical-align: middle; margin-right: 12px; background: currentColor; }
h1, h2, blockquote { margin: 0; font-family: 'Playfair Display', serif; font-weight: 500; letter-spacing: -.045em; line-height: .92; }
h1 { font-size: clamp(76px, 10.2vw, 154px); }
h1 em, h2 em, blockquote em { color: var(--red); font-style: italic; }
.hero__intro { max-width: 385px; margin: 31px 0 33px 5px; color: rgba(233,230,223,.7); font-size: 13px; line-height: 1.75; }
.hero__actions { display: flex; align-items: center; gap: 25px; }
.button { display: inline-flex; align-items: center; gap: 22px; min-height: 45px; padding: 0 18px; font: 500 10px 'DM Mono', monospace; letter-spacing: .11em; text-transform: uppercase; transition: transform .25s ease, background .25s ease; }
.button:hover { transform: translateY(-3px); }
.button--solid { background: var(--paper); color: var(--ink); }
.button--solid span { color: var(--red); }
.button--quiet { padding-left: 0; color: var(--paper); }
.play { display: grid; place-items: center; width: 29px; height: 29px; border: 1px solid rgba(233,230,223,.45); border-radius: 50%; color: var(--paper) !important; font-size: 8px !important; }
.hero__footer { display: flex; justify-content: space-between; align-items: center; color: rgba(233,230,223,.65); font: 10px 'DM Mono', monospace; letter-spacing: .1em; text-transform: uppercase; }
.hero__footer p { margin: 0; }.hero__footer p span { color: var(--red); margin: 0 8px; }.scroll-cue { display: flex; align-items: center; gap: 10px; }.scroll-cue span { width: 34px; height: 1px; background: var(--red); }
.intro-section { display: grid; grid-template-columns: 1fr 1fr; gap: 8vw; padding: 145px 13vw 150px; background: var(--paper); color: var(--ink); }
.intro-section.page-screen { align-content: center; }
.intro-section .eyebrow { margin-bottom: 28px; }.intro-section h2, .feature-content h2 { font-size: clamp(54px, 6.6vw, 100px); }
.intro-copy { align-self: end; max-width: 390px; padding-bottom: 4px; }.intro-copy p, .feature-content > p:not(.eyebrow):not(.feature-index) { margin: 0 0 30px; color: #555553; font-size: 14px; line-height: 1.85; }
.text-link { border-bottom: 1px solid #aaa7a0; padding-bottom: 10px; font: 500 10px 'DM Mono', monospace; letter-spacing: .1em; text-transform: uppercase; }.text-link span { margin-left: 23px; }
.studio-about { padding: clamp(108px,14vh,145px) clamp(22px,7vw,110px) 145px; background: radial-gradient(ellipse at 88% 5%,rgba(31,55,61,.22),transparent 34%),var(--night); color: var(--paper); }
.studio-about__hero { display:grid; grid-template-columns:minmax(0,.85fr) minmax(0,1fr); align-items:center; gap:clamp(35px,7vw,100px); }
.studio-about__hero h1 { font-size:clamp(54px,7vw,94px); line-height:.98; }
.studio-about__lede { max-width:500px; margin:23px 0 27px; color:rgba(233,230,223,.68); font-size:13px; line-height:1.85; }
.studio-about__hero-image { position:relative; height:clamp(300px,43vw,540px); margin:0; overflow:hidden; background:#192124; }
.studio-about__hero-image::after { position:absolute; inset:40% 0 0; background:linear-gradient(transparent,rgba(5,6,7,.75)); content:''; }
.studio-about__hero-image img,.studio-about__image img,.studio-about__artist img { display:block; width:100%; height:100%; object-fit:cover; }
.studio-about__hero-image img,.studio-about__image img { transition:transform .5s ease; }
.studio-about__hero-image:hover img,.studio-about__space:hover img,.studio-about__style:hover img { transform:scale(1.035); }
.studio-about__hero-image figcaption { position:absolute; z-index:1; right:18px; bottom:17px; left:18px; color:var(--paper); font:9px 'DM Mono',monospace; letter-spacing:.1em; text-transform:uppercase; }
.studio-about__intro { display:grid; grid-template-columns:.7fr 1fr; gap:8vw; align-items:start; margin-top:85px; padding:30px 0; border-top:1px solid rgba(233,230,223,.16); border-bottom:1px solid rgba(233,230,223,.16); }
.studio-about__intro .eyebrow { margin:5px 0 0; }
.studio-about__intro > p:last-child { max-width:680px; margin:0; color:#999b98; font-size:14px; line-height:1.9; }
.studio-about__section { margin-top:95px; }
.studio-about__heading { display:flex; align-items:end; justify-content:space-between; gap:35px; margin-bottom:30px; }
.studio-about__heading h2,.studio-about__care h2,.studio-about__experience h2,.studio-about__end h2 { margin:0; font:500 clamp(38px,5.2vw,65px)/1 'Playfair Display',serif; letter-spacing:-.04em; }
.studio-about__heading h2 em,.studio-about__care h2 em,.studio-about__experience h2 em,.studio-about__end h2 em { color:var(--red); }
.studio-about__heading > p { max-width:480px; margin:0 0 3px; color:#999b98; font-size:11px; line-height:1.85; }
.studio-about__spaces { display:grid; grid-template-columns:1.15fr 1fr 1fr; gap:15px; }
.studio-about__space,.studio-about__style { min-width:0; margin:0; overflow:hidden; border:1px solid rgba(233,230,223,.16); background:linear-gradient(145deg,rgba(25,33,36,.8),rgba(14,17,18,.96)); }
.studio-about__image { position:relative; height:clamp(170px,21vw,275px); overflow:hidden; background:#192124; }
.studio-about__image::after { position:absolute; inset:45% 0 0; background:linear-gradient(transparent,rgba(5,6,7,.68)); content:''; }
.studio-about__image > span { position:absolute; z-index:1; bottom:13px; left:14px; color:var(--paper); font:9px 'DM Mono',monospace; letter-spacing:.1em; }
.studio-about__space figcaption { padding:17px; }
.studio-about__space h3,.studio-about__style h3,.studio-about__artist h3,.studio-about__care h3 { margin:0; font:500 20px 'Playfair Display',serif; }
.studio-about__space figcaption p,.studio-about__style > div:last-child p { margin:7px 0 0; color:#999b98; font-size:10px; line-height:1.75; }
.studio-about__styles { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:12px; }
.studio-about__style .studio-about__image { height:clamp(140px,17vw,220px); }
.studio-about__style > div:last-child { padding:15px 13px 17px; }
.studio-about__style h3 { font-size:18px; }
.studio-about__style > div:last-child p { font-size:10px; }
.studio-about__artists { padding-top:40px; border-top:1px solid rgba(233,230,223,.16); }
.studio-about__artist-list { border-top:1px solid rgba(233,230,223,.16); }
.studio-about__artist { display:grid; grid-template-columns:64px minmax(0,1fr) auto; align-items:center; gap:17px; padding:12px 0; border-bottom:1px solid rgba(233,230,223,.16); }
.studio-about__artist img { width:64px; height:64px; filter:saturate(.72); background:#192124; }
.studio-about__artist > div > p { margin:0 0 4px; color:var(--red); font:9px 'DM Mono',monospace; letter-spacing:.08em; text-transform:uppercase; }
.studio-about__artist h3 { font-size:20px; }
.studio-about__artist > div > span,.studio-about__artist-note { display:block; margin-top:4px; color:#999b98; font-size:10px; }
.studio-about__artist-note { font:9px 'DM Mono',monospace; text-align:right; text-transform:uppercase; }
.studio-about__artists .text-link { display:inline-block; margin-top:19px; border-color:rgba(233,230,223,.3); }
.studio-about__artists .text-link span { color:var(--red); }
.studio-about__care { display:grid; grid-template-columns:54px minmax(0,.9fr) minmax(0,1.1fr); gap:clamp(20px,4vw,48px); align-items:start; margin-top:95px; padding:clamp(25px,4vw,48px); border:1px solid rgba(233,230,223,.16); background:linear-gradient(125deg,rgba(25,33,36,.8),rgba(14,17,18,.95)); }
.studio-about__mark { display:grid; place-items:center; width:48px; height:48px; border:1px solid rgba(201,38,41,.55); color:var(--red); font:25px 'Playfair Display',serif; }
.studio-about__care h2 { font-size:clamp(30px,3.8vw,46px); }
.studio-about__care > div:nth-child(2) > p:last-child,.studio-about__experience > div:last-child > p { max-width:460px; margin:15px 0 0; color:#999b98; font-size:11px; line-height:1.85; }
.studio-about__care ul,.studio-about__experience ol { margin:0; padding:0; list-style:none; }
.studio-about__care li,.studio-about__experience li { display:grid; grid-template-columns:32px 1fr; gap:13px; padding:13px 0; border-bottom:1px solid rgba(233,230,223,.16); }
.studio-about__care li:first-child,.studio-about__experience li:first-child { padding-top:0; }
.studio-about__care li > span,.studio-about__experience li > span { color:var(--red); font:10px 'DM Mono',monospace; }
.studio-about__care h3 { font-size:17px; }
.studio-about__care li p { margin:5px 0 0; color:#999b98; font-size:10px; line-height:1.7; }
.studio-about__experience { display:grid; grid-template-columns:.8fr 1fr; gap:8vw; margin-top:95px; }
.studio-about__experience > div:last-child > p { margin:0 0 18px; font-size:12px; }
.studio-about__experience li { color:var(--paper); font-size:10px; line-height:1.6; }
.studio-about__end { display:flex; align-items:end; justify-content:space-between; gap:25px; margin-top:95px; padding:clamp(25px,4vw,48px); border:1px solid rgba(233,230,223,.16); background:linear-gradient(110deg,rgba(25,33,36,.82),rgba(14,17,18,.96)); }
.studio-about__end > div > p:last-child { max-width:440px; margin:13px 0 0; color:#999b98; font-size:11px; line-height:1.8; }
.feature-section { display: grid; grid-template-columns: 1fr 1fr; min-height: 100%; background: #17191a; }
.feature-image { background-image: url('~/assets/ChatGPT Image 10 sept 2026, 15_30_04.png'); background-size: cover; background-position: center; min-height: 480px; }.feature-content { display: flex; flex-direction: column; justify-content: center; padding: 85px 12vw 85px 9vw; }.feature-content .eyebrow { margin-bottom: 68px; }.feature-content .feature-index { align-self: flex-end; margin: -88px 0 35px; color: var(--red); font: 10px 'DM Mono', monospace; }.feature-content h2 { margin-bottom: 34px; }.feature-content > p:not(.eyebrow):not(.feature-index) { color: #a6a7a2; max-width: 320px; }.button--outline { border: 1px solid rgba(233,230,223,.4); width: fit-content; color: var(--paper); }.button--outline:hover { background: var(--paper); color: var(--ink); }
.quote-section { min-height: 100%; display: flex; flex-direction: column; justify-content: center; padding: 100px 13vw; background: #0d0e0f; position: relative; }.quote-mark { position: absolute; top: 130px; left: 13vw; margin: 0; color: var(--red); font: 130px 'Playfair Display', serif; line-height: .5; }.quote-section blockquote { font-size: clamp(47px, 7vw, 94px); margin-bottom: 42px; }.quote-source { margin: 0; color: #777873; font: 10px 'DM Mono', monospace; letter-spacing: .14em; text-transform: uppercase; }
.site-footer { display: flex; justify-content: space-between; padding: 25px 5.5vw; border-top: 1px solid #27292a; color: #676965; font: 9px 'DM Mono', monospace; letter-spacing: .1em; text-transform: uppercase; }.site-footer a { color: var(--paper); }
.footer-links { display: flex; flex-wrap: wrap; gap: 18px; }
.home-screen { padding: 115px 8vw 120px; border-top: 1px solid #25292a; background: radial-gradient(ellipse at 85% 8%, rgba(28, 48, 53, .3), transparent 38%), #0b0d0e; }
.home-screen h2 { margin: 0; font: 500 clamp(48px, 7vw, 88px)/.98 'Playfair Display', serif; letter-spacing: -.045em; }
.home-screen h2 em, .home-screen h3 em { color: var(--red); }
.screen-intro { max-width: 600px; margin: 21px 0 0; color: #a3a5a1; font-size: 13px; line-height: 1.85; }
.process-screen { background: var(--paper); color: var(--ink); }
.process-screen .screen-intro { color: #555553; }
.process-steps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; margin: 48px 0 35px; }
.process-steps article { padding: 25px; border: 1px solid rgba(16, 17, 18, .2); }
.process-steps article > span, .screen-counter { color: var(--red); font: 9px 'DM Mono', monospace; letter-spacing: .12em; }
.process-steps h3 { margin: 22px 0 11px; font: 500 25px 'Playfair Display', serif; }
.process-steps p { margin: 0; color: #555553; font-size: 12px; line-height: 1.8; }
.screen-heading { display: flex; align-items: end; justify-content: space-between; gap: 30px; }
.screen-counter { flex: 0 0 auto; margin-bottom: 10px; }
.category-filters { display: flex; flex-wrap: wrap; gap: 8px; margin: 40px 0 26px; padding: 15px 0; border-top: 1px solid #343738; border-bottom: 1px solid #343738; }
.category-filters button, .screen-back { padding: 9px 12px; border: 1px solid transparent; background: transparent; color: #9b9d99; cursor: pointer; font: 9px 'DM Mono', monospace; letter-spacing: .08em; text-transform: uppercase; transition: color .2s ease, border-color .2s ease; }
.category-filters button:hover, .category-filters button.is-active { border-color: var(--red); color: var(--paper); }
.screen-notice { padding: 13px 16px; border-left: 2px solid var(--red); background: rgba(201, 38, 41, .09); color: #ded8cf; font-size: 11px; line-height: 1.7; }
.home-design-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 17px; }
.home-design-card { overflow: hidden; border: 1px solid #303435; background: #111415; }
.home-design-card__image { position: relative; display: block; width: 100%; height: clamp(220px, 28vw, 350px); overflow: hidden; padding: 0; border: 0; background: #1b2224; cursor: pointer; text-align: left; }
.home-design-card__image img { width: 100%; height: 100%; object-fit: cover; transition: transform .45s ease; }
.home-design-card__image:hover img { transform: scale(1.04); }
.home-design-card__image span { position: absolute; bottom: 12px; left: 12px; padding: 7px 9px; background: rgba(8, 9, 10, .8); color: var(--paper); font: 9px 'DM Mono', monospace; text-transform: uppercase; }
.home-design-card__caption { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px; }
.home-design-card__title { border: 0; background: none; color: var(--paper); cursor: pointer; font: 500 17px 'Playfair Display', serif; text-align: left; }
.favorite-button { width: 34px; height: 34px; border: 1px solid #343738; background: transparent; color: var(--red); cursor: pointer; font-size: 19px; }
.tattoo-detail { margin-top: 35px; padding: clamp(20px, 4vw, 46px); border: 1px solid #343738; background: rgba(17, 21, 22, .85); }
.screen-back { padding-left: 0; }
.tattoo-detail__layout { display: grid; grid-template-columns: minmax(0, .95fr) minmax(0, 1fr); gap: clamp(25px, 5vw, 65px); align-items: center; margin-top: 20px; }
.tattoo-detail__layout > img { width: 100%; height: clamp(350px, 48vw, 620px); object-fit: cover; }
.tattoo-detail__copy h3 { margin: 0; font: 500 clamp(39px, 5.5vw, 68px)/1 'Playfair Display', serif; }
.tattoo-detail__copy > p:not(.eyebrow) { color: #a3a5a1; font-size: 13px; line-height: 1.8; }
.tattoo-detail dl { margin: 22px 0; }
.tattoo-detail dl > div, .booking-summary dl > div { display: flex; justify-content: space-between; gap: 15px; padding: 12px 0; border-top: 1px solid #343738; }
.tattoo-detail dt, .booking-summary dt, .profile-data dt { color: #969994; font: 9px 'DM Mono', monospace; letter-spacing: .08em; text-transform: uppercase; }
.tattoo-detail dd, .booking-summary dd, .profile-data dd { max-width: 62%; margin: 0; color: var(--paper); font-size: 11px; line-height: 1.6; text-align: right; }
.inline-actions { display: flex; flex-wrap: wrap; gap: 10px; }
.related-designs { margin-top: 45px; padding-top: 27px; border-top: 1px solid #343738; }
.related-designs__grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.related-designs__grid button, .favorite-grid button { position: relative; min-height: 220px; overflow: hidden; padding: 0 16px 15px; border: 0; background: #161b1c; color: var(--paper); cursor: pointer; text-align: left; }
.related-designs__grid img, .favorite-grid img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.related-designs__grid button::after, .favorite-grid button::after { position: absolute; inset: 30% 0 0; background: linear-gradient(transparent, rgba(4, 5, 5, .92)); content: ''; }
.related-designs__grid span, .related-designs__grid strong, .favorite-grid span, .favorite-grid strong { position: relative; z-index: 1; display: block; }
.related-designs__grid span, .favorite-grid span { color: #f06464; font: 9px 'DM Mono', monospace; text-transform: uppercase; }
.related-designs__grid strong, .favorite-grid strong { margin-top: 7px; font: 500 19px 'Playfair Display', serif; }
.screen-notice { margin: 20px 0; }
.booking-layout { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(260px, .7fr); gap: 20px; align-items: start; margin-top: 35px; }
.screen-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.booking-form, .contact-form, .booking-summary, .client-profile, .access-panel { padding: clamp(20px, 3.5vw, 38px); border: 1px solid #343738; background: rgba(17, 21, 22, .86); }
.screen-field { display: flex; min-width: 0; flex-direction: column; gap: 8px; color: var(--paper); font: 9px 'DM Mono', monospace; letter-spacing: .08em; text-transform: uppercase; }
.screen-field input, .screen-field select, .screen-field textarea { width: 100%; min-height: 43px; padding: 11px; border: 1px solid #3c4142; border-radius: 0; outline: none; background: #0a0c0d; color: var(--paper); font: 12px 'Manrope', sans-serif; letter-spacing: normal; text-transform: none; }
.screen-field textarea { min-height: 112px; resize: vertical; }
.screen-field input:focus, .screen-field select:focus, .screen-field textarea:focus { border-color: var(--red); }
.screen-field--full { grid-column: 1 / -1; }
.screen-field small, .booking-time small { color: #858985; font: 9px/1.6 'DM Mono', monospace; }
.booking-time { min-width: 0; margin: 0; padding: 0; border: 0; }
.booking-time legend { margin-bottom: 8px; }
.booking-times { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.booking-times label { display: grid; min-height: 38px; place-items: center; border: 1px solid #343738; color: #9b9d99; cursor: pointer; font: 10px 'DM Mono', monospace; }
.booking-times label.is-active { border-color: var(--red); color: var(--paper); }
.booking-times input { position: absolute; width: 1px; height: 1px; opacity: 0; }
.booking-summary { position: sticky; top: 20px; }
.booking-summary h3 { margin: 0 0 20px; font: 500 34px/1.05 'Playfair Display', serif; }
.booking-summary h3 em { color: var(--red); }
.screen-error { grid-column: 1 / -1; margin: 0; color: #f09191; font-size: 11px; line-height: 1.6; }
.artists-screen { background: #101314; }
.artist-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-top: 28px; }
.artist-card { overflow: hidden; border: 1px solid #343738; background: #0b0d0e; }
.artist-card > img { display: block; width: 100%; height: 300px; object-fit: cover; }
.artist-card > div { display: grid; gap: 10px; padding: 18px; }
.artist-card p { margin: 0; color: var(--red); font: 9px 'DM Mono', monospace; text-transform: uppercase; }
.artist-card h3 { margin: 0; font: 500 25px 'Playfair Display', serif; }
.artist-card > div > span { color: #969994; font-size: 11px; }
.artist-card .button { justify-content: space-between; }
.artist-book-link { color: var(--paper); font: 9px 'DM Mono', monospace; letter-spacing: .08em; text-transform: uppercase; }
.artist-detail { margin-top: 28px; padding: 25px; border: 1px solid #343738; background: #111516; }
.artist-detail h3 { font: 500 31px 'Playfair Display', serif; }
.artist-detail h3 em { color: var(--red); font-size: 19px; }
.artist-detail p { color: #a3a5a1; font-size: 12px; line-height: 1.8; }
.artist-detail p a { color: var(--paper); text-decoration: underline; }
.client-profile { margin-top: 28px; }
.screen-heading h3, .profile-subsection h3 { margin: 0; font: 500 29px 'Playfair Display', serif; }
.profile-data { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin: 23px 0 0; }
.profile-data dt { margin-bottom: 7px; }
.profile-data dd { max-width: none; text-align: left; }
.profile-edit { display: grid; grid-template-columns: 1fr 1fr auto; align-items: end; gap: 12px; margin-top: 20px; }
.profile-subsection { margin-top: 48px; }
.small-disclaimer, .empty-message { color: #969994; font-size: 11px; line-height: 1.7; }
.saved-booking { display: flex; justify-content: space-between; align-items: center; gap: 15px; margin-top: 9px; padding: 17px; border: 1px solid #343738; background: #111516; }
.saved-booking > div:first-child { display: grid; gap: 6px; }
.saved-booking strong { font: 500 18px 'Playfair Display', serif; }
.saved-booking span, .cancel-actions { color: #a3a5a1; font-size: 10px; }
.cancel-actions { display: flex; flex-wrap: wrap; justify-content: end; gap: 10px; align-items: center; }
.cancel-actions button { border: 0; background: none; color: var(--paper); cursor: pointer; font: 9px 'DM Mono', monospace; text-transform: uppercase; }
.favorite-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 17px; }
.contact-layout { display: grid; grid-template-columns: 1.1fr .8fr; gap: clamp(25px, 7vw, 85px); margin-top: 32px; }
.contact-details { display: grid; align-content: start; }
.contact-details > div { display: grid; gap: 8px; padding: 19px 0; border-bottom: 1px solid #343738; }
.contact-details > div:first-child { padding-top: 0; }
.contact-details span { color: var(--red); font: 9px 'DM Mono', monospace; letter-spacing: .1em; text-transform: uppercase; }
.contact-details a, .contact-details strong { color: var(--paper); font: 500 20px 'Playfair Display', serif; }
.contact-details small { color: #969994; font-size: 10px; }
.access-screen { background: #101314; }
.access-panel { display: grid; grid-template-columns: 1fr .8fr; gap: 50px; max-width: 980px; margin: 0 auto; }
.access-panel h2 { font-size: clamp(42px, 6vw, 72px); }
.access-panel > div > p:last-child { max-width: 400px; color: #a3a5a1; font-size: 12px; line-height: 1.8; }
.access-panel form { align-content: center; }
.mobile-nav-toggle { display: none; }
.book-controls { position: absolute; z-index: 25; right: 5.5vw; bottom: 18px; left: 5.5vw; display: flex; align-items: center; justify-content: space-between; pointer-events: none; }
.book-controls button { display: inline-flex; align-items: center; gap: 12px; min-height: 42px; padding: 0 15px; border: 1px solid rgba(233,230,223,.35); background: rgba(8,9,10,.92); color: var(--paper); cursor: pointer; font: 10px 'DM Mono', monospace; letter-spacing: .1em; text-transform: uppercase; pointer-events: auto; transition: border-color .2s ease, color .2s ease; }
.book-controls button:hover:not(:disabled) { border-color: var(--red); color: #fff; }
.book-controls button:disabled { opacity: .35; cursor: default; }
.book-controls__count { position: absolute; left: 50%; color: var(--paper); font: 10px 'DM Mono', monospace; letter-spacing: .12em; transform: translateX(-50%); }
.book-controls__count i { margin: 0 7px; color: var(--red); font-style: normal; }
.site-footer { position: absolute; right: 0; bottom: 76px; left: 0; z-index: 2; }
@media (max-width: 900px) {
  .home-design-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .booking-layout { grid-template-columns: 1fr; }
  .booking-summary { position: static; }
  .artist-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .studio-about__styles { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .studio-about__care { grid-template-columns: 48px minmax(0, 1fr); }
  .studio-about__care ul { grid-column: 2; }
}
@media (max-width: 700px) {
  .home-screen { padding: 95px 22px 120px; }
  .screen-heading, .screen-heading > div { align-items: start; }
  .screen-heading { flex-direction: column; }
  .process-steps, .artist-grid { grid-template-columns: 1fr; }
  .home-design-grid { gap: 10px; }
  .home-design-card__image { height: 54vw; min-height: 170px; }
  .home-design-card__title { font-size: 15px; }
  .tattoo-detail__layout, .contact-layout, .access-panel { grid-template-columns: 1fr; }
  .tattoo-detail__layout > img { height: 100vw; max-height: 530px; }
  .related-designs__grid, .favorite-grid { grid-template-columns: 1fr; }
  .related-designs__grid button, .favorite-grid button { min-height: 280px; }
  .screen-form, .profile-edit, .profile-data { grid-template-columns: 1fr; }
  .screen-field--full { grid-column: auto; }
  .saved-booking { align-items: start; flex-direction: column; }
  .cancel-actions { justify-content: start; }
  .booking-times { grid-template-columns: repeat(2, 1fr); }
  .studio-about { padding: 105px 22px 120px; }
  .studio-about__hero { grid-template-columns: 1fr; gap: 30px; }
  .studio-about__hero h1 { font-size: clamp(48px, 13vw, 76px); }
  .studio-about__hero-image { height: min(100vw, 490px); }
  .studio-about__intro,.studio-about__experience { grid-template-columns: 1fr; gap: 20px; }
  .studio-about__intro { margin-top: 65px; }
  .studio-about__section,.studio-about__care,.studio-about__experience,.studio-about__end { margin-top: 72px; }
  .studio-about__heading { align-items: start; flex-direction: column; gap: 16px; }
  .studio-about__spaces { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .studio-about__space:first-child { grid-column: 1 / -1; }
  .studio-about__space:first-child .studio-about__image { height: min(65vw, 340px); }
  .studio-about__image { height: 190px; }
  .studio-about__styles { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .studio-about__style .studio-about__image { height: min(52vw, 250px); }
  .studio-about__care { padding: 25px 20px; }
  .studio-about__end { align-items: start; flex-direction: column; }
}
@keyframes rise { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } } @keyframes reveal { from { opacity: .2; transform: scale(1.04); } to { opacity: 1; transform: scale(1); } }
@media (max-width: 700px) { .hero { min-height: 720px; padding: 20px 22px 25px; }.site-nav__links { display: none; }.nav-actions { gap: 12px; }.nav-action span:first-child { display: none; }.nav-login { min-height: 34px; padding: 0 9px; font-size: 9px; }.hero__content { padding-top: 50px; }.hero__intro { margin-left: 0; }.hero__actions { align-items: flex-start; flex-direction: column; gap: 18px; }.hero__footer { font-size: 8px; }.scroll-cue { display: none; }.intro-section, .feature-section { grid-template-columns: 1fr; }.intro-section { gap: 60px; padding: 90px 22px; }.feature-image { min-height: 330px; }.feature-content { padding: 75px 22px 90px; }.feature-content .eyebrow { margin-bottom: 50px; }.feature-content .feature-index { margin: -70px 0 25px; }.quote-section { min-height: 470px; padding: 70px 22px; }.quote-mark { left: 22px; top: 72px; }.site-footer { gap: 20px; flex-wrap: wrap; padding: 25px 22px; }.site-footer span:nth-child(2) { order: 3; width: 100%; }.footer-links { gap: 12px; } }
@media (max-width: 700px) {
  .site-nav { position: absolute; gap: 12px; padding: 12px 22px; }
  .site-nav__links.is-open { position: absolute; top: 44px; right: 0; left: 0; z-index: 5; display: flex; flex-direction: column; gap: 0; padding: 8px 16px; border: 1px solid #343738; background: #101314; }
  .site-nav__links.is-open a { padding: 13px 0; border-bottom: 1px solid #292d2e; }
  .site-nav__links.is-open a:last-child { border-bottom: 0; }
  .mobile-nav-toggle { display: inline-flex; align-items: center; gap: 5px; margin-left: auto; padding: 8px 0; border: 0; background: transparent; color: var(--paper); cursor: pointer; font: 9px 'DM Mono', monospace; letter-spacing: .08em; text-transform: uppercase; }
  .page-screen { padding-bottom: 100px; }
  .hero { min-height: 0; padding: 90px 22px 25px; }
  .hero__content { padding-top: 35px; }
  .intro-section.page-screen { align-content: start; gap: 35px; padding: 115px 22px 110px; }
  .feature-section.page-screen { grid-template-columns: 1fr; }
  .feature-section .feature-image { min-height: 38vh; }
  .feature-section .feature-content { min-height: 55vh; padding: 50px 22px; }
  .quote-section.page-screen { padding: 110px 22px 100px; }
  .quote-mark { top: 125px; left: 22px; }
  .book-controls { right: 14px; bottom: 12px; left: 14px; }
  .book-controls button { min-height: 38px; padding: 0 10px; font-size: 8px; }
  .site-footer { bottom: 62px; padding: 15px 22px; }
}
@media (max-width: 430px) {
  .studio-about__spaces { grid-template-columns: 1fr; }
  .studio-about__space:first-child { grid-column: auto; }
  .studio-about__space .studio-about__image,.studio-about__space:first-child .studio-about__image { height: 62vw; }
  .studio-about__artist { grid-template-columns: 55px minmax(0,1fr); gap:12px; }
  .studio-about__artist img { width:55px; height:55px; }
  .studio-about__artist-note { grid-column:2; margin-top:-5px; text-align:left; }
  .studio-about__care { grid-template-columns:1fr; gap:18px; }
  .studio-about__care ul { grid-column:auto; }
}
@keyframes page-turn { from { opacity: .55; transform: perspective(1200px) rotateY(-3deg) translateX(12px); } to { opacity: 1; transform: perspective(1200px) rotateY(0) translateX(0); } }
</style>