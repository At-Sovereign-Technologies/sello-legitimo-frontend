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

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_AUTH_TIMEOUT_MS=10000
```

## Validación

```bash
npm run lint
npm run build
```

## Solución de problemas

- Si el puerto 5173 está ocupado, libera el puerto o usa uno alternativo.
- Si falla autenticación E2E, revisa que el backend exponga endpoints compatibles con /api/v1/auth.
