# INKTATTO — plataforma de estudio de tatuajes

El proyecto conserva el frontend original en Nuxt/Vue y agrega una API en NestJS con MySQL, TypeORM y autenticación JWT.

## Estructura

- `app/`: frontend Nuxt existente (galería, artistas, reservas, contacto, perfil).
- `backend/`: API NestJS, módulos User/Auth, persistencia MySQL, JWT, validaciones, roles y pruebas.

## Requisitos

- Node.js 20 o superior y npm.
- MySQL 8+.

## Base de datos y backend

1. Crear la base: `CREATE DATABASE inktatto_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
2. Entrar a `backend/` y copiar `.env.example` como `.env`.
3. Completar las variables MySQL y generar un `JWT_SECRET` aleatorio fuerte. No compartir ni subir `.env`.
4. Instalar y ejecutar:

```bash
cd backend
npm install
npm run start:dev
```

La API escucha en `http://localhost:3001/api`. En desarrollo TypeORM crea/actualiza tablas con `synchronize`; en producción está desactivado y se deben usar migraciones antes de desplegar.

## Frontend

Desde la raíz:

```bash
npm install
npm run dev
```

Configura `NUXT_PUBLIC_API_BASE=http://localhost:3001/api` cuando se conecte el frontend a la API.

## Endpoints

- `POST /api/auth/register` — registro público; siempre asigna rol `user`.
- `POST /api/auth/login` — login y entrega JWT Bearer.
- `GET /api/auth/profile` — perfil autenticado.
- `POST /api/users`, `GET /api/users`, `GET /api/users/:id`, `PATCH /api/users/:id`, `DELETE /api/users/:id` — CRUD exclusivo para administradores.

Enviar `Authorization: Bearer <accessToken>` a las rutas protegidas. Las contraseñas se almacenan con bcrypt y nunca se serializan en las respuestas.

## Pruebas

```bash
cd backend
npm test
npm run test:e2e
npm run build
```

Las pruebas actuales validan reglas del servicio de usuarios y el contrato HTTP/validación de Auth. La conexión real a MySQL requiere una instancia disponible y credenciales válidas.

## Crear el primer administrador

Registra primero un usuario mediante `/api/auth/register`. Luego, con acceso directo y controlado a la base de datos, cambia su rol:

```sql
UPDATE users SET role = 'admin' WHERE email = 'correo-del-propietario@ejemplo.com';
```

Hazlo solo con la cuenta propietaria; no existe un endpoint público para elevar privilegios. Cambia el correo por el real y no compartas credenciales.

## Alcance de esta entrega

La API implementa los siete apartados de la guía didáctica JWT/NestJS/MySQL. La integración funcional de reservas, artistas y catálogo del frontend con endpoints persistentes es una fase distinta: no se debe confundir que las pantallas existentes estén presentes con que esos datos ya se guarden en MySQL.
