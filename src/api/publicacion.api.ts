// ── Publicación Electoral — Funciones fetch tipadas ─────────────────────────
// Sin lógica de UI. Cada función devuelve la promesa con el tipo estricto.
// El manejo de errores HTTP se delega al hook consumidor.

import apiClient from "./apiClient";
import type {
    ParticipacionPayload,
    ResultadosPayload,
    EstadoMotorPayload,
} from "../types/publicacion";

const BASE = "/api/v1/publicacion";

/**
 * Obtiene los datos de participación electoral en vivo.
 * Acceso público — sin autenticación.
 */
export async function getParticipacion(): Promise<ParticipacionPayload> {
    const response = await apiClient.get<ParticipacionPayload>(
        `${BASE}/participacion`
    );
    return response.data;
}

/**
 * Obtiene el estado del motor de publicación.
 * Solo para uso interno / herramientas de operaciones.
 */
export async function getEstadoMotor(): Promise<EstadoMotorPayload> {
    const response = await apiClient.get<EstadoMotorPayload>(`${BASE}/estado`);
    return response.data;
}

/**
 * Obtiene los resultados parciales acumulados.
 * Solo disponible cuando el motor está en JORNADA_CERRADA_DIA.
 * Devuelve 403 si la jornada está activa (estado esperado del sistema).
 */
export async function getResultadosParciales(): Promise<ResultadosPayload> {
    const response = await apiClient.get<ResultadosPayload>(
        `${BASE}/resultados`
    );
    return response.data;
}
