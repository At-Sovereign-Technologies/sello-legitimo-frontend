# Entorno

## Requisitos
- Node.js 20+
- npm 10+
- VS Code

## Variables de entorno
Crear .env local con:

```env
VITE_AUTH_TIMEOUT_MS=10000
# Vacío = misma procedencia que la SPA (recomendado con ngrok → Caddy).
# VITE_API_URL=
# Vite: proxy /api → gateway (8181) por defecto.
# VITE_DEV_PROXY_TARGET=http://localhost:8181
```

## Validación
```bash
npm run lint
npm run build
```
