# US-SR-M2-04 - Apertura de Mesa con Quórum M-de-N

## Resumen
Pantalla protegida para que los jurados autoricen la apertura de una mesa mediante dos credenciales válidas.

## Ruta
- `/gestion-preelectoral/mesa/:mesaId/apertura`
- La ruta está protegida por `ProtectedRoute`.

## Integración API
- Servicio: `src/api/aperturaMesa.api.ts`
- Método: `abrirMesa(mesaId, tokens)`
- Endpoint: `POST /api/v1/mesas/{mesaId}/apertura`
- Payload: `{ "tokens": [token1, token2] }`
- Cliente HTTP: `apiClient`

## Comportamiento UI
- Dos campos de credencial para jurado 1 y jurado 2.
- Estado de carga con botón deshabilitado y spinner.
- Error 403 con mensaje de autorización denegada.
- Éxito con banner verde `MESA ABIERTA` y accesos mock a formularios E-11 y E-9.

## Nota
La pantalla sigue el patrón institucional del módulo de gestión preelectoral y no expone llamadas directas a `fetch`.