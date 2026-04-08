# Notas de Bootstrap

## Origen

Este repositorio adopta la línea base de migración devcontainer definida para org-migration.

## Cambios aplicados

1. Se agregó .devcontainer/devcontainer.json con Node 20 y Git.
2. Se agregó .devcontainer/post-create.sh para instalación determinística de dependencias.
3. Se agregó DEV_ENVIRONMENT.md y estructura docs para incorporación.
4. Se actualizó el registro de cambios con estado de migración.

## Decisiones de dependencias

- Runtime: Node 20 fijado por imagen de contenedor.
- Estrategia de instalación: lockfile-first (npm ci cuando existe lockfile).

## Idempotencia

- Reabrir el contenedor vuelve a ejecutar la configuración de forma segura.
- No se almacenan secretos en archivos versionados.
