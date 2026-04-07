# sello-legitimo-frontend

Interfaz web del sistema Sello Legítimo, construida con React, TypeScript y Vite.

## Documentación

- Guía de incorporación: docs/onboarding.md
- Guía de entorno: DEV_ENVIRONMENT.md
- Solución de problemas: docs/troubleshooting.md
- Resumen de arquitectura: docs/architecture.md
- Notas de bootstrap: BOOTSTRAP.md

## Comandos principales

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 5173
npm run lint
npm run build
```

## Alcance actual

- Landing y flujo de login implementados en UI.
- El frontend espera endpoints de autenticación bajo /api/v1/auth.
