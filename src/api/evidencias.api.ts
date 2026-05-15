import apiClient from "./apiClient";
import type {
  EvidenciaReferencia,
  CrearEvidenciaRequest,
} from "../types/fraudeAlerts";

const BASE = "/api/v1/fraude/evidencias";

export const asociarEvidencia = async (
  body: CrearEvidenciaRequest,
): Promise<EvidenciaReferencia> => {
  const { data } = await apiClient.post<EvidenciaReferencia>(BASE, body);
  return data;
};

export const listarEvidenciasPorAlerta = async (
  alertUuid: string,
): Promise<EvidenciaReferencia[]> => {
  const { data } = await apiClient.get<EvidenciaReferencia[]>(
    `${BASE}/alerta/${alertUuid}`,
  );
  return data;
};

export const obtenerSiguienteReferenceId = async (): Promise<{
  referenceId: string;
}> => {
  const { data } = await apiClient.get<{ referenceId: string }>(
    `${BASE}/next-reference-id`,
  );
  return data;
};
