# Protocolo de pruebas API

## Preparación

1. Instala Node.js 20+ y MySQL 8+.
2. Crea la base con el script `backend/database/001-create-users.sql`.
3. Copia `backend/.env.example` como `backend/.env` y completa las credenciales.
4. Desde `backend/`, ejecuta `npm install` y `npm run start:dev`.

La API usa el prefijo `/api` y el puerto 3001 por defecto.

## Pruebas automatizadas

Desde `backend/`:

```bash
npm test
npm run test:e2e
npm run build
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

## Ejemplos cURL

### Registro

```bash
curl -i -X POST http://localhost:3001/api/auth/register -H "Content-Type: application/json" -d '{"email":"cliente@ejemplo.com","password":"clave123","fullName":"Cliente de Prueba"}'
```

Esperado: 201, token Bearer y usuario público sin password.

### Login

```bash
curl -i -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"email":"cliente@ejemplo.com","password":"clave123"}'
```

Credenciales incorrectas: 401.

### Perfil y rutas protegidas

```bash
curl -i http://localhost:3001/api/auth/profile -H "Authorization: Bearer TOKEN"
curl -i http://localhost:3001/api/example/protected -H "Authorization: Bearer TOKEN"
curl -i http://localhost:3001/api/example/admin -H "Authorization: Bearer TOKEN"
```

Sin token o token inválido: 401. Usuario normal en ruta admin: 403.

### Primer administrador

Después de registrar la cuenta propietaria, ejecuta desde una sesión MySQL
administrativa y cambia el correo por el de esa cuenta:

```sql
UPDATE users SET role = 'admin' WHERE email = 'propietario@ejemplo.com';
```

Cierra sesión e inicia sesión nuevamente para obtener un JWT con el rol actualizado.
Nunca crees un endpoint público que permita elevar privilegios.

## Códigos esperados

- 400: DTO inválido, propiedades adicionales o id no numérico.
- 401: sin JWT, JWT inválido/expirado o credenciales incorrectas.
- 403: JWT válido sin rol suficiente.
- 404: usuario inexistente.
- 409: correo duplicado.
- 204: eliminación exitosa.

Usa datos ficticios y una base de pruebas. No compartas tokens ni archivos `.env`.
