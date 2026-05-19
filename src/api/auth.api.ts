import apiClient from "./apiClient";

const trim = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const API_URL =
    trim(import.meta.env.VITE_AUTH_SERVICE_URL) ||
    trim(import.meta.env.VITE_API_URL) ||
    trim(import.meta.env.VITE_API_GATEWAY_URL) ||
    "";

// ---- Exportaciones heredadas (usadas por otros módulos) ----

const DEFAULT_GATEWAY_URL = "";

function normalizeBaseUrl(url: string): string {
    return url.replace(/\/+$/, "");
}

function normalizePath(path: string): string {
    return path.startsWith("/") ? path : `/${path}`;
}

export function getGatewayBaseUrl(): string {
    const configuredUrl = (
        import.meta.env.VITE_API_GATEWAY_URL as string | undefined
    )?.trim();
    return normalizeBaseUrl(configuredUrl || DEFAULT_GATEWAY_URL);
}

export function buildGatewayUrl(path: string): string {
    return `${getGatewayBaseUrl()}${normalizePath(path)}`;
}

export function createJsonHeaders(token?: string | null): HeadersInit {
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

export async function getErrorMessage(
    response: Response,
    fallbackMessage: string,
): Promise<string> {
    try {
        const body = (await response.json()) as Record<string, unknown>;
        const errors = body.errores;
        if (typeof body.mensaje === "string" && body.mensaje.trim()) return body.mensaje;
        if (typeof body.message === "string" && body.message.trim()) return body.message;
        if (typeof body.error === "string" && body.error.trim()) return body.error;
        if (errors && typeof errors === "object") {
            const details = Object.entries(errors as Record<string, unknown>)
                .map(([field, value]) => `${field}: ${String(value)}`)
                .join(" | ");
            if (details) return details;
        }
    } catch { /* ignore */ }
    return fallbackMessage;
}

/** Heredado: login estilo OTP (sends { cedula } → triggers old mock) */
export const requestOtp = async (cedula: string): Promise<void> => {
    await apiClient.post("/api/v1/auth/login", { cedula });
};

export const verifyOtp = async (cedula: string, otp: string): Promise<string> => {
    const response = await apiClient.post("/api/v1/auth/verify", { cedula, otp });
    return response.data.token;
};

// ---- Nuevo flujo de login MFA ----

function getToken(): string | null {
    return localStorage.getItem("auth_token");
}

function authHeaders(): HeadersInit {
    const token = getToken();
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

export async function login(documento: string, password: string): Promise<Record<string, unknown>> {
    const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ numeroDocumento: documento, contrasena: password }),
    });
    const body = await res.json();
    if (!res.ok) {
        const msg =
            (typeof body.message === "string" && body.message) ||
            (typeof body.error === "string" && body.error) ||
            "Error al iniciar sesión";
        throw new Error(msg);
    }
    return body;
}

export async function verifyMFA(otpCode: string): Promise<Record<string, unknown>> {
    const res = await fetch(`${API_URL}/api/v1/auth/mfa/verify`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ otpCode }),
    });
    const body = await res.json();
    if (!res.ok) {
        const msg =
            (typeof body.message === "string" && body.message) ||
            (typeof body.error === "string" && body.error) ||
            "Código MFA inválido";
        throw new Error(msg);
    }
    return body;
}
