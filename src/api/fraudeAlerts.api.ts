import apiClient from "./apiClient";
import type {
  AlertaFraude,
  MetricasAlertas,
  ActualizarEstadoRequest,
  AlertasFilterParams,
  PageResponse,
  ReportarEventoRequest,
  CerrarCasoRequest,
  CierreCasoResponse,
  AlertasPorZonaResponse,
  CasosPorEstadoResponse,
  MapaRiesgoResponse,
  TipologiasPorDistritoResponse,
  DossierAuditorResponse,
  CadenaVerificacionResponse,
} from "../types/fraudeAlerts";

const BASE = "/api/v1/fraude";

function buildQuery(
  params: Record<string, string | number | undefined>,
): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== "",
  ) as [string, string][];
  if (entries.length === 0) return "";
  return "?" + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

export const listarAlertas = async (
  filters: AlertasFilterParams,
): Promise<PageResponse<AlertaFraude>> => {
  const { data } = await apiClient.get<PageResponse<AlertaFraude>>(
    `${BASE}/alertas${buildQuery({
      status: filters.status,
      severity: filters.severity,
      typologyId: filters.typologyId,
      originModule: filters.originModule,
      search: filters.search,
      page: filters.page !== undefined ? filters.page - 1 : undefined,
      size: filters.size ?? 20,
    })}`,
  );
  return data;
};

export const obtenerAlerta = async (
  uuid: string,
): Promise<AlertaFraude> => {
  const { data } = await apiClient.get<AlertaFraude>(
    `${BASE}/alertas/${uuid}`,
  );
  return data;
};

export const actualizarEstadoAlerta = async (
  uuid: string,
  body: ActualizarEstadoRequest,
): Promise<AlertaFraude> => {
  const { data } = await apiClient.patch<AlertaFraude>(
    `${BASE}/alertas/${uuid}/status`,
    body,
  );
  return data;
};

export const obtenerMetricas = async (): Promise<MetricasAlertas> => {
  const { data } = await apiClient.get<MetricasAlertas>(`${BASE}/metrics`);
  return data;
};

export const reportarEvento = async (
  body: ReportarEventoRequest,
): Promise<AlertaFraude> => {
  const { data } = await apiClient.post<AlertaFraude>(
    `${BASE}/eventos`,
    body,
  );
  return data;
};

export const cerrarCaso = async (
  uuid: string,
  body: CerrarCasoRequest,
): Promise<CierreCasoResponse> => {
  const { data } = await apiClient.post<CierreCasoResponse>(
    `${BASE}/casos/${uuid}/cierre`,
    body,
  );
  return data;
};

export const obtenerCierreCaso = async (
  uuid: string,
): Promise<CierreCasoResponse> => {
  const { data } = await apiClient.get<CierreCasoResponse>(
    `${BASE}/casos/${uuid}/cierre`,
  );
  return data;
};

export const obtenerAlertasPorZona = async (): Promise<AlertasPorZonaResponse> => {
  const { data } = await apiClient.get<AlertasPorZonaResponse>(
    `${BASE}/metricas/alertas-por-zona`,
  );
  return data;
};

export const obtenerCasosPorEstado = async (): Promise<CasosPorEstadoResponse> => {
  const { data } = await apiClient.get<CasosPorEstadoResponse>(
    `${BASE}/metricas/casos-por-estado`,
  );
  return data;
};

export const obtenerMapaRiesgo = async (): Promise<MapaRiesgoResponse> => {
  const { data } = await apiClient.get<MapaRiesgoResponse>(
    `${BASE}/metricas/mapa-riesgo`,
  );
  return data;
};

export const obtenerTipologiasPorDistrito = async (): Promise<TipologiasPorDistritoResponse> => {
  const { data } = await apiClient.get<TipologiasPorDistritoResponse>(
    `${BASE}/metricas/tipologias-por-distrito`,
  );
  return data;
};

export const obtenerDossierAuditor = async (): Promise<DossierAuditorResponse> => {
  const { data } = await apiClient.get<DossierAuditorResponse>(
    `${BASE}/auditoria/dossier`,
  );
  return data;
};

export const verificarCadenaAuditoriaFraude = async (): Promise<CadenaVerificacionResponse> => {
  const { data } = await apiClient.get<CadenaVerificacionResponse>(
    `${BASE}/auditoria/cadena/verificar`,
  );
  return data;
};

export const confirmarEntregaNotificacion = async (
  id: number,
  targetRole: string,
): Promise<{ status: string; deliveryId: number; targetRole: string }> => {
  const { data } = await apiClient.post<{ status: string; deliveryId: number; targetRole: string }>(
    `${BASE}/notificaciones/${id}/confirmar`,
    { targetRole },
  );
  return data;
};
