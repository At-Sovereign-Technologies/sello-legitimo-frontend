import axios from "axios";

const trim = (v: unknown) => (typeof v === "string" ? v.trim() : "");
// Orden de resolución:
//   1. VITE_API_URL   — sobreescritura explícita del backend
//   2. VITE_API_GATEWAY_URL — gateway de docker (puerto 8091)
//   3. VITE_AUTH_SERVICE_URL — sobreescritura del servicio de auth
//   4. "" (vacía)     — mismo origen (works via docker gateway or Vite proxy)
const apiBase =
    trim(import.meta.env.VITE_API_URL) ||
    trim(import.meta.env.VITE_API_GATEWAY_URL) ||
    trim(import.meta.env.VITE_AUTH_SERVICE_URL) ||
    "";

const apiClient = axios.create({
    baseURL: apiBase,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use((config) => {
    const role = localStorage.getItem("mockRole");
    if (role) {
        config.headers["X-Mock-Role"] = role;
    }
    return config;
});

export default apiClient;
