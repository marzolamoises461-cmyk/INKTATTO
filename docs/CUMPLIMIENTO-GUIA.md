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

- El registro público asigna el rol `user`; no permite que el cliente se otorgue privilegios de administrador.
- Las contraseñas se guardan con bcrypt y no se exponen en respuestas.
- El JWT no contiene contraseña ni otros secretos.
- La estrategia consulta de nuevo el usuario en MySQL; una cuenta desactivada deja de poder usar el token.
- El CRUD de usuarios y las operaciones administrativas exigen JWT válido y rol `admin`.
- En todos los entornos `synchronize` está desactivado; el esquema se cambia con migraciones.
- La aplicación valida al arrancar las variables obligatorias de MySQL y exige un `JWT_SECRET` aleatorio de al menos 32 caracteres.
- CORS solo admite los orígenes HTTP/HTTPS declarados en `CORS_ORIGIN`; no se permite el comodín `*`.
- El DataSource de migraciones falla explícitamente si faltan las credenciales de conexión.
- El primer administrador se crea mediante el comando local `npm run admin:create`, nunca mediante un endpoint público.

## Estado de verificación

Rama de trabajo: `feature/guia-instructor-completa` (PR #4).

### Comprobaciones locales reportadas

El desarrollador reportó los siguientes resultados locales; no se han vuelto a ejecutar en este entorno:

- `npm ci`.
- `npm run lint`.
- `npm run build`.
- `npm test -- --runInBand`: 6 suites y 19 pruebas aprobadas.
- `npm run test:e2e -- --runInBand`: 1 suite y 3 pruebas de contrato HTTP aprobadas. Estas pruebas usan un servicio simulado; no son integración real con MySQL.
- `npm run migration:show`: migraciones aplicadas en la base local `inktatto_db`.

### Validación automatizada

El workflow `.github/workflows/backend-ci.yml` está configurado para ejecutar lint,
compilación NestJS, pruebas unitarias, migraciones en un MySQL temporal, pruebas
E2E con MySQL y compilación Nuxt.

**Estado del commit revisado:** el HEAD consultado del PR (#4) era
`c91cb4a0f2867758374611f8939124d974db63c7`. En esa consulta GitHub no devolvió
ejecuciones de Actions ni estados de verificación asociados a ese SHA. La
descripción del PR menciona resultados aprobados para otro commit
(`c1c4aa9`); esos resultados no certifican automáticamente el HEAD actual.
Por tanto, la CI del HEAD debe considerarse pendiente hasta que GitHub Actions
muestre los trabajos de backend y frontend en verde.

La suite `backend/test/database.e2e-spec.ts` requiere `RUN_DB_E2E=true` y una
base cuyo nombre termine en `_test`. No debe ejecutarse contra la base de
desarrollo, compartida o de producción.

### Integración con main — bloqueada

En la comparación consultada, `feature/guia-instructor-completa` y `main`
estaban divergidas: 87 commits exclusivos de la rama de trabajo y 109 commits
exclusivos de `main`. GitHub marcó el PR como no integrable en ese momento.
Antes de fusionar se debe actualizar la rama de trabajo desde `main`, resolver
los conflictos conservando ambos conjuntos de cambios y volver a ejecutar toda
la CI. No se debe forzar la fusión ni sobrescribir `main`.

### Pendiente de confirmación manual

- Probar en navegador registro, verificación de correo, login, perfil y envío/cancelación de una reserva.
- Confirmar que `NUXT_PUBLIC_API_BASE` apunte a la URL correcta al desplegar el frontend.
- Probar la carga privada de imágenes con un bucket S3-compatible real.
- Configurar SMTP real para verificar correo, recuperación y notificaciones.
- Probar pagos únicamente en sandbox Wompi con credenciales de prueba.

## Fase 3 — estado por requisito

| Requisito | Implementación declarada en la rama; requiere validación |
|---|---|
| Límite de intentos de login/registro | Throttler global y límites por ruta; el almacenamiento en memoria es por instancia y requiere un store compartido si hay varias réplicas. |
| Helmet, contraseñas y baja lógica | Helmet, CORS restringido, reglas de complejidad y desactivación lógica de usuarios. |
| Vulnerabilidades moderadas | Se añadieron overrides de dependencias; repetir `npm audit` en CI para confirmar el resultado actual. |
| Contacto | Formulario, validación de servidor, persistencia MySQL y bandeja administrativa. |
| Favoritos | Persistencia MySQL por usuario y operaciones de alta/eliminación; visitantes mantienen almacenamiento local. |
| Administración | Listados con paginación, búsqueda y ordenamiento; rutas administrativas protegidas por rol. |
| Swagger | OpenAPI en `/api/docs`. |
| Pagos | Integración Wompi preparada; no está lista para producción sin credenciales, webhook HTTPS y pruebas del comercio. |
| Pruebas | Hay pruebas unitarias, E2E HTTP y una suite E2E MySQL aislada; falta certificar el HEAD actual con CI. |

### Dependencias externas para completar producción

- Correo: SMTP configurado para registro/verificación, recuperación y notificaciones.
- Imágenes: bucket S3-compatible privado y credenciales del estudio.
- Pagos: llaves Wompi de sandbox y producción, secretos de integridad/eventos, HTTPS público y URL de webhook configurada.
- Pruebas de integración: MySQL aislado cuyo nombre termine en `_test`; nunca usar la base compartida/de desarrollo.


## Ampliación recibida de Claude — catálogo y equipo

Se añadieron al backend los módulos `catalog` y `staff`:

- `GET /api/catalog` y `GET /api/staff`: consulta pública de registros activos.
- `GET /api/catalog/admin` y `GET /api/staff/admin`: consulta administrativa.
- `POST`, `PATCH/:id` y `DELETE/:id` en ambos módulos: operaciones protegidas con JWT y rol `admin`.
- Entidades TypeORM y migraciones para `tattoo_designs` y `staff_members`; la eliminación desde estas rutas desactiva el registro en lugar de borrarlo.
- Las imágenes se almacenan como texto largo en MySQL (`MEDIUMTEXT`), por lo que este cambio no configura un almacenamiento externo ni valida que una URL de imagen sea segura.

Estos módulos se registraron en `AppModule`. El ZIP recibido no contiene páginas frontend para administrarlos y aún no hay una ejecución CI asociada al nuevo HEAD; por tanto, la integración de backend está subida a esta rama, pero requiere compilación, pruebas y conexión con la interfaz antes de considerarse terminada.
