import { getToken } from "../services/authService";
import {
    buildGatewayUrl,
    createJsonHeaders,
    getErrorMessage,
} from "./auth.api";
import { debugLog } from "../utils/debugLogger";

const CONFIGURACION_ELECCION_BASE_PATH = "/api/elecciones";

export async function guardarConfiguracionFinal(data: unknown) {
    const url = buildGatewayUrl(CONFIGURACION_ELECCION_BASE_PATH);
    const token = getToken();

    debugLog("api", "Enviando configuracion final al gateway", {
        url,
        hasToken: Boolean(token),
        payload: data,
    });

    const response = await fetch(url, {
        method: "POST",
        headers: createJsonHeaders(token),
        body: JSON.stringify(data),
    });

    debugLog("api", "Respuesta del gateway para configuracion final", {
        url,
        status: response.status,
        ok: response.ok,
    });

    if (!response.ok) {
        throw new Error(
            await getErrorMessage(
                response,
                "Error al enviar la configuracion final",
            ),
        );
    }

    return response.json();
}

export async function guardarBorrador(data: unknown) {
    const url = buildGatewayUrl(`${CONFIGURACION_ELECCION_BASE_PATH}/borrador`);
    const token = getToken();

    debugLog("api", "Enviando borrador al gateway", {
        url,
        hasToken: Boolean(token),
        payload: data,
    });

    const response = await fetch(url, {
        method: "POST",
        headers: createJsonHeaders(token),
        body: JSON.stringify(data),
    });

    debugLog("api", "Respuesta del gateway para guardar borrador", {
        url,
        status: response.status,
        ok: response.ok,
    });

    if (!response.ok) {
        throw new Error(
            await getErrorMessage(response, "Error al guardar borrador"),
        );
    }

    return response.json();
}

export async function obtenerEleccionPorId(
    id: number,
): Promise<Record<string, unknown>> {
    const url = buildGatewayUrl(`${CONFIGURACION_ELECCION_BASE_PATH}/${id}`);
    const token = getToken();

    debugLog("api", "Consultando eleccion guardada en BD", {
        url,
        id,
        hasToken: Boolean(token),
    });

    const response = await fetch(url, {
        method: "GET",
        headers: createJsonHeaders(token),
    });

    debugLog("api", "Respuesta al consultar eleccion en BD", {
        url,
        status: response.status,
        ok: response.ok,
    });

    if (!response.ok) {
        throw new Error(
            await getErrorMessage(
                response,
                "Error al obtener la configuración guardada en la BD",
            ),
        );
    }

    return response.json() as Promise<Record<string, unknown>>;
}
