# Entorno de Desarrollo

## Requisitos

- Node.js 20+
- npm 10+
- VS Code (opcional: extensión Dev Containers)

## Inicio rápido

1. Abre el repositorio en VS Code.
2. Instala dependencias:

```bash
npm install
```

3. Copia .env.example a .env y ajusta valores si aplica.
4. Inicia el servidor de desarrollo:

```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

5. Abre la app en el puerto 5173.

## Variables de entorno

Para **ngrok / gateway (Caddy)**: deja `VITE_API_URL` vacío o sin definir; el cliente usa la misma procedencia que la página y envía `/api/...` por el túnel.

```env
VITE_AUTH_TIMEOUT_MS=10000
# Opcional: solo si el navegador debe llamar al backend por URL absoluta (no recomendado con HTTPS ngrok).
# VITE_API_URL=http://localhost:8080
# Solo Vite: proxy de /api (por defecto gateway en 8181).
# VITE_DEV_PROXY_TARGET=http://localhost:8181
```

## Validación

```bash
npm run lint
npm run build
```

## Solución de problemas

- Si el puerto 5173 está ocupado, libera el puerto o usa uno alternativo.
- Si falla autenticación E2E, revisa que el backend exponga endpoints compatibles con /api/v1/auth.
