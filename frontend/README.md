# INKTATTO — Frontend

Interfaz web del estudio, desarrollada con Nuxt 4, Vue y Vuetify.

## Desarrollo local

Desde esta carpeta (`frontend/`):

```powershell
npm ci
$env:NUXT_PUBLIC_API_BASE = "http://localhost:3001/api"
npm run dev
```

Para compilar:

```powershell
npm run build
```

La configuración de la API se define mediante `NUXT_PUBLIC_API_BASE`. En producción debe apuntar a la URL pública del backend.
