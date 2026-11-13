# Base de datos MySQL

Para una instalación limpia, ejecuta `001-create-users.sql` en MySQL 8.

En desarrollo, TypeORM tiene `synchronize` habilitado únicamente cuando
`NODE_ENV` no es `production`. En producción se mantiene desactivado:
aplica los scripts SQL versionados antes de desplegar cada versión.

No guardes contraseñas reales en este repositorio. Configura `backend/.env`
a partir de `backend/.env.example`.
