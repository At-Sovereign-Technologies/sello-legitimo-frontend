# Development Environment

## Prerequisites

- Docker Desktop or Docker Engine + Docker Compose
- VS Code
- Dev Containers extension

## Quick Start (Dev Container)

1. Open this repository in VS Code.
2. Run: Dev Containers: Reopen in Container.
3. Wait for the post-create step to install dependencies.
4. Start development server:

```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

5. Open forwarded port 5173.

## Environment Variables

Create a local `.env` file if needed. Do not commit secrets.

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_AUTH_TIMEOUT_MS=10000
```

## Validation

```bash
npm run lint
npm run build
```
