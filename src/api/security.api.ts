import type {
    UserProfile,
    MFASetupResponse,
    MFAVerifyResponse,
    CeremonyInitResponse,
    CeremonyStatus,
    VaultStatus,
    ShardSubmissionResponse,
} from "../types/security";

const trim = (v: unknown) => (typeof v === "string" ? v.trim() : "");
// Base vacía = mismo origen (works through Vite proxy/agw or docker gateway)
const API_URL =
    trim(import.meta.env.VITE_AUTH_SERVICE_URL) ||
    trim(import.meta.env.VITE_API_URL) ||
    "";

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

async function handleError(response: Response, fallback: string): Promise<never> {
    try {
        const body = (await response.json()) as Record<string, unknown>;
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
    return res.json();
}

// ─── MFA ───

export async function setupMFA(): Promise<MFASetupResponse> {
    const res = await fetch(`${API_URL}/api/v1/auth/mfa/setup`, {
        method: "POST",
        headers: authHeaders(),
    });
    if (!res.ok) await handleError(res, "Error al configurar MFA");
    return res.json();
}

export async function verifyMFA(otpCode: string): Promise<MFAVerifyResponse> {
    const res = await fetch(`${API_URL}/api/v1/auth/mfa/verify`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ otpCode }),
    });
    if (!res.ok) await handleError(res, "Código MFA inválido");
    return res.json();
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
    return res.json();
}

export async function initiateCeremony(type: string = "APERTURA"): Promise<CeremonyInitResponse> {
    const res = await fetch(`${API_URL}/api/v1/ceremony/initiate`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ type }),
    });
    if (!res.ok) await handleError(res, "Error al iniciar ceremonia");
    return res.json();
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
    return res.json();
}

export async function getCeremonyStatus(ceremonyId: string): Promise<CeremonyStatus> {
    const res = await fetch(`${API_URL}/api/v1/ceremony/${ceremonyId}/status`);
    if (!res.ok) await handleError(res, "Ceremonia no encontrada");
    return res.json();
}

export async function abortCeremony(ceremonyId: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/v1/ceremony/${ceremonyId}/abort`, {
        method: "POST",
        headers: authHeaders(),
    });
    if (!res.ok) await handleError(res, "Error al abortar ceremonia");
}
