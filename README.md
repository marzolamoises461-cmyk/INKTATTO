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
# Genera una clave aleatoria y reemplaza JWT_SECRET en backend/.env antes de seguir.
node -p "require('crypto').randomBytes(32).toString('base64')"
```

No uses el valor `REPLACE_WITH_...` del archivo de ejemplo: la API lo rechaza. Mantén la clave generada solo en `backend/.env`, que está excluido de Git. Una vez actualizado el archivo, inicia la API:

```powershell
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

## Trabajo colaborativo

`main` es la rama compartida de integración. Para evitar pisar trabajo de otra persona, usen ramas cortas y pull requests; no hagan `push --force` ni integren cambios sin revisar el diff.

Clona el repositorio una sola vez:

```powershell
git clone https://github.com/marzolamoises461-cmyk/INKTATTO.git
cd INKTATTO
```

Antes de empezar cada tarea, actualiza `main` y crea una rama de trabajo:

```powershell
git switch main
git pull --ff-only origin main
git switch -c feature/descripcion-corta
```

Al terminar, revisa `git status` y `git diff`, ejecuta las pruebas pertinentes y publica la rama:

```powershell
git add ruta/al/archivo
git diff --cached
git commit -m "Describe el cambio"
git fetch origin
git rebase origin/main
git push -u origin feature/descripcion-corta
```

Abre un pull request hacia `main`. Si el rebase produce conflictos, resuélvelos archivo por archivo, revisa el diff completo y repite las pruebas antes de continuar. Nunca uses `git push --force` sobre `main`; después de integrar el PR, vuelve a actualizar tu `main` local.

## Crear administrador inicial

Desde `backend/`, define temporalmente `ADMIN_EMAIL`, `ADMIN_FULL_NAME` y `ADMIN_PASSWORD` en PowerShell y ejecuta `npm run admin:create`. La contraseña debe tener 12–72 caracteres. El comando guarda el hash con bcrypt y asigna el rol admin; no existe una ruta pública para elevar privilegios.

## Validación

Consulta `docs/CUMPLIMIENTO-GUIA.md` y sigue `docs/PRUEBAS-API.md`. GitHub Actions ejecuta pruebas y compilación del backend y frontend.
