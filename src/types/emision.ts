// Tipos para emisión de voto (SE-M3-01 presencial, SE-M3-02 remoto).
// Espejo de los modelos del backend election-compute-engine (.NET 8).

export type CanalVoto = "Presencial" | "Remoto";

export interface EmisionVoto {
    votanteId: string;
    canal: CanalVoto;
    circunscripcionId: string;
    handshakeId?: string | null;
    preferencias: Record<string, number>;
    enBlanco: boolean;
    // SE-M3-05: token de sesión asistida (firmado RSA-PSS por el backend).
    tokenAsistencia?: string | null;
}

export interface ComprobanteVoto {
    custodyId: string;
    numeroConfirmacion: string;
    hashVoto: string;
    timestamp: string;
    canal: CanalVoto;
    firmaDigital: string;
    vvpatBase64?: string | null;
    emailDestino?: string | null;
    // SE-M3-05: marca el voto como asistido. RegistroAsistenciaId es la
    // referencia anonima al registro (no expone documentos).
    votoAsistido?: boolean;
    registroAsistenciaId?: string | null;
}

export interface EmisionVotoRemotoRequest {
    emision: EmisionVoto;
    emailDestino: string;
}
