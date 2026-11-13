# Protocolo de pruebas API

Iniciar MySQL, crear `inktatto_db`, copiar `backend/.env.example` a `backend/.env`, completar credenciales y ejecutar `npm install` + `npm run start:dev` desde `backend/`.

## Automatizadas

```bash
cd backend
npm test
npm run test:e2e
npm run build
```

## Manuales con cURL

### 1. Registro

```bash
curl -i -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@ejemplo.com","password":"clave123","fullName":"Cliente de Prueba"}'
```

Debe responder `201` con `accessToken` y datos públicos del usuario; nunca debe incluir `password`.

### 2. Login

```bash
curl -i -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@ejemplo.com","password":"clave123"}'
```

Debe responder `201`. Credenciales incorrectas: `401`.

### 3. Perfil protegido

```bash
curl -i http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer PEGA_AQUI_EL_ACCESS_TOKEN"
```

Sin token o con token inválido/expirado: `401`.

### 4. Crear el primer administrador

Después de registrar la cuenta propietaria, promoverla directamente en MySQL desde una sesión administrativa:

```sql
UPDATE users SET role = 'admin' WHERE email = 'propietario@ejemplo.com';
```

Volver a iniciar sesión para obtener un JWT actualizado con `role: admin`.

### 5. CRUD de usuarios (solo admin)

```bash
# Crear
curl -i -X POST http://localhost:3001/api/users -H "Authorization: Bearer ADMIN_TOKEN" -H "Content-Type: application/json" -d '{"email":"otro@ejemplo.com","password":"clave123","fullName":"Otro Usuario"}'
# Listar
curl -i http://localhost:3001/api/users -H "Authorization: Bearer ADMIN_TOKEN"
# Consultar por id
curl -i http://localhost:3001/api/users/1 -H "Authorization: Bearer ADMIN_TOKEN"
# Actualizar
curl -i -X PATCH http://localhost:3001/api/users/1 -H "Authorization: Bearer ADMIN_TOKEN" -H "Content-Type: application/json" -d '{"fullName":"Nombre Actualizado"}'
# Eliminar
curl -i -X DELETE http://localhost:3001/api/users/2 -H "Authorization: Bearer ADMIN_TOKEN"
```

Token válido de usuario normal contra `/api/users`: `403`. Sin token: `401`. Email duplicado: `409`. DTO inválido, campo extra o id no numérico: `400`. Usuario inexistente: `404`. Borrado exitoso: `204`.

> Usar una base de pruebas y datos ficticios. No compartir tokens, contraseñas ni el archivo `.env`.
