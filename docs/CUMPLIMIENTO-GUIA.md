# Matriz de cumplimiento — guía del instructor

La guía tiene siete apartados y está centrada en NestJS, MySQL, usuarios, JWT,
DTOs, validación, serialización, roles y pruebas.

| Apartado | Archivos / implementación |
|---|---|
| 1. Configuración NestJS | `backend/package.json`, `nest-cli.json`, `tsconfig.json`, `src/main.ts` |
| 2. MySQL y configuración | `backend/.env.example`, `backend/database/001-create-users.sql`, `src/app.module.ts` |
| 3. Módulo User | Entidad, DTOs, servicio, controlador y módulo en `backend/src/user/` |
| 4. Módulo Auth | Registro, login, JWT, Passport, estrategia, decorador GetUser y AuthController en `backend/src/auth/` |
| 5. DTOs, validación y serialización | DTOs con class-validator; ValidationPipe global estricto; ClassSerializerInterceptor; `@Exclude()` y `select: false` para password |
| 6. Roles y protección | `JwtAuthGuard`, `RolesGuard`, `@Roles()`, CRUD de usuarios solo admin y rutas demostrativas `/api/example/*` |
| 7. Pruebas y ejemplos | `user.service.spec.ts`, `test/auth.e2e-spec.ts` y `docs/PRUEBAS-API.md` |

## Reglas de seguridad

- El registro público no acepta rol ni estado: crea siempre usuarios activos con rol
  `user`.
- Las contraseñas se guardan con bcrypt y no se exponen en las respuestas.
- El JWT no contiene contraseña ni otros secretos.
- La estrategia vuelve a consultar al usuario en MySQL, por lo que una cuenta
  desactivada deja de poder usar el token.
- El CRUD de usuarios exige JWT válido y rol `admin`.
- Los guards se ejecutan en orden: primero JWT y después rol.
- En producción `synchronize` está desactivado; se debe aplicar el SQL versionado.

## Estado de verificación

La estructura y los archivos de implementación están en el repositorio. No se
declara compilación ni pruebas aprobadas todavía: deben ejecutarse con Node.js,
dependencias instaladas y MySQL disponible. La integración de las pantallas de
reservas y perfil del frontend con persistencia de la API es una fase adicional
y no se considera terminada por la sola existencia del backend.
