# Matriz de cumplimiento — guía del instructor

La guía tiene siete apartados y está centrada en NestJS, MySQL, usuarios, JWT,
DTOs, validación, serialización, roles y pruebas.

| Apartado | Implementación |
|---|---|
| 1. Configuración NestJS | `backend/package.json`, `nest-cli.json`, `tsconfig.json`, `tsconfig.build.json`, `src/main.ts` |
| 2. MySQL | Docker Compose, variables `.env`, DataSource TypeORM, migraciones versionadas y `synchronize: false` |
| 3. Módulo User | Entidad, DTOs, servicio, controlador, CRUD protegido y módulo |
| 4. Módulo Auth | Registro, login, JWT, Passport, bcrypt, estrategia, perfil y AuthController |
| 5. DTOs, validación y serialización | DTOs con class-validator; ValidationPipe global estricto; ClassSerializerInterceptor; `@Exclude()` y `select: false` |
| 6. Roles y protección | JwtAuthGuard, RolesGuard, `@Roles()`; CRUD de usuarios y gestión de citas exclusiva para admin |
| 7. Pruebas y ejemplos | Pruebas unitarias/e2e, workflow CI con MySQL, documentación y ejemplos cURL |

## Persistencia de INKTATTO

Además de la guía académica, se conectaron las solicitudes de citas a MySQL:
- Clientes autenticados pueden crear y consultar sus propias solicitudes.
- El cliente solo puede cancelar sus solicitudes que sigan pendientes.
- El administrador puede consultar todas las solicitudes y cambiar su estado a pendiente, confirmada o cancelada.
- Las tablas `users` y `bookings` se crean mediante migraciones TypeORM.

## Reglas de seguridad

- El registro público siempre crea usuarios activos con rol `user`; no acepta rol ni estado.
- Las contraseñas se guardan con bcrypt y no se exponen en respuestas.
- El JWT no contiene contraseña ni otros secretos.
- La estrategia consulta de nuevo el usuario en MySQL; una cuenta desactivada deja de poder usar el token.
- El CRUD de usuarios y las operaciones administrativas de citas exigen JWT válido y rol `admin`.
- En todos los entornos `synchronize` está desactivado; el esquema se cambia con migraciones.
- La aplicación valida al arrancar las variables obligatorias de MySQL y exige un `JWT_SECRET` aleatorio de al menos 32 caracteres.
- CORS solo admite los orígenes HTTP/HTTPS declarados en `CORS_ORIGIN`; no se permite el comodín `*`.
- El DataSource de migraciones falla explícitamente si faltan las credenciales de conexión; no intenta conectarse con una contraseña vacía o una base predeterminada.
- El primer administrador se crea mediante el comando local `npm run admin:create`, nunca mediante un endpoint público.

## Verificación pendiente

Los cambios están en la rama `feature/guia-instructor-completa`. GitHub Actions debe ejecutar lint, compilación, pruebas y migraciones MySQL; el equipo local debe validar el recorrido con su instalación de MySQL y revisar el recorrido visual en el navegador. No se declara todavía una prueba local de extremo a extremo aprobada hasta ver esos resultados.
