# Base de datos MySQL

El esquema actual se administra mediante las migraciones TypeORM en
`backend/src/database/migrations/`. La API las ejecuta al iniciar. También se
pueden consultar y ejecutar manualmente desde `backend/` con `npm run
migration:show` y `npm run migration:run`.

`synchronize` está desactivado en todos los entornos. No ejecutes
`001-create-users.sql` como sustituto de las migraciones actuales: es una
alternativa manual antigua que solo crea `users` y no crea `bookings` ni
registra el historial de migraciones. Se conserva por compatibilidad y no debe
mezclarse con el flujo TypeORM.

No guardes contraseñas reales en este repositorio. Configura `backend/.env` a
partir de `backend/.env.example` y sustituye el placeholder de `JWT_SECRET` por
una clave aleatoria de al menos 32 caracteres.
