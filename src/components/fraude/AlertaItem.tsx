import { AlertCircle, MapPin, Radio } from "lucide-react";
import type { AlertaFraude } from "../../types/fraudeAlerts";
import AlertaSeveridad from "./AlertaSeveridad";
import AlertaEstado from "./AlertaEstado";
import PuntajeRiesgo from "./PuntajeRiesgo";
import {
  alertaKey,
  formatTimestamp,
  formatModuleName,
  needsAttention,
  typologyName,
} from "../../utils/fraudeAlerts";

interface Props {
  alerta: AlertaFraude;
  selected: boolean;
  onSelect: () => void;
}

export default function AlertaItem({ alerta, selected, onSelect }: Props) {
  const urgent = needsAttention(alerta);
  const src = alerta.sourceReference;
  const loc = alerta.logicalLocation;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative w-full text-left transition-all duration-150 ${
        selected
          ? "border-l-4 border-l-slate-900 bg-slate-50 shadow-xs"
          : "border-l-4 border-l-transparent hover:bg-slate-50"
      } ${urgent ? "bg-red-50/30" : ""}`}
    >
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {urgent && (
                <AlertCircle size={14} className="shrink-0 text-red-500" />
              )}
              <span className="font-mono text-xs font-medium text-slate-400">
                #{alertaKey(alerta)} — {alerta.alertUuid.slice(0, 8)}...
              </span>
              <AlertaSeveridad level={alerta.severityLevel} />
              <AlertaEstado status={alerta.status} />
            </div>

            <div className="mt-1.5 flex items-center gap-4 text-sm text-slate-600">
              <span className="font-medium text-slate-900">
                {typologyName(alerta.typologyId)}
              </span>
              {loc?.pollingStation && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <MapPin size={12} />
                  Mesa {loc.pollingStation}
                </span>
              )}
              {src?.originModule && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <Radio size={12} />
                  {formatModuleName(src.originModule)}
                </span>
              )}
            </div>

            <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
              <span>{formatTimestamp(alerta.createdAt)}</span>
              {loc?.channel && (
                <span>
                  {loc.channel === "REMOTE"
                    ? "Remoto"
                    : loc.channel === "PRESENCIAL"
                      ? "Presencial"
                      : "Desconocido"}
                </span>
              )}
              {src?.originEventId && (
                <span className="font-mono text-[10px]">
                  ID: {src.originEventId.slice(0, 16)}...
                </span>
              )}
            </div>
          </div>

          <div className="shrink-0 pt-1">
            <PuntajeRiesgo score={alerta.riskScore} compact />
          </div>
        </div>
      </div>
    </button>
  );
}
