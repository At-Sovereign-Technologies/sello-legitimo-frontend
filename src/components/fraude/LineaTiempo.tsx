import { Clock, Search, AlertTriangle, XCircle, Shield } from "lucide-react";
import type { AlertaFraude, EstadoAlerta } from "../../types/fraudeAlerts";
import { formatTimestamp } from "../../utils/fraudeAlerts";

const isInvestigation = (s: EstadoAlerta) =>
  s === "EN_EVALUACION" || s === "EN_INVESTIGACION" || s === "ESCALADO";
const isResolved = (s: EstadoAlerta) =>
  s === "CONFIRMADO" || s === "DESCARTADO" || s === "CERRADO";

export default function LineaTiempo({ alerta }: { alerta: AlertaFraude }) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Línea de Tiempo
      </h4>
      <div className="relative">
        <div className="relative flex gap-3 pb-4">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white">
            <Clock size={12} />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-slate-900">
              Alerta creada
            </p>
            <p className="text-xs text-slate-400">
              {formatTimestamp(alerta.createdAt)}
            </p>
          </div>
        </div>

        <div className="relative flex gap-3 pb-4">
          <div className="absolute left-[11px] top-0 h-full w-px bg-slate-200" />
          <div
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
              isInvestigation(alerta.status)
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-300"
            }`}
          >
            <Search size={12} />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p
              className={`text-sm font-medium ${
                isInvestigation(alerta.status)
                  ? "text-slate-900"
                  : "text-slate-400"
              }`}
            >
              En investigación
            </p>
            <p className="text-xs text-slate-400">
              {alerta.status === "DETECTADO"
                ? "Pendiente"
                : "Estado actual: " + alerta.status}
            </p>
          </div>
        </div>

        <div className="relative flex gap-3">
          {isResolved(alerta.status) && (
            <div className="absolute left-[11px] top-0 h-full w-px bg-slate-200" />
          )}
          <div
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
              isResolved(alerta.status)
                ? alerta.status === "CONFIRMADO"
                  ? "bg-red-600 text-white"
                  : "bg-slate-500 text-white"
                : "bg-slate-100 text-slate-300"
            }`}
          >
            {alerta.status === "CONFIRMADO" ? (
              <AlertTriangle size={12} />
            ) : alerta.status === "DESCARTADO" ? (
              <XCircle size={12} />
            ) : alerta.status === "CERRADO" ? (
              <Shield size={12} />
            ) : (
              <AlertTriangle size={12} />
            )}
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p
              className={`text-sm font-medium ${
                isResolved(alerta.status)
                  ? "text-slate-900"
                  : "text-slate-400"
              }`}
            >
              {alerta.status === "CONFIRMADO"
                ? "Fraude confirmado"
                : alerta.status === "DESCARTADO"
                  ? "Alerta descartada"
                  : alerta.status === "CERRADO"
                    ? "Caso cerrado"
                    : "Resolución"}
            </p>
            <p className="text-xs text-slate-400">
              {alerta.status === "CONFIRMADO"
                ? "Confirmado"
                : alerta.status === "DESCARTADO"
                  ? "Descartado"
                  : alerta.status === "CERRADO"
                    ? "Cerrado"
                    : "Pendiente"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
