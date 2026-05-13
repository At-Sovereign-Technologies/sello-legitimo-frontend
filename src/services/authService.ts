import type {
    GenerateOtpRequest,
    VerifyOtpRequest,
    VerifyOtpResponse,
    GenerateOtpResponse,
} from "../types/auth";

// Coincide con apiClient: sin definir/vacío → mismo origen /api (gateway/Tunnel or Vite proxy).
const trim = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const API_URL =
    trim(import.meta.env.VITE_AUTH_SERVICE_URL) ||
    trim(import.meta.env.VITE_API_URL) ||
    "";

const TOKEN_KEY = "auth_token";
const USERNAME_KEY = "auth_username";

export const generateOtp = async (
    data: GenerateOtpRequest,
): Promise<GenerateOtpResponse> => {
    const res = await fetch(`${API_URL}/api/v1/auth/generate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    return res.json();
};

export const verifyOtp = async (
    data: VerifyOtpRequest,
): Promise<VerifyOtpResponse> => {
    const res = await fetch(`${API_URL}/api/v1/auth/verify`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    return res.json();
};

/**
 * Decode JWT payload without verification (only for reading claims)
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;

        const decoded = atob(parts[1]);
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

/**
 * Get the authentication token from storage
 */
export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    return getToken() !== null;
}

/**
 * Get the display username
 */
export function getDisplayUsername(): string {
    return localStorage.getItem(USERNAME_KEY) || "Usuario";
}

/**
 * Get user role from JWT payload
 */
export function getUserRole(): string | null {
    const token = getToken();
    if (!token) return null;
    const payload = decodeJwtPayload(token);
    return (payload?.role as string) || (payload?.rol as string) || null;
}

/**
 * Check if user is in mock auth mode
 */
export function isMockAuth(): boolean {
    return localStorage.getItem("mockRole") !== null;
}

/**
 * Get mock role
 */
export function getMockRole(): string | null {
    return localStorage.getItem("mockRole");
}

/**
 * Get the first character of the display username for avatar
 */
export function getDisplayInitial(): string {
    const username = getDisplayUsername();
    return username.charAt(0).toUpperCase();
}

/**
 * Store authentication token and user info
 */
export function storeAuthToken(token: string, username?: string): void {
    localStorage.setItem(TOKEN_KEY, token);

    // Intentar extraer nombre de usuario del token si no se proporciona
    if (username) {
        localStorage.setItem(USERNAME_KEY, username);
    } else {
        const payload = decodeJwtPayload(token);
        const extractedUsername =
            (payload?.sub as string) ||
            (payload?.email as string) ||
            (payload?.name as string) ||
            "Usuario";
        localStorage.setItem(USERNAME_KEY, extractedUsername);
    }
}

/**
 * Clear authentication data (logout)
 */
export function logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
}

/**
 * Handle OIDC callback (for Authelia)
 */
export async function handleOidcCallback(
    code: string,
    state: string,
): Promise<void> {
    // Esto manejaría el callback OIDC de Authelia
    // La implementación depende de la configuración del backend
    console.log("OIDC callback received", { code, state });
}
