# INKTATTO — estudio de tatuajes

Aplicación web construida con Nuxt/Vue y una API backend NestJS + MySQL.

## Carpetas

- `app/`: interfaz web original del estudio (inicio, galería, artistas, reservas, contacto, login y perfil).
- `backend/`: API REST que implementa la guía del instructor: MySQL/TypeORM, usuarios, autenticación JWT, bcrypt, DTOs, validación, serialización, roles y pruebas.
- `docs/`: matriz de cumplimiento y protocolo de pruebas de la API.

## Requisitos

Node.js 20+, npm y MySQL 8+.

## Ejecutar frontend

```bash
npm install
npm run dev
```

## Ejecutar backend

1. Crear base de datos: `CREATE DATABASE inktatto_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
2. Copiar `backend/.env.example` a `backend/.env` y configurar las credenciales reales de MySQL y un secreto JWT aleatorio.
3. Ejecutar:

```bash
cd backend
npm install
npm run start:dev
```

La API queda disponible en `http://localhost:3001/api`. No subir archivos `.env` ni compartir tokens.

## Cumplimiento de la guía

Consultar `docs/CUMPLIMIENTO-GUIA.md` y ejecutar el protocolo de `docs/PRUEBAS-API.md`. La integración del frontend con la API para convertir las reservas y los perfiles locales en registros persistentes es una etapa posterior; no se presenta como terminada en esta entrega.
