# Protocolo de pruebas API

## Preparación local

Desde la raíz del repositorio, copia `.env.example` a `.env` y ejecuta:

```powershell
docker compose up -d mysql
Copy-Item backend/.env.example backend/.env
```

Comprueba que los valores DB de `backend/.env` coincidan con los de la raíz. Después:

```powershell
cd backend
npm ci
npm run start:dev
```

La API usa `http://localhost:3001/api`. Al arrancar, TypeORM aplica las migraciones pendientes.

## Crear administrador

En otra terminal PowerShell, desde `backend/`, define temporalmente estas variables y ejecuta el comando. Usa una contraseña única de al menos 12 caracteres:

```powershell
$env:ADMIN_EMAIL = "tu-correo@ejemplo.com"
$env:ADMIN_FULL_NAME = "Administrador INKTATTO"
$env:ADMIN_PASSWORD = "una-clave-larga-y-unica"
npm run admin:create
Remove-Item Env:ADMIN_EMAIL, Env:ADMIN_FULL_NAME, Env:ADMIN_PASSWORD
```

## Pruebas automáticas

Desde `backend/`:

```powershell
npm run build
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run migration:show
```

## Rutas

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/api/auth/register` | Público; siempre crea rol user |
| POST | `/api/auth/login` | Público |
| GET | `/api/auth/profile` | JWT |
| GET | `/api/example/protected` | JWT |
| GET | `/api/example/admin` | JWT + admin |
| POST/GET | `/api/users` | JWT + admin |
| GET/PATCH/DELETE | `/api/users/:id` | JWT + admin |
| POST | `/api/bookings` | JWT; crea solicitud del usuario autenticado |
| GET | `/api/bookings/mine` | JWT; solo solicitudes propias |
| PATCH | `/api/bookings/:id/cancel` | JWT; propietario y solo pendiente |
| GET | `/api/bookings?page=1&pageSize=20&search=ana&status=pending&sortBy=createdAt&sortOrder=DESC` | JWT + admin; paginado |
| PATCH | `/api/bookings/:id/status` | JWT + admin |
| POST | `/api/contact` | Público con límite de solicitudes; valida y persiste el mensaje |
| GET | `/api/contact?page=1&pageSize=20&search=ana` | JWT + admin; mensajes paginados |
| GET | `/api/favorites` | JWT; lista los favoritos del usuario autenticado |
| PUT | `/api/favorites` | JWT; agrega idempotentemente `{ "designSlug": "dragon" }` |
| DELETE | `/api/favorites/:designSlug` | JWT; quita el favorito propio |
| POST | `/api/payments/bookings/:bookingId/checkout` | JWT propietario; crea checkout Wompi con pago pendiente |
| GET | `/api/payments/bookings/:bookingId` | JWT propietario o admin; estado confirmado localmente |
| POST | `/api/payments/wompi/webhook` | Webhook firmado; API vuelve a consultar la transacción a Wompi |

Swagger/OpenAPI: `http://localhost:3001/api/docs`.

## Ejemplos cURL

Registro:
```bash
curl -i -X POST http://localhost:3001/api/auth/register -H "Content-Type: application/json" -d '{"email":"cliente@ejemplo.com","password":"clave123","fullName":"Cliente de Prueba"}'
```

Login:
```bash
curl -i -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"email":"cliente@ejemplo.com","password":"clave123"}'
```

Perfil protegido:
```bash
curl -i http://localhost:3001/api/auth/profile -H "Authorization: Bearer TOKEN"
```

Crear cita:
```bash
curl -i -X POST http://localhost:3001/api/bookings -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"artist":"artist-slug","date":"2027-01-15","time":"10:00","bodyArea":"Brazo","size":"Mediano","idea":"Diseño de referencia para una consulta de tatuaje"}'
```

## Códigos esperados

- 400: DTO inválido, propiedades adicionales o id no numérico.
- 401: sin JWT, JWT inválido/expirado o credenciales incorrectas.
- 403: JWT válido sin rol suficiente, o usuario que intenta cancelar una solicitud ajena.
- 404: usuario o solicitud inexistente.
- 409: correo duplicado.
- 204: eliminación exitosa de usuario.

## Pruebas de integración reales con MySQL

La suite `backend/test/database.e2e-spec.ts` levanta el `AppModule` real y prueba
registro, login, perfil JWT, permisos, reservas persistidas, cancelación por
propietario, gestión administrativa y serialización de contraseñas.

- En el equipo local, `npm run test:e2e -- --runInBand` ejecuta el contrato HTTP
  simulado y deja omitida la suite MySQL por defecto.
- La suite MySQL solo se activa cuando `RUN_DB_E2E=true` y comprueba antes de
  conectarse que `DB_DATABASE` termine en `_test`. Si no cumple esa condición,
  aborta antes de abrir la aplicación.
- GitHub Actions crea una instancia MySQL temporal con la base `inktatto_test`,
  aplica las migraciones y ejecuta la suite real. No uses `inktatto_db` ni otra
  base de datos de trabajo para esta prueba.

  La suite de integración incluye contacto, favoritos por usuario y la creación
  de un checkout de prueba que permanece `pending`. No realiza cargos reales ni
  simula confirmaciones exitosas. Las pruebas unitarias del servicio verifican la
  firma del webhook y que se consulte a Wompi antes de registrar un estado final.
  El uso real de pagos necesita las credenciales Wompi y el webhook de sandbox.

Para ejecutar la suite manualmente, configura primero una base de datos aislada
cuyo nombre termine en `_test`, con credenciales de prueba, y solo entonces
establece `RUN_DB_E2E=true` en esa terminal.
