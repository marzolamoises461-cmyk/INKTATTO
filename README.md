# INKTATTO — estudio de tatuajes

Aplicación web Nuxt/Vue conectada a una API NestJS con MySQL.

## Estructura
- `app/`: inicio, galería, artistas, reservas, login y perfil.
- `backend/`: API NestJS, TypeORM, MySQL, autenticación JWT, roles y solicitudes de citas persistentes.
- `docs/`: cumplimiento de la guía y protocolo de pruebas.

## Requisitos
Node.js 20+, npm y Docker Desktop con Docker Compose (recomendado).

## Iniciar MySQL y la API en Windows

Desde la raíz del proyecto:

```powershell
Copy-Item .env.example .env
docker compose up -d mysql
Copy-Item backend/.env.example backend/.env
cd backend
npm install
npm run start:dev
```

MySQL queda en `127.0.0.1:3306`, Adminer en `http://localhost:8080` y la API en `http://localhost:3001/api`. Para entrar a Adminer usa servidor `mysql`, usuario `inktatto_app`, la contraseña de `.env` y base `inktatto_db`. Las migraciones se ejecutan automáticamente al iniciar la API. Los valores del archivo de ejemplo son solo para desarrollo local.

## Crear administrador inicial

Desde `backend/`, define temporalmente `ADMIN_EMAIL`, `ADMIN_FULL_NAME` y `ADMIN_PASSWORD` en PowerShell y ejecuta `npm run admin:create`. La contraseña debe tener 12–72 caracteres. El comando guarda el hash con bcrypt y asigna el rol admin; no existe una ruta pública para elevar privilegios.

## Iniciar frontend

En otra terminal, desde la raíz:

```powershell
npm install
npm run dev
```

El frontend usa `NUXT_PUBLIC_API_BASE`; por defecto apunta a `http://localhost:3001/api`. El registro y login usan JWT; las solicitudes de citas y el perfil se sincronizan con MySQL. Los diseños favoritos permanecen guardados localmente en el navegador.

## Validación

Consulta `docs/CUMPLIMIENTO-GUIA.md` y sigue `docs/PRUEBAS-API.md`. GitHub Actions ejecuta build, pruebas y migraciones MySQL para los cambios de backend.
