import apiClient from "./apiClient";

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
        ...(token
            ? {
                  Authorization: `Bearer ${token}`,
              }
            : {}),
    };
}

export async function getErrorMessage(
    response: Response,
    fallbackMessage: string,
): Promise<string> {
    try {
        const body = (await response.json()) as Record<string, unknown>;

        const errors = body.errores;

        if (typeof body.mensaje === "string" && body.mensaje.trim()) {
            return body.mensaje;
        }

        if (typeof body.message === "string" && body.message.trim()) {
            return body.message;
        }

        if (typeof body.error === "string" && body.error.trim()) {
            return body.error;
        }

        if (errors && typeof errors === "object") {
            const details = Object.entries(errors as Record<string, unknown>)
                .map(([field, value]) => `${field}: ${String(value)}`)
                .join(" | ");

            if (details) {
                return details;
            }
        }
    } catch {
        // Ignore non-JSON responses and use fallback message.
    }

    return fallbackMessage;
}

export const requestOtp = async (cedula: string): Promise<void> => {
    await apiClient.post("/api/v1/auth/login", { cedula });
};

export const verifyOtp = async (
    cedula: string,
    otp: string,
): Promise<string> => {
    const response = await apiClient.post("/api/v1/auth/verify", {
        cedula,
        otp,
    });

    return response.data.token;
};
