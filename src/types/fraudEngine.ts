// Tipos del motor antifraude -- ConfiguracionEleccion (puerto 8081)

// -- Tipos de regla --

export type RuleType =
    | "FAILED_AUTH_ATTEMPTS"
    | "BIOMETRIC_INCONSISTENCY"
    | "DUPLICATE_VOTE_ATTEMPT"
    | "ANOMALOUS_TIME_PATTERN"
    | "IRREGULAR_TABLE_BEHAVIOR"

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED"

export type AlertSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"

// -- Parameters dinamicos por ruleType --

export interface FailedAuthParams {
    maxFailedAttempts: number
    windowMinutes: number
}

export interface BiometricInconsistencyParams {
    maxInconsistencies: number
    windowHours: number
}

export interface DuplicateVoteParams {
    windowHours: number
}

export interface AnomalousTimeParams {
    maxAuthInWindow: number
    windowSeconds: number
}

export interface IrregularTableParams {
    deviationThreshold: number
    minComparableTables: number
}

export type RuleParameters =
    | FailedAuthParams
    | BiometricInconsistencyParams
    | DuplicateVoteParams
    | AnomalousTimeParams
    | IrregularTableParams

// -- Regla completa (GET) --

export interface FraudRule {
    id: number
    name: string
    ruleType: RuleType
    isActive: boolean
    parameters: Record<string, number>
    alertType: string
    riskScoreWeight: number
    approvalStatus: ApprovalStatus
    createdBy: string
    approvedBy: string | null
    rejectionReason: string | null
    deletedAt: string | null
    createdAt: string
    updatedAt: string
}

// -- Payload de creacion (POST) --

export interface FraudRuleCreatePayload {
    name: string
    ruleType: RuleType
    isActive: boolean
    parameters: Record<string, number>
    alertType: string
    riskScoreWeight: number
}

// -- Payload de edicion (PATCH) --

export interface FraudRulePatchPayload {
    parameters?: Record<string, number>
    riskScoreWeight?: number
    isActive?: boolean
}

// -- Rechazo --

export interface RejectPayload {
    motivo: string
}

// -- Evaluacion --

export interface EventoElectoral {
    tableId: string
    pollingStation: string
    documentId: string
    tipo: string
    exitoso: boolean
    coincidenciaBiometrica: boolean
    timestamp: string
}

export interface EvaluateRequest {
    eventoActual: EventoElectoral
    eventosHistoricos: EventoElectoral[]
    eventosPorMesaDelPuesto: Record<string, EventoElectoral[]>
}

export interface FraudAlert {
    alertType: string
    ruleId: number
    severity: AlertSeverity
    tableId: string
    documentId: string
    timestamp: string
    details: Record<string, unknown>
}

export interface EvaluatedRule {
    ruleId: number
    ruleName: string
    ruleType: string
    disparada: boolean
    puntajeAportado: number
    mensaje: string
}

export interface EvaluateResponse {
    alerts: FraudAlert[]
    totalRiskScore: number
    evaluatedRules: EvaluatedRule[]
}
