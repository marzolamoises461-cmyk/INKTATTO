# INKTATTO — API NestJS + MySQL

## Requisitos
- Node.js 20+ y npm.
- Docker Desktop con Docker Compose (recomendado) o MySQL 8 instalado.

## Arranque local con Docker
1. Desde la raíz, copia `.env.example` a `.env`.
2. Ejecuta `docker compose up -d mysql`.
3. Copia `backend/.env.example` a `backend/.env`.
4. Desde `backend/`, ejecuta `npm ci` y `npm run start:dev`.
5. TypeORM aplica automáticamente las migraciones pendientes al iniciar.

MySQL queda en `127.0.0.1:3306`; base `inktatto_db`; usuario `inktatto_app`. Los datos persisten en el volumen Docker `inktatto_mysql_data`. Las contraseñas de ejemplo son solo para desarrollo local.

## Variables obligatorias
La API requiere `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` y `JWT_SECRET`. El secreto JWT debe ser aleatorio y tener al menos 32 caracteres. `PORT`, `DB_PORT` y `JWT_EXPIRATION` tienen valores predeterminados seguros. `CORS_ORIGIN` admite una lista separada por comas de orígenes HTTP/HTTPS; no uses `*` en producción.

## Migraciones
- `npm run migration:show`: lista las migraciones.
- `npm run migration:run`: aplica las pendientes.
- `npm run migration:revert`: revierte la última migración; puede borrar datos según el cambio.
La API mantiene `synchronize: false` en todos los entornos. El esquema se modifica mediante migraciones versionadas.

## Agenda y referencias de tatuaje
- Los perfiles de artista se crean con la migración `CreateArtistSchedules`; no se asigna disponibilidad por defecto. El administrador debe configurar cada semana con `PUT /api/artists/:id/schedule`, con ventanas de 24 horas (`weekday`: domingo `0` a sábado `6`).
- Días libres y bloqueos parciales se administran con `POST /api/artists/:id/blocks` y `DELETE /api/artists/:id/blocks/:blockId`. La consulta pública es `GET /api/artists/:slug/availability?date=YYYY-MM-DD&durationMinutes=60`.
- Para adjuntar referencias configura un bucket S3-compatible privado y define `OBJECT_STORAGE_ENDPOINT`, `OBJECT_STORAGE_BUCKET`, `OBJECT_STORAGE_REGION`, `OBJECT_STORAGE_ACCESS_KEY` y `OBJECT_STORAGE_SECRET_KEY`. La API falla explícitamente si falta configuración; nunca convierte la carga en un éxito simulado.
- Los objetos deben permanecer privados, sin acceso público ni ACL pública. La API los entrega solamente tras verificar que la cuenta autenticada sea propietaria de la cita o administradora. Se aceptan JPG, PNG y WEBP, máximo 5 MB por imagen y 5 imágenes por cita.
- El endpoint de creación recibe `multipart/form-data`: los campos de cita más uno o varios campos `images`. La ruta de añadir referencias es `POST /api/bookings/:id/images`.

## Crear la cuenta administradora inicial
Define temporalmente `ADMIN_EMAIL`, `ADMIN_PASSWORD` (12–72 caracteres) y `ADMIN_FULL_NAME` en PowerShell, ejecuta `npm run admin:create` y luego elimina las variables. El comando crea o actualiza esa cuenta con bcrypt y rol admin; no hay endpoint público para elevar privilegios.

```powershell
$env:ADMIN_EMAIL = "tu-correo@ejemplo.com"
$env:ADMIN_FULL_NAME = "Administrador INKTATTO"
$env:ADMIN_PASSWORD = "usa-una-clave-larga-y-unica"
npm run admin:create
Remove-Item Env:ADMIN_EMAIL, Env:ADMIN_FULL_NAME, Env:ADMIN_PASSWORD
```

## Pruebas
```powershell
npm ci
npm run lint
npm run build
npm test -- --runInBand
npm run test:e2e -- --runInBand
```
