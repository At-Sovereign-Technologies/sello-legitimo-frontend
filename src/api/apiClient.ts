import axios from "axios";
import {
    generateMockToken,
    storeAuthToken,
    MOCK_ROLE_DOCUMENTS,
} from "../services/authService";

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
    const userId = localStorage.getItem("mockUserId") || "frontend-user";
    let token = localStorage.getItem("auth_token");
    if (role && !token) {
        const doc =
            userId && /^\d+$/.test(userId)
                ? userId
                : (MOCK_ROLE_DOCUMENTS[role] || "10000001");
        token = generateMockToken(role, doc);
        storeAuthToken(token);
        localStorage.setItem("mockUserId", doc);
    }
    if (role) {
        config.headers["X-Mock-Role"] = role;
        config.headers["X-User-Role"] = role;
        config.headers["X-User-Id"] = localStorage.getItem("mockUserId") || userId;
    }
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
});

export default apiClient;
