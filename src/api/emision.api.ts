// SE-M3-01 / SE-M3-02 — Funciones fetch tipadas para emisión de voto.
// El backend vive en election-compute-engine (.NET 8). En entornos donde
// el gateway aún no rute /api/v1/emision, configurar VITE_API_URL para
// apuntar al servicio directo.

import apiClient from "./apiClient";
import type {
    ComprobanteVoto,
    EmisionVoto,
    EmisionVotoRemotoRequest,
} from "../types/emision";

const BASE = "/api/v1/emision";

export async function emitirPresencial(
    emision: EmisionVoto
): Promise<ComprobanteVoto> {
    const payload: EmisionVoto = { ...emision, canal: "Presencial" };
    const response = await apiClient.post<ComprobanteVoto>(
        `${BASE}/presencial`,
        payload
    );
    return response.data;
}

export async function emitirRemoto(
    request: EmisionVotoRemotoRequest
): Promise<ComprobanteVoto> {
    const payload: EmisionVotoRemotoRequest = {
        ...request,
        emision: { ...request.emision, canal: "Remoto" },
    };
    const response = await apiClient.post<ComprobanteVoto>(
        `${BASE}/remoto`,
        payload
    );
    return response.data;
}
