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
npm install
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
| GET | `/api/bookings` | JWT + admin |
| PATCH | `/api/bookings/:id/status` | JWT + admin |

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
