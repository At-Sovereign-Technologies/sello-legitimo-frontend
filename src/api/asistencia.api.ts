// SE-M3-05 — Cliente API para gestión de voto asistido.
// Backend: election-compute-engine (.NET 8). Endpoints bajo /api/v1/asistencia.

import apiClient from "./apiClient";
import type {
    SolicitudAsistencia,
    RespuestaAsistencia,
    ConteoAsistenciasActa,
} from "../types/asistencia";

const BASE = "/api/v1/asistencia";

export async function registrarAsistencia(
    solicitud: SolicitudAsistencia
): Promise<RespuestaAsistencia> {
    const response = await apiClient.post<RespuestaAsistencia>(
        `${BASE}/registrar`,
        solicitud
    );
    return response.data;
}

export async function obtenerActaMesa(
    mesaId: string
): Promise<ConteoAsistenciasActa> {
    const response = await apiClient.get<ConteoAsistenciasActa>(
        `${BASE}/acta/${encodeURIComponent(mesaId)}`
    );
    return response.data;
}
