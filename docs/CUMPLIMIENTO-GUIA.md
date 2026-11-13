# Matriz de cumplimiento — guía del instructor

La guía entregada está organizada en siete apartados. Esta matriz relaciona cada punto con los archivos añadidos en `backend/`.

| Apartado de la guía | Implementación |
|---|---|
| 1. Configuración inicial NestJS y dependencias | `backend/package.json`, `backend/nest-cli.json`, `backend/tsconfig.json`, `backend/src/main.ts` |
| 2. MySQL y variables de entorno | `backend/.env.example`, `backend/src/app.module.ts` (ConfigModule + TypeOrmModule MySQL) |
| 3. Módulo User: entidad, DTO, servicio, controlador y módulo | `backend/src/user/entities/user.entity.ts`, `backend/src/user/dto/`, `backend/src/user/user.service.ts`, `backend/src/user/user.controller.ts`, `backend/src/user/user.module.ts` |
| 4. Auth: DTO, payload JWT, estrategia, servicio, guard, decorador GetUser, controlador y módulo | `backend/src/auth/` |
| 5. Validación y serialización global | `backend/src/main.ts` (ValidationPipe estricto + ClassSerializerInterceptor), `User.password` con `@Exclude()` y `select: false` |
| 6. Roles y protección de rutas | `backend/src/auth/decorators/roles.decorator.ts`, `backend/src/auth/guards/roles.guard.ts`; CRUD `/users` protegido para `admin` |
| 7. Pruebas de registro, login, perfil, CRUD, roles y errores | Pruebas automatizadas iniciales en `backend/src/user/user.service.spec.ts` y `backend/test/auth.e2e-spec.ts`; comandos y ejemplos manuales en `PRUEBAS-API.md` |

## Criterios de seguridad añadidos

- El registro público siempre asigna `role: user`; no acepta que el cliente se autoproclame administrador.
- El password se almacena con bcrypt (10 rondas) y no se devuelve en respuestas.
- JWT contiene `sub`, `email` y `role`, sin datos secretos.
- Las cuentas inactivas no pueden autenticarse.
- El CRUD de usuarios exige JWT válido y rol `admin`.
- `ValidationPipe` rechaza propiedades no declaradas y transforma DTOs.
- En producción `synchronize` queda desactivado; se deben gestionar cambios de esquema mediante migraciones.

## Verificación pendiente de entorno

No se pudo ejecutar `npm install`, `npm run build` ni las pruebas en este entorno de preparación porque la instalación de paquetes agotó el tiempo disponible sin completar. Por tanto, los archivos están preparados, pero no se declara todavía compilación ni conexión real a MySQL como aprobadas. Se debe ejecutar el protocolo de `PRUEBAS-API.md` en un equipo con Node/npm y MySQL disponibles.
