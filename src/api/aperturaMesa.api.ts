import apiClient from "./apiClient";

export async function abrirMesa(
    mesaId: string,
    tokens: string[],
): Promise<void> {
    await apiClient.post(`/api/v1/mesas/${mesaId}/apertura`, {
        tokens,
    });
}