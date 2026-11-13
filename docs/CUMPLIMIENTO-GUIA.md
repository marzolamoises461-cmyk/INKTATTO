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

## Estado de verificación

Rama de trabajo: `feature/guia-instructor-completa` (PR #1 permanece abierto como borrador).

### Comprobaciones locales observadas

En el entorno local del desarrollador se reportaron correctamente:

- `npm ci`.
- `npm run lint`.
- `npm run build`.
- `npm test -- --runInBand`: 6 suites y 19 pruebas aprobadas.
- `npm run test:e2e -- --runInBand`: 1 suite y 3 pruebas de contrato HTTP aprobadas. Estas pruebas usan un servicio simulado; no deben describirse como integración real con MySQL.
- `npm run migration:show`: migraciones de usuarios y reservas aplicadas en la base local `inktatto_db`.

### Validación automatizada de integración

Se añadió `backend/test/database.e2e-spec.ts`, que levanta el módulo NestJS real y verifica contra MySQL autenticación, JWT, serialización, roles, reservas y permisos de propietario. Está protegida por dos condiciones: `RUN_DB_E2E=true` y nombre de base terminado en `_test`. La CI usa el servicio MySQL temporal `inktatto_test`; la suite no se activa por defecto en el equipo local.

GitHub Actions ejecutó correctamente ambos trabajos (backend y frontend) en el commit validado `5be380cba8e63b1f8b141b1746c17a8d0a63007d`: lint, compilación NestJS, pruebas unitarias, migraciones MySQL y compilación Nuxt finalizaron en verde. En CI se aprobaron 19 pruebas unitarias y 8 pruebas E2E (5 de integración contra MySQL real y 3 de contrato HTTP). La base temporal `inktatto_test` recibió las dos migraciones antes de ejecutar las pruebas.

El código de las páginas de acceso, perfil y reserva utiliza `useAuth()` y el `apiBase` configurable mediante `NUXT_PUBLIC_API_BASE`; el flujo de reservas crea y consulta datos mediante la API.

### Pendiente de confirmación final

- Probar manualmente en navegador registro, login, perfil y envío/cancelación de una reserva con la API en ejecución.
- Confirmar que `NUXT_PUBLIC_API_BASE` apunte a la URL correcta cuando se despliegue el frontend.

La validación automatizada de backend, MySQL y compilación frontend ya está aprobada en GitHub Actions. Solo falta la comprobación manual del recorrido en navegador y confirmar la URL de API del despliegue frontend.
