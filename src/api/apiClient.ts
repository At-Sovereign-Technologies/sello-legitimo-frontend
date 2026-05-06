import axios from "axios";

// Empty base = same origin as the page (ngrok/Caddy or Vite + /api proxy on localhost).
const apiBase =
    typeof import.meta.env.VITE_API_URL === "string" &&
    import.meta.env.VITE_API_URL.trim() !== ""
        ? import.meta.env.VITE_API_URL
        : "";

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
