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

La copia auditada está en `main`, alineada con su referencia local `origin/main` al iniciar esta revisión. La consulta de ramas remotas requirió autenticación de GitHub y no se completó; este documento no afirma el estado actual de PRs ni de otros colaboradores.

El repositorio contiene esta matriz, pero no la guía original del instructor. La correspondencia solo puede certificarse respecto de los siete apartados descritos arriba.

### Verificación local de esta revisión

- Backend: `npm ci`, `npm run lint` y `npm run build` completaron correctamente.
- Unitarias: `npm test -- --runInBand` pasó 7 suites y 22 pruebas; la suite de integración MySQL omitió 5 pruebas.
- E2E HTTP: `npm run test:e2e -- --runInBand` pasó 3 pruebas de contrato; la suite MySQL omitió 5 pruebas.
- Frontend: instalación limpia con el lockfile y `npm run build` completaron correctamente con Nuxt 4.6.4.
- Frontend: no hay script de pruebas automatizadas. `npm audit fix` actualizó dependencias compatibles; el audit restante reporta 10 vulnerabilidades (6 bajas y 4 moderadas). No se forzaron downgrades ni cambios mayores.
- Backend: `npm audit --omit=dev` reporta 3 vulnerabilidades moderadas transitivas. npm solo ofrece resolverlas con TypeORM 1.x, un cambio mayor que requiere actualización planificada.
- La suite MySQL real requiere `RUN_DB_E2E=true` y una base cuyo nombre termine en `_test`. No se ejecutó aquí porque Docker/MySQL de prueba no estaba disponible; nunca se apuntó a producción.

### Verificación de producción y límites

- En la API publicada, `GET /api/health` respondió 200 y los endpoints protegidos consultados respondieron 401 sin token. Estas solicitudes no verifican registro, login válido ni escrituras.
- La respuesta observada en Render corresponde al despliegue existente. El nuevo health check local que consulta MySQL no se ha desplegado; no se afirma que la base de producción esté sana.
- El origen local `http://localhost:3000` pudo leer el health de Render. La prueba desde `127.0.0.1:3002` fue bloqueada por CORS; no se modificó configuración de Render.
- No se probaron operaciones mutativas ni se inspeccionaron variables de entorno de Render o datos de producción.
- GitHub Actions está configurado para ejecutar backend, MySQL E2E y build frontend; el estado del último workflow no pudo confirmarse sin completar autenticación de GitHub.

Registro, login, perfil, reserva y administración tienen llamadas implementadas contra la API. El flujo manual completo con una cuenta de prueba y una base aislada sigue pendiente; los favoritos son locales al navegador y el formulario de contacto prepara un correo, pero no envía ni guarda mensajes en el servidor.
