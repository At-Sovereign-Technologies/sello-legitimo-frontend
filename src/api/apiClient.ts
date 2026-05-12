import axios from "axios";

// Empty base = same origin as the page (ngrok/Caddy or Vite + /api proxy on localhost).
// Default to localhost:8084 when no VITE_API_URL is provided so local backend
// (development) targets the expected port. Honor VITE_API_URL when present.
const apiBase =
    typeof import.meta.env.VITE_API_URL === "string" &&
    import.meta.env.VITE_API_URL.trim() !== ""
        ? import.meta.env.VITE_API_URL
        : "http://localhost:8084";

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
