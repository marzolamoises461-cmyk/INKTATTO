# INKTATTO — estudio de tatuajes

Aplicación web Nuxt/Vue conectada a una API NestJS y MySQL.

## Estructura

- `frontend/`: sitio Nuxt, galería, artistas, reservas, login y perfil.
- `backend/`: API NestJS, autenticación JWT, TypeORM y migraciones MySQL.
- `docs/`: guías de cumplimiento y pruebas.
- `docker-compose.yml`: MySQL y Adminer para desarrollo local.

## Requisitos

Node.js 20+, npm y Docker Desktop con Docker Compose (recomendado).

## Iniciar MySQL y la API en Windows

Desde la raíz del proyecto:

```powershell
Copy-Item .env.example .env
docker compose up -d mysql
Copy-Item backend/.env.example backend/.env
Set-Location backend
npm ci
npm run start:dev
```

MySQL queda en `127.0.0.1:3306`, Adminer en `http://localhost:8080` y la API en
`http://localhost:3001/api`. En Adminer usa el servidor `mysql`, el usuario y
contraseña configurados en `.env` y la base de datos `inktatto_db`. Las
migraciones pendientes se aplican al iniciar la API. Los valores de ejemplo son
solo para desarrollo local.

## Iniciar el frontend

En otra terminal, desde la raíz:

```powershell
Set-Location frontend
npm ci
$env:NUXT_PUBLIC_API_BASE = "http://localhost:3001/api"
npm run dev
```

Nuxt normalmente estará disponible en `http://localhost:3000`. En producción,
configura `NUXT_PUBLIC_API_BASE` con la URL pública de la API.

## Crear el administrador inicial

Desde `backend/`, define temporalmente `ADMIN_EMAIL`, `ADMIN_FULL_NAME` y
`ADMIN_PASSWORD` en PowerShell y ejecuta `npm run admin:create`. La contraseña
debe tener entre 12 y 72 caracteres e incluir mayúscula, minúscula, número y
símbolo. El comando usa bcrypt y no existe una ruta pública para elevar privilegios.

Las cuentas nuevas deben verificar su correo antes de iniciar sesión. Configura
`FRONTEND_URL` y las variables SMTP descritas en `backend/.env.example`; la API
no simula envíos cuando el proveedor de correo no está configurado.

## Fase 3: contacto, favoritos y pagos

- El formulario de contacto valida y guarda los mensajes en MySQL; los
  administradores pueden revisarlos en `/admin`.
- Los favoritos de visitantes se conservan localmente. Cuando el usuario inicia
  sesión, sus favoritos se consultan y guardan por cuenta en MySQL.
- Swagger está disponible en `http://localhost:3001/api/docs`.
- Los anticipos usan checkout Web de Wompi Colombia. Sin las cuatro credenciales
  `WOMPI_*` del archivo `backend/.env.example`, el checkout queda deshabilitado.
  Los pagos se mantienen pendientes hasta validar el webhook firmado y volver
  a consultar la transacción con la API privada de Wompi; la redirección del
  navegador no confirma pagos.

## Validación

Consulta `docs/CUMPLIMIENTO-GUIA.md` y `docs/PRUEBAS-API.md`. Las pruebas de
integración MySQL solo deben ejecutarse contra una base cuyo nombre termine en
`_test`. Para ejecutar el E2E con MySQL local hace falta una base aislada que
termine en `_test`; no uses la base de desarrollo ni una base compartida.
GitHub Actions valida lint, compilación, pruebas y migraciones del backend,
además de compilar el frontend.
