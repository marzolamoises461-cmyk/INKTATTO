<template>
  <StudioLayout active="login">
    <main class="studio-main login-page">
      <section class="login-panel studio-card">
        <div class="login-panel__intro">
          <p class="studio-eyebrow">Área de clientes</p>
          <h1 class="studio-title">Tu espacio<br /><em>personal.</em></h1>
          <p class="studio-lede">Accede al espacio de cliente de Kage Tattoo.</p>
          <p class="login-panel__note">El inicio de sesión aún no está conectado a un sistema de cuentas. No envíes una contraseña real: este formulario solo muestra la interfaz.</p>
        </div>

        <form class="login-form" @submit.prevent="submitLogin">
          <label class="studio-field">
            Correo electrónico
            <input v-model.trim="email" type="email" autocomplete="email" required maxlength="254" />
          </label>
          <label class="studio-field">
            Contraseña
            <input v-model="password" type="password" autocomplete="current-password" required maxlength="128" />
          </label>
          <p v-if="message" class="studio-notice" role="status">{{ message }}</p>
          <button class="studio-button login-form__submit" type="submit">Continuar <span>↗</span></button>
          <NuxtLink class="login-form__profile" to="/profile">Ver el perfil local del navegador ↗</NuxtLink>
        </form>
      </section>

      <p class="login-footer">¿Aún no tienes una solicitud? <NuxtLink to="/booking">Reserva una consulta <span>↗</span></NuxtLink></p>
    </main>
  </StudioLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import StudioLayout from '../components/StudioLayout.vue'

const email = ref('')
const password = ref('')
const message = ref('')

function submitLogin() {
  message.value = 'El acceso no está conectado a un servicio de cuentas. Tus datos no se enviaron ni se guardaron.'
  password.value = ''
}
</script>

<style scoped>
.login-page {
  display: grid;
  min-height: min(760px, calc(100vh - 170px));
  align-content: center;
}

.login-panel {
  display: grid;
  width: min(100%, 940px);
  grid-template-columns: 1fr .8fr;
  gap: clamp(35px, 8vw, 100px);
  margin: 0 auto;
  padding: clamp(27px, 6vw, 65px);
}

.login-panel__intro .studio-title {
  font-size: clamp(47px, 6vw, 75px);
}

.login-panel__note {
  margin-top: 23px;
  padding-left: 14px;
  border-left: 1px solid var(--studio-red);
  color: var(--studio-muted);
  font-size: 11px;
  line-height: 1.8;
}

.login-form {
  display: flex;
  align-self: center;
  flex-direction: column;
  gap: 19px;
}

.login-form__submit {
  justify-content: space-between;
}

.login-form__profile,
.login-footer {
  color: var(--studio-muted);
  font: 10px/1.8 'DM Mono', monospace;
  letter-spacing: .04em;
}

.login-form__profile:hover,
.login-footer a:hover {
  color: var(--studio-paper);
}

.login-footer {
  width: min(100%, 940px);
  margin: 19px auto 0;
}

.login-footer a,
.login-footer a span {
  color: var(--studio-paper);
}

.login-footer a span {
  color: var(--studio-red);
}

@media (max-width: 700px) {
  .login-page {
    min-height: auto;
    align-content: start;
  }

  .login-panel {
    grid-template-columns: 1fr;
    gap: 30px;
    padding: 25px 20px;
  }
}
</style>
