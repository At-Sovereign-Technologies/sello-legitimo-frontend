const trim = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const API_URL =
    trim(import.meta.env.VITE_GESTION_PRE_ELECTORAL_URL) ||
    trim(import.meta.env.VITE_API_URL) ||
    "";

export interface AuditEvent {
    eventId: string;
    actorId: string;
    action: string;
    entityType: string;
    entityId: string;
    timestampNtp: string;
    ipAddress: string | null;
    deviceId: string | null;
    payloadHash: string;
    previousHash: string | null;
    chainHash: string;
}

interface BackendChainIntegrity {
    valida: boolean;
    totalRegistros: number;
    registrosVerificados: number;
    primerRegistroFallidoId: number | null;
    mensajeError?: string;
}

export interface AuditChainIntegrity {
    isValid: boolean;
    totalRecords: number;
    invalidRecords: number;
    errorMessage?: string;
    errorMessages?: string[];
}

export const getAuditLog = async (
    page: number = 0,
    size: number = 20,
): Promise<{ content: AuditEvent[]; totalElements: number; totalPages: number }> => {
    const res = await fetch(`${API_URL}/api/auditoria?page=${page}&size=${size}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        throw new Error(`Error fetching audit log: ${res.status}`);
    }

    return res.json();
};

export const verifyAuditChainIntegrity = async (): Promise<AuditChainIntegrity> => {
    const res = await fetch(`${API_URL}/api/auditoria/verificar-cadena`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        throw new Error(`Error verifying audit chain: ${res.status}`);
    }

    const data: BackendChainIntegrity = await res.json();
    return {
        isValid: data.valida,
        totalRecords: data.totalRegistros,
        invalidRecords: data.registrosVerificados,
        errorMessage: data.mensajeError,
        errorMessages: data.mensajeError ? [data.mensajeError] : undefined,
    };
};

export const getActaTimeline = async (
    actaUuid: string,
): Promise<{ events: AuditEvent[] }> => {
    const res = await fetch(`${API_URL}/api/actas/${actaUuid}/timeline`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        throw new Error(`Error fetching timeline: ${res.status}`);
    }

    return res.json();
};

export interface ActaLifecycleEvent {
    uuid: string;
    actaUuid: string;
    versionNumber: number;
    previousVersionId: string | null;
    estado: string;
    timestampNtp: string;
    actorId: string;
    deviceId: string;
    documentSha256: string | null;
    authorizationRef: string | null;
    metadata: string | null;
}

export const getActaE14Timeline = async (
    uuid: string,
): Promise<ActaLifecycleEvent[]> => {
    const res = await fetch(`${API_URL}/api/actas/${uuid}/timeline`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        throw new Error(`Error fetching timeline: ${res.status}`);
    }

    return res.json();
};

export const getActaE14Versions = async (
    uuid: string,
): Promise<ActaLifecycleEvent[]> => {
    const res = await fetch(`${API_URL}/api/actas/${uuid}/versions`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        throw new Error(`Error fetching versions: ${res.status}`);
    }

    return res.json();
};

export interface ActaVerification {
    isValid: boolean;
    currentHash: string | null;
    expectedHash: string | null;
    verifiedAt: string | null;
    errors: string[];
}

export const verifyActaE14 = async (uuid: string): Promise<ActaVerification> => {
    const res = await fetch(`${API_URL}/api/actas/${uuid}/verificar`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        throw new Error(`Error verifying Acta: ${res.status}`);
    }

    const data = await res.json();
    const errorMessages = (data.errores || []).map((err: { versionNumber: number; mensaje: string }) =>
        err.mensaje ? `v${err.versionNumber}: ${err.mensaje}` : err.mensaje
    );
    return {
        isValid: data.valida,
        currentHash: data.hashActual,
        expectedHash: data.hashEsperado,
        verifiedAt: data.verificadoEn,
        errors: errorMessages,
    };
};