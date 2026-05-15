import type {
    UserProfile,
    MFASetupResponse,
    MFAVerifyResponse,
    CeremonyInitResponse,
    CeremonyStatus,
    VaultStatus,
    ShardSubmissionResponse,
} from "../types/security";
import {
    generateMockToken,
    storeAuthToken,
    MOCK_ROLE_DOCUMENTS,
} from "../services/authService";

const trim = (v: unknown) => (typeof v === "string" ? v.trim() : "");
// Coincide con apiClient: prioriza gateway en builds docker
const API_URL =
    trim(import.meta.env.VITE_API_URL) ||
    trim(import.meta.env.VITE_API_GATEWAY_URL) ||
    trim(import.meta.env.VITE_AUTH_SERVICE_URL) ||
    "";

function getToken(): string | null {
    return localStorage.getItem("auth_token");
}

function authHeaders(): HeadersInit {
    let token = getToken();
    if (!token) {
        const mockRole = localStorage.getItem("mockRole");
        const mockUserId = localStorage.getItem("mockUserId");
        if (mockRole) {
            const doc =
                mockUserId && /^\d+$/.test(mockUserId)
                    ? mockUserId
                    : (MOCK_ROLE_DOCUMENTS[mockRole] || "10000001");
            token = generateMockToken(mockRole, doc);
            storeAuthToken(token);
            localStorage.setItem("mockUserId", doc);
        }
    }
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function safeJson<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
        throw new Error(
            `Respuesta inesperada del servidor (${response.status} ${response.statusText}). ` +
            "¿La ruta API está configurada correctamente?"
        );
    }
    try {
        return (await response.json()) as T;
    } catch {
        throw new Error(`Respuesta inválida del servidor (${response.status}). No se pudo parsear JSON.`);
    }
}

async function handleError(response: Response, fallback: string): Promise<never> {
    try {
        const body = await safeJson<Record<string, unknown>>(response);
        const msg =
            (typeof body.message === "string" && body.message) ||
            (typeof body.error === "string" && body.error) ||
            fallback;
        throw new Error(msg);
    } catch {
        throw new Error(fallback);
    }
}

// ─── Auth / Perfil ───

export async function getMe(): Promise<UserProfile> {
    const res = await fetch(`${API_URL}/api/v1/auth/me`, {
        headers: authHeaders(),
    });
    if (!res.ok) await handleError(res, "Error al obtener perfil");
    return safeJson<UserProfile>(res);
}

// ─── MFA ───

export async function setupMFA(): Promise<MFASetupResponse> {
    const res = await fetch(`${API_URL}/api/v1/auth/mfa/setup`, {
        method: "POST",
        headers: authHeaders(),
    });
    if (!res.ok) await handleError(res, "Error al configurar MFA");
    return safeJson<MFASetupResponse>(res);
}

export async function verifyMFA(otpCode: string): Promise<MFAVerifyResponse> {
    const res = await fetch(`${API_URL}/api/v1/auth/mfa/verify`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ otpCode }),
    });
    if (!res.ok) await handleError(res, "Código MFA inválido");
    return safeJson<MFAVerifyResponse>(res);
}

// ─── Bóveda / Ceremonia ───

export async function getVaultStatus(shard: string): Promise<VaultStatus> {
    const res = await fetch(`${API_URL}/api/v1/vault/status`, {
        headers: {
            ...authHeaders(),
            "X-Vault-Shard": shard,
        },
    });
    if (!res.ok) await handleError(res, "Error al consultar bóveda");
    return safeJson<VaultStatus>(res);
}

export async function initiateCeremony(type: string = "APERTURA"): Promise<CeremonyInitResponse> {
    const res = await fetch(`${API_URL}/api/v1/ceremony/initiate`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ type }),
    });
    if (!res.ok) await handleError(res, "Error al iniciar ceremonia");
    return safeJson<CeremonyInitResponse>(res);
}

export async function submitShard(
    ceremonyId: string,
    shardValue: string,
): Promise<ShardSubmissionResponse> {
    const res = await fetch(`${API_URL}/api/v1/ceremony/${ceremonyId}/submit-shard`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ shard_value: shardValue }),
    });
    if (!res.ok) await handleError(res, "Error al presentar shard");
    return safeJson<ShardSubmissionResponse>(res);
}

export async function getCeremonyStatus(ceremonyId: string): Promise<CeremonyStatus> {
    const res = await fetch(`${API_URL}/api/v1/ceremony/${ceremonyId}/status`);
    if (!res.ok) await handleError(res, "Ceremonia no encontrada");
    return safeJson<CeremonyStatus>(res);
}

export async function abortCeremony(ceremonyId: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/v1/ceremony/${ceremonyId}/abort`, {
        method: "POST",
        headers: authHeaders(),
    });
    if (!res.ok) await handleError(res, "Error al abortar ceremonia");
}
