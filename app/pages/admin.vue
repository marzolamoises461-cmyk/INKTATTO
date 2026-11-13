<template>
  <StudioLayout active="admin">
    <main class="studio-main admin-page">
      <p class="studio-eyebrow">Acceso privado · Administración</p>
      <h1 class="studio-title">Centro de<br /><em>control.</em></h1>
      <p class="studio-lede">Gestiona las solicitudes del estudio y las cuentas registradas. Los cambios se guardan directamente en MySQL.</p>
      <p v-if="message" class="studio-notice" role="status">{{ message }}</p>
      <div v-if="loading" class="studio-empty">Verificando permisos y cargando información…</div>
      <template v-else-if="authorized">
        <section class="admin-stats">
          <article class="studio-card"><span>Solicitudes</span><strong>{{ bookings.length }}</strong></article>
          <article class="studio-card"><span>Pendientes</span><strong>{{ pendingCount }}</strong></article>
          <article class="studio-card"><span>Confirmadas</span><strong>{{ confirmedCount }}</strong></article>
          <article class="studio-card"><span>Clientes / cuentas</span><strong>{{ users.length }}</strong></article>
        </section>
        <section class="admin-section">
          <div class="admin-heading"><div><p class="studio-eyebrow">Agenda del estudio</p><h2>Solicitudes de <em>cita.</em></h2></div><button class="studio-button studio-button--outline studio-button--small" @click="refresh">Actualizar ↻</button></div>
          <div v-if="!bookings.length" class="studio-empty">Todavía no hay solicitudes registradas.</div>
          <div v-else class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Cliente</th><th>Fecha</th><th>Artista</th><th>Idea / zona</th><th>Estado</th><th>Acción</th></tr></thead><tbody>
            <tr v-for="item in bookings" :key="item.id"><td>{{ item.user?.fullName || 'Cliente' }}<small>{{ item.user?.email }}</small></td><td>{{ formatDate(item.date) }}<small>{{ item.time?.slice(0,5) }}</small></td><td>{{ item.artist }}</td><td>{{ item.bodyArea }} · {{ item.size }}<small>{{ item.idea }}</small></td><td><span class="admin-status" :class="'is-'+item.status">{{ statusLabel(item.status) }}</span></td><td><select :value="item.status" :disabled="savingId===item.id" @change="changeStatus(item.id, ($event.target as HTMLSelectElement).value)"><option value="pending">Pendiente</option><option value="confirmed">Confirmada</option><option value="cancelled">Cancelada</option></select></td></tr>
          </tbody></table></div>
        </section>
        <section class="admin-section">
          <div class="admin-heading"><div><p class="studio-eyebrow">Acceso y clientes</p><h2>Cuentas <em>registradas.</em></h2></div></div>
          <div v-if="!users.length" class="studio-empty">No hay cuentas para mostrar.</div>
          <div v-else class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Acción</th></tr></thead><tbody>
            <tr v-for="account in users" :key="account.id"><td>{{ account.fullName }}</td><td>{{ account.email }}</td><td><select :value="account.role" :disabled="account.id===user?.id" @change="changeRole(account.id, ($event.target as HTMLSelectElement).value)"><option value="user">Cliente</option><option value="admin">Administrador</option></select></td><td>{{ account.isActive ? 'Activa' : 'Desactivada' }}</td><td><button class="admin-action" :disabled="account.id===user?.id" @click="toggleAccount(account)">{{ account.isActive ? 'Desactivar' : 'Activar' }}</button></td></tr>
          </tbody></table></div>
          <p class="admin-footnote">Por seguridad, no puedes cambiar tu propio rol ni desactivar tu propia cuenta desde esta pantalla.</p>
        </section>
      </template>
    </main>
  </StudioLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import StudioLayout from '../components/StudioLayout.vue'
interface Booking { id:number; date:string; time:string; artist:string; bodyArea:string; size:string; idea:string; status:'pending'|'confirmed'|'cancelled'; user?:{id:number;fullName:string;email:string} }
interface Account { id:number; fullName:string; email:string; role:'user'|'admin'; isActive:boolean }
const { user, api, initialize } = useAuth()
const bookings=ref<Booking[]>([]), users=ref<Account[]>([])
const loading=ref(true), authorized=ref(false), message=ref(''), savingId=ref(0)
const pendingCount=computed(()=>bookings.value.filter(x=>x.status==='pending').length)
const confirmedCount=computed(()=>bookings.value.filter(x=>x.status==='confirmed').length)
onMounted(async()=>{ await initialize(); if(!user.value){ await navigateTo('/login'); return } if(user.value.role!=='admin'){ message.value='No tienes permisos para acceder al panel administrativo.'; loading.value=false; return } authorized.value=true; await refresh(); loading.value=false })
async function refresh(){ try { const [b,u]=await Promise.all([api<Booking[]>('/bookings'),api<Account[]>('/users')]); bookings.value=b; users.value=u } catch(e){ message.value=errorMessage(e,'No se pudo cargar el panel. Comprueba la API y los permisos.') } }
async function changeStatus(id:number,status:string){ savingId.value=id; try { const updated=await api<Booking>(`/bookings/${id}/status`,{method:'PATCH',body:{status}}); bookings.value=bookings.value.map(x=>x.id===id?updated:x); message.value='Estado de la cita actualizado y guardado.' } catch(e){ message.value=errorMessage(e,'No se pudo actualizar la cita.') } finally { savingId.value=0 } }
async function changeRole(id:number,role:string){ try { const updated=await api<Account>(`/users/${id}`,{method:'PATCH',body:{role}}); users.value=users.value.map(x=>x.id===id?updated:x); message.value='Rol actualizado.' } catch(e){ message.value=errorMessage(e,'No se pudo actualizar el rol.') } }
async function toggleAccount(account:Account){ try { const updated=await api<Account>(`/users/${account.id}`,{method:'PATCH',body:{isActive:!account.isActive}}); users.value=users.value.map(x=>x.id===account.id?updated:x); message.value=updated.isActive?'Cuenta activada.':'Cuenta desactivada.' } catch(e){ message.value=errorMessage(e,'No se pudo cambiar el estado de la cuenta.') } }
function errorMessage(error:unknown,fallback:string){ const data=(error as {data?:{message?:string|string[]}})?.data; return Array.isArray(data?.message)?data.message.join('. '):data?.message??fallback }
function formatDate(value:string){ return new Intl.DateTimeFormat('es-CO',{dateStyle:'medium'}).format(new Date(value+'T12:00:00')) }
function statusLabel(value:string){ return value==='confirmed'?'Confirmada':value==='cancelled'?'Cancelada':'Pendiente' }
</script>

<style scoped>
.admin-page{padding-top:75px}.admin-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:38px 0 70px}.admin-stats article{padding:22px}.admin-stats span{display:block;color:var(--studio-muted);font:10px 'DM Mono',monospace;text-transform:uppercase;letter-spacing:.08em}.admin-stats strong{display:block;margin-top:12px;font:40px 'Playfair Display',serif}.admin-section{margin:65px 0}.admin-heading{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:22px}.admin-heading h2{margin:0;font:500 clamp(30px,4vw,48px) 'Playfair Display',serif}.admin-heading h2 em{color:var(--studio-red)}.admin-table-wrap{overflow-x:auto;border:1px solid var(--studio-line)}.admin-table{width:100%;border-collapse:collapse;text-align:left;font-size:12px;min-width:780px}.admin-table th{padding:15px;background:#151a1c;color:var(--studio-red);font:10px 'DM Mono',monospace;text-transform:uppercase;letter-spacing:.08em}.admin-table td{padding:15px;border-top:1px solid var(--studio-line);vertical-align:top;max-width:260px}.admin-table small{display:block;margin-top:5px;color:var(--studio-muted);font-size:10px;line-height:1.6;overflow-wrap:anywhere}.admin-table select{max-width:150px;padding:8px;background:#0b0e0f;color:var(--studio-paper);border:1px solid var(--studio-line)}.admin-status{font:10px 'DM Mono',monospace}.admin-status.is-pending{color:#e5bd72}.admin-status.is-confirmed{color:#82c69b}.admin-status.is-cancelled{color:#e18b8b}.admin-action{padding:7px 10px;border:1px solid var(--studio-line);background:transparent;color:var(--studio-paper);cursor:pointer;font-size:11px}.admin-action:disabled{opacity:.35;cursor:not-allowed}.admin-footnote{color:var(--studio-muted);font-size:11px;line-height:1.7;margin-top:15px}@media(max-width:760px){.admin-stats{grid-template-columns:repeat(2,1fr)}.admin-heading{align-items:start;flex-direction:column}.admin-section{margin:48px 0}}
</style>
