import apiClient from "./apiClient";
import type { Tipologia, CrearTipologiaRequest } from "../types/fraudeAlerts";

const BASE = "/api/v1/fraude/tipologias";

export const listarTipologias = async (): Promise<Tipologia[]> => {
  const { data } = await apiClient.get<Tipologia[]>(BASE);
  return data;
};

export const obtenerTipologia = async (id: string): Promise<Tipologia> => {
  const { data } = await apiClient.get<Tipologia>(`${BASE}/${id}`);
  return data;
};

export const crearTipologia = async (
  body: CrearTipologiaRequest,
): Promise<Tipologia> => {
  const { data } = await apiClient.post<Tipologia>(BASE, body);
  return data;
};

export const actualizarTipologia = async (
  id: string,
  body: CrearTipologiaRequest,
): Promise<Tipologia> => {
  const { data } = await apiClient.put<Tipologia>(`${BASE}/${id}`, body);
  return data;
};

export const eliminarTipologia = async (id: string): Promise<void> => {
  await apiClient.delete(`${BASE}/${id}`);
};
