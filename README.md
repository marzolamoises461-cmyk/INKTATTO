# INKTATTO — estudio de tatuajes

Aplicación web Nuxt/Vue conectada a una API NestJS con MySQL. El repositorio está separado en dos carpetas principales para que puedas identificar y trabajar cada parte fácilmente.

## Estructura

- `frontend/`: página web del estudio, galería, artistas, reservas, acceso y perfil.
- `backend/`: API NestJS, TypeORM, MySQL, autenticación JWT, roles y solicitudes de citas persistentes.
- `docs/`: cumplimiento de la guía y protocolo de pruebas.
- `docker-compose.yml`: MySQL y Adminer para desarrollo local.

## Iniciar el backend y MySQL en Windows

Desde la raíz del proyecto:

```powershell
Copy-Item .env.example .env
docker compose up -d mysql
Copy-Item backend/.env.example backend/.env
cd backend
npm ci
npm run start:dev
```

La API queda en `http://localhost:3001/api`. Las migraciones se ejecutan automáticamente al iniciar la API.

## Iniciar el frontend

En otra terminal, desde la raíz:

```powershell
cd frontend
npm ci
$env:NUXT_PUBLIC_API_BASE = "http://localhost:3001/api"
npm run dev
```

Nuxt abrirá la web en la dirección local que muestre la terminal (normalmente `http://localhost:3000`). Para producción, configura `NUXT_PUBLIC_API_BASE` con la URL pública de la API.

## Crear administrador inicial

Desde `backend/`, define temporalmente `ADMIN_EMAIL`, `ADMIN_FULL_NAME` y `ADMIN_PASSWORD` en PowerShell y ejecuta `npm run admin:create`. La contraseña debe tener 12–72 caracteres. El comando guarda el hash con bcrypt y asigna el rol admin; no existe una ruta pública para elevar privilegios.

## Validación

Consulta `docs/CUMPLIMIENTO-GUIA.md` y sigue `docs/PRUEBAS-API.md`. GitHub Actions ejecuta pruebas y compilación del backend y frontend.
