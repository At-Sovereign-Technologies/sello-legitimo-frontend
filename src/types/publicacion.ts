// ── Publicación Electoral — Tipos estrictos ─────────────────────────────────
// Cada interfaz refleja exactamente la forma del payload del backend.
// ParticipacionPayload NO declara campos opcionales de resultados:
// la ausencia de campo es la garantía de que el componente nunca los renderice.

export interface ParticipacionPayload {
    totalSufragantes: number;
    porcentajeSobreCenso: number;
    timestampActualizacion: string; // ISO 8601
    fuente: string;
}

export interface ResultadosPayload extends ParticipacionPayload {
    advertencia: string;
    numeroDiaJornada: number;
    timestampCierreDelDia: string; // ISO 8601
}

export interface EstadoMotorPayload {
    estado: 'JORNADA_ACTIVA' | 'JORNADA_CERRADA_DIA';
    timestampUltimaVerificacionSrM1: string; // ISO 8601
    falloSeguroActivo: boolean;
}

export interface ErrorResultadosPayload {
    error: string;
    mensaje: string;
}

export type EstadoMotor = 'JORNADA_ACTIVA' | 'JORNADA_CERRADA_DIA' | null;

export type ErrorResultados =
    | 'RESULTADOS_NO_DISPONIBLES_EN_JORNADA_ACTIVA'
    | 'ERROR_RED'
    | null;

export interface MotorPublicacionState {
    estadoMotor: EstadoMotor;
    falloSeguroActivo: boolean;
    participacion: ParticipacionPayload | null;
    resultados: ResultadosPayload | null;
    errorParticipacion: string | null;
    errorResultados: ErrorResultados;
    cargandoParticipacion: boolean;
    cargandoResultados: boolean;
    ultimaActualizacion: Date | null;
}
