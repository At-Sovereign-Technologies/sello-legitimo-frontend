export interface UserProfile {
    numeroDocumento: string;
    nombre: string;
    telefono: string;
    correo: string;
    rol: string;
    mfaEnabled: boolean;
    mfaMethod: string;
}

export interface MFASetupResponse {
    secret: string;
    qrCodeUri: string;
    message: string;
}

export interface MFAVerifyResponse {
    success: boolean;
    token?: string;
    message?: string;
}

export interface CeremonyInitResponse {
    ceremonyId: string;
    status: string;
    requiredShards: number;
    submittedShards: number;
    expiresAt: string;
}

export interface CeremonyStatus {
    ceremonyId: string;
    type: string;
    status: string;
    requiredShards: number;
    submittedShards: number;
    progress: string;
    activatedAt: string | null;
    expiresAt: string;
    expired: boolean;
}

export interface VaultStatus {
    status: string;
    message: string;
    vaultAccess: boolean;
}

export interface ShardSubmissionResponse {
    ceremonyId: string;
    status: string;
    requiredShards: number;
    submittedShards: number;
    activatedAt: string | null;
    expiresAt: string;
}
