// SE-M3-05: tipos de voto asistido. Espejo de los modelos del backend
// election-compute-engine (.NET 8). Sin PII en estructuras de salida.

export type TipoAsistencia =
    | "Discapacidad"
    | "EdadAvanzada"
    | "Analfabetismo"
    | "Otra";

export interface SolicitudAsistencia {
    documentoVotante: string;
    documentoAcompanante: string;
    esFamiliar: boolean;
    tipoAsistencia: TipoAsistencia;
    mesaId: string;
    jornadaId: string;
    juradoId: string;
}

export interface RespuestaAsistencia {
    registroId: string;
    sesionToken: string;
    expiraEn: string;
    tipoAsistencia: TipoAsistencia;
    mensaje: string;
}

export interface ConteoAsistenciasActa {
    mesaId: string;
    totalAsistidos: number;
    porTipo: Partial<Record<TipoAsistencia, number>>;
    totalFamiliares: number;
    totalNoFamiliares: number;
}
