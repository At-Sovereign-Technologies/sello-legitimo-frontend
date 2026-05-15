import type { EstadoAlerta, Severidad } from "../types/fraudeAlerts";

export function severityConfig(level: Severidad) {
  switch (level) {
    case "CRITICAL":
      return {
        label: "Crítico",
        bg: "bg-red-100",
        text: "text-red-800",
        dot: "bg-red-500",
        ring: "ring-red-600/20",
      };
    case "SUSPICIOUS":
      return {
        label: "Sospechoso",
        bg: "bg-amber-100",
        text: "text-amber-800",
        dot: "bg-amber-500",
        ring: "ring-amber-600/20",
      };
    case "INFORMATIONAL":
      return {
        label: "Informativo",
        bg: "bg-blue-100",
        text: "text-blue-800",
        dot: "bg-blue-500",
        ring: "ring-blue-600/20",
      };
  }
}

export function statusConfig(status: EstadoAlerta) {
  switch (status) {
    case "DETECTADO":
      return { label: "Detectado", bg: "bg-yellow-100", text: "text-yellow-800" };
    case "EN_EVALUACION":
      return { label: "En Evaluación", bg: "bg-purple-100", text: "text-purple-800" };
    case "EN_INVESTIGACION":
      return { label: "En Investigación", bg: "bg-blue-100", text: "text-blue-800" };
    case "ESCALADO":
      return { label: "Escalado", bg: "bg-orange-100", text: "text-orange-800" };
    case "CONFIRMADO":
      return { label: "Confirmado", bg: "bg-red-100", text: "text-red-800" };
    case "DESCARTADO":
      return { label: "Descartado", bg: "bg-slate-100", text: "text-slate-600" };
    case "CERRADO":
      return { label: "Cerrado", bg: "bg-slate-200", text: "text-slate-500" };
  }
}

export function riskColor(score: number) {
  if (score >= 66) return "text-red-600";
  if (score >= 31) return "text-amber-600";
  return "text-emerald-600";
}

export function riskBg(score: number) {
  if (score >= 66) return "bg-red-50 border-red-200";
  if (score >= 31) return "bg-amber-50 border-amber-200";
  return "bg-emerald-50 border-emerald-200";
}

export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return "hace unos segundos";
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `hace ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `hace ${diffD}d`;
  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const TIPOLOGIAS: Record<string, string> = {
  AUTH_ANOMALY: "Anomalía de Autenticación",
  BIOMETRIC_MISMATCH: "Discrepancia Biométrica",
  DUPLICATE_VOTE: "Intento de Voto Duplicado",
  BURST_DETECTED: "Ráfaga de Eventos",
  TABLE_OUTLIER: "Mesa con Comportamiento Atípico",
  LB_EMERGENCY_MOD: "Modificación Emergencia Lista Blanca",
  CENSUS_FREEZE_VIOLATION: "Violación de Congelamiento de Censo",
  E14_ANOMALY: "Anomalía en Acta E14",
  AUTH_CHAIN_BREAK: "Rotura de Cadena de Auditoría",
  ACCESS_VIOLATION: "Violación de Acceso",
};

export const TIPOLOGIAS_LIST = Object.entries(TIPOLOGIAS).map(([id, name]) => ({
  id,
  name,
}));

export const MODULOS_ORIGEN = [
  { id: "SE_M1" as const, name: "M1 — Autenticación" },
  { id: "SE_M3" as const, name: "M3 — Voto" },
  { id: "SR_M5" as const, name: "M5 — Escrutinio" },
  { id: "SR_M6" as const, name: "M6 — Transmisión" },
  { id: "M8_05" as const, name: "M8.05 — Fraude" },
];

export function formatModuleName(moduleId: string): string {
  const m = MODULOS_ORIGEN.find((x) => x.id === moduleId);
  return m?.name ?? moduleId;
}

export function typologyName(id: string): string {
  return TIPOLOGIAS[id] ?? id;
}

export function validTransitions(
  status: EstadoAlerta,
): { to: EstadoAlerta; label: string; variant: "primary" | "danger" | "ghost" }[] {
  switch (status) {
    case "DETECTADO":
      return [
        { to: "EN_EVALUACION", label: "Iniciar Evaluación", variant: "primary" },
      ];
    case "EN_EVALUACION":
      return [
        { to: "EN_INVESTIGACION", label: "Pasar a Investigación", variant: "primary" },
        { to: "DESCARTADO", label: "Descartar", variant: "ghost" },
      ];
    case "EN_INVESTIGACION":
      return [
        { to: "ESCALADO", label: "Escalar", variant: "primary" },
        { to: "CONFIRMADO", label: "Confirmar Fraude", variant: "danger" },
        { to: "DESCARTADO", label: "Descartar", variant: "ghost" },
      ];
    case "ESCALADO":
      return [
        { to: "CONFIRMADO", label: "Confirmar Fraude", variant: "danger" },
        { to: "DESCARTADO", label: "Descartar", variant: "ghost" },
      ];
    case "CONFIRMADO":
      return [
        { to: "CERRADO", label: "Cerrar Caso", variant: "primary" },
      ];
    case "DESCARTADO":
      return [
        { to: "CERRADO", label: "Cerrar Caso", variant: "primary" },
      ];
    case "CERRADO":
      return [];
  }
}

export function alertaKey(alerta: { alertUuid: string }): string {
  return alerta.alertUuid.slice(0, 5).toUpperCase();
}

export function needsAttention(alerta: {
  status: EstadoAlerta;
  severityLevel: Severidad;
}): boolean {
  return (alerta.status === "DETECTADO" || alerta.status === "EN_EVALUACION") && alerta.severityLevel === "CRITICAL";
}
