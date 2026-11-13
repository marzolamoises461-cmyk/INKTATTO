# INKTATTO — API NestJS + MySQL

## Requisitos
- Node.js 20+ y npm.
- Docker Desktop con Docker Compose (recomendado) o MySQL 8 instalado.

## Arranque local con Docker
1. Desde la raíz, copia `.env.example` a `.env`.
2. Ejecuta `docker compose up -d mysql`.
3. Copia `backend/.env.example` a `backend/.env`.
4. Desde `backend/`, ejecuta `npm install` y `npm run start:dev`.
5. TypeORM aplica automáticamente las migraciones pendientes al iniciar.

MySQL queda en `127.0.0.1:3306`; base `inktatto_db`; usuario `inktatto_app`. Los datos persisten en el volumen Docker `inktatto_mysql_data`. Las contraseñas de ejemplo son solo para desarrollo local.

## Migraciones
- `npm run migration:show`: lista las migraciones.
- `npm run migration:run`: aplica las pendientes.
- `npm run migration:revert`: revierte la última migración; puede borrar datos según el cambio.
La API mantiene `synchronize: false` en todos los entornos. El esquema se modifica mediante migraciones versionadas.

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
npm run build
npm test -- --runInBand
npm run test:e2e -- --runInBand
```
