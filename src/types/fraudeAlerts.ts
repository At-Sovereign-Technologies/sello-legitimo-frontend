export type Severidad = "INFORMATIONAL" | "SUSPICIOUS" | "CRITICAL";
export type EstadoAlerta =
  | "DETECTADO"
  | "EN_EVALUACION"
  | "EN_INVESTIGACION"
  | "ESCALADO"
  | "CONFIRMADO"
  | "DESCARTADO"
  | "CERRADO";
export type Canal = "REMOTE" | "PRESENCIAL" | "UNKNOWN";
export type FuenteOrigen = "SE_M1" | "SE_M3" | "SR_M5" | "SR_M6" | "M8_05";

export interface SourceReference {
  originEventId: string;
  verificationHash: string;
  certifiedTimestamp: string;
  originModule: string;
}

export interface LogicalLocationBackend {
  tableId: string | null;
  pollingStation: string | null;
  constituency: string | null;
  channel: string | null;
}

export interface AlertaFraude {
  alertUuid: string;
  typologyId: string;
  severityLevel: Severidad;
  riskScore: number;
  riskScoreSource: string;
  status: EstadoAlerta;
  sourceReference: SourceReference;
  logicalLocation: LogicalLocationBackend;
  contextMetadata: Record<string, unknown> | null;
  createdAt: string;
  closedAt: string | null;
  closedBy: string | null;
  lastActorId: string | null;
  lastTransitionAt: string | null;
}

export interface MetricasAlertas {
  totalAlerts: number;
  bySeverity: Record<string, number>;
  byStatus: Record<string, number>;
  byTypology: Record<string, number>;
}

export interface ActualizarEstadoRequest {
  status: EstadoAlerta;
  assignedTo?: string;
  resolutionNotes?: string;
  actorId?: string;
}

export interface AlertasFilterParams {
  status?: EstadoAlerta;
  severity?: Severidad;
  typologyId?: string;
  originModule?: string;
  search?: string;
  page?: number;
  size?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ReportarEventoRequest {
  source: string;
  eventType: string;
  originEventId: string;
  verificationHash: string;
  certifiedTimestamp: string;
  logicalLocation?: {
    tableId?: string;
    pollingStation?: string;
    constituency?: string;
    channel?: string;
  };
  metadata?: Record<string, unknown>;
}

export interface Tipologia {
  id: string;
  name: string;
  description: string | null;
  defaultSeverity: Severidad;
  requiresReview: boolean;
  createdAt: string;
  updatedAt: string | null;
  version: number;
}

export interface CrearTipologiaRequest {
  id: string;
  name: string;
  description?: string;
  defaultSeverity: Severidad;
  requiresReview?: boolean;
  justification?: string;
}

export interface EvidenciaReferencia {
  id: string;
  alertUuid: string;
  referenceId: string;
  hashSignature: string;
  originalTimestamp: string;
  verified: boolean;
  verifiedAt: string | null;
  createdAt: string;
}

export interface CrearEvidenciaRequest {
  alertUuid: string;
  referenceId: string;
  hashSignature: string;
  originalTimestamp: string;
}

export interface SubirDocumentoResponse {
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  mockUrl: string;
}


export type ResultadoFinal = "CONFIRMED_FRAUD" | "DISMISSED";

export interface CerrarCasoRequest {
  finalResult: ResultadoFinal;
  justification: string;
  institutionalActions: string[];
  responsibleEntity: string;
}

export interface CierreCasoResponse {
  alertUuid: string;
  finalResult: string;
  justification: string;
  institutionalActions: string[];
  responsibleEntity: string;
  actorId: string;
  actorRole: string;
  closureTimestamp: string;
  signature: string;
}

export interface ZonaMetrica {
  zona: string;
  activeAlerts: number;
  suppressed: boolean;
}

export interface AlertasPorZonaResponse {
  zonas: ZonaMetrica[];
}

export interface EstadoMetrica {
  status: string;
  count: number;
  suppressed: boolean;
}

export interface CasosPorEstadoResponse {
  estados: EstadoMetrica[];
}

export interface CeldaRiesgo {
  zona: string;
  averageRiskScore: number;
  alertCount: number;
  suppressed: boolean;
}

export interface MapaRiesgoResponse {
  celdas: CeldaRiesgo[];
}

export interface DistritoTipologiaMetrica {
  distrito: string;
  typologyId: string;
  count: number;
  suppressed: boolean;
}

export interface TipologiasPorDistritoResponse {
  distritos: DistritoTipologiaMetrica[];
}

export interface AuditEntryResponse {
  id: number;
  alertUuid: string;
  actorId: string;
  role: string;
  fromStatus: string;
  toStatus: string;
  transitionTimestamp: string;
  recordHash: string;
  previousHash: string;
  closureUuid: string | null;
}

export interface DossierAuditorResponse {
  electionStatus: string;
  totalClosedCases: number;
  confirmedFraudCount: number;
  dismissedCount: number;
  closures: CierreCasoResponse[];
  auditChain: AuditEntryResponse[];
  chainIntegrityVerified: boolean;
}

export interface CadenaVerificacionResponse {
  chainIntegrityVerified: boolean;
  status: string;
}
