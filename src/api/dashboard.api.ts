import apiClient from "./apiClient";

export const getDashboardResumen = async () => {
    const response = await apiClient.get("/api/v1/dashboard/resumen");
    return response.data;
};
