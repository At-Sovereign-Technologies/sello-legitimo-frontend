import { useState, useEffect, useRef } from "react";
import { X, User, FileText, Hash, Radio, Fingerprint, CheckCircle } from "lucide-react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  ActualizarEstadoRequest,
  AlertasFilterParams,
  EstadoAlerta,
  CerrarCasoRequest,
  ResultadoFinal,
} from "../../types/fraudeAlerts";
import {
  obtenerAlerta,
  actualizarEstadoAlerta,
  cerrarCaso,
  obtenerCierreCaso,
  confirmarEntregaNotificacion,
} from "../../api/fraudeAlerts.api";
import AlertaSeveridad from "./AlertaSeveridad";
import AlertaEstado from "./AlertaEstado";
import PuntajeRiesgo from "./PuntajeRiesgo";
import LineaTiempo from "./LineaTiempo";
import {
  validTransitions,
  formatModuleName,
  riskBg,
  formatTimestamp,
  typologyName,
} from "../../utils/fraudeAlerts";

interface Props {
  alertaUuid: string;
  onClose: () => void;
  filters: AlertasFilterParams;
}

type ClosureStep = "idle" | "form" | "submitting" | "done";

export default function PanelDetalle({ alertaUuid, onClose, filters }: Props) {
  const [notes, setNotes] = useState("");
  const [assignee, setAssignee] = useState("");
  const [closureStep, setClosureStep] = useState<ClosureStep>("idle");
  const [finalResult, setFinalResult] = useState<ResultadoFinal>("CONFIRMED_FRAUD");
  const [justification, setJustification] = useState("");
  const [actions, setActions] = useState<string[]>([""]);
  const [responsibleEntity, setResponsibleEntity] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: alerta, isLoading } = useQuery({
    queryKey: ["fraude", "alerta", alertaUuid],
    queryFn: () => obtenerAlerta(alertaUuid),
  });

  const { data: cierre } = useQuery({
    queryKey: ["fraude", "cierre", alertaUuid],
    queryFn: () => obtenerCierreCaso(alertaUuid),
    enabled: alerta?.status === "CERRADO",
  });

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: ({
      uuid,
      body,
    }: {
      uuid: string;
      body: ActualizarEstadoRequest;
    }) => actualizarEstadoAlerta(uuid, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fraude", "alertas", filters] });
      queryClient.invalidateQueries({ queryKey: ["fraude", "metricas"] });
      queryClient.invalidateQueries({ queryKey: ["fraude", "alerta", alertaUuid] });
    },
  });

  const { mutate: submitClosure, isPending: isClosing } = useMutation({
    mutationFn: ({
      uuid,
      body,
    }: {
      uuid: string;
      body: CerrarCasoRequest;
    }) => cerrarCaso(uuid, body),
    onSuccess: () => {
      setClosureStep("done");
      queryClient.invalidateQueries({ queryKey: ["fraude", "alertas", filters] });
      queryClient.invalidateQueries({ queryKey: ["fraude", "metricas"] });
      queryClient.invalidateQueries({ queryKey: ["fraude", "alerta", alertaUuid] });
      queryClient.invalidateQueries({ queryKey: ["fraude", "cierre", alertaUuid] });
      confirmarEntregaNotificacion(0, "FRAUD_ANALYST").catch(() => {});
    },
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    if (alerta) {
      setNotes("");
      setAssignee("");
      setClosureStep("idle");
    }
  }, [alerta?.alertUuid]);

  if (isLoading || !alerta) return null;

  const src = alerta.sourceReference;
  const loc = alerta.logicalLocation;
  const transitions = validTransitions(alerta.status);
  const currentUuid = alerta.alertUuid;

  function handleTransition(to: EstadoAlerta) {
    if (to === "CERRADO") {
      setClosureStep("form");
      return;
    }
    const body: ActualizarEstadoRequest = {
      status: to,
      resolutionNotes: notes.trim() || undefined,
      assignedTo: assignee.trim() || undefined,
    };
    updateStatus({ uuid: currentUuid, body });
  }

  function handleSubmitClosure() {
    const validActions = actions.filter((a) => a.trim().length > 0);
    if (!justification.trim() || validActions.length === 0 || !responsibleEntity.trim()) return;
    submitClosure({
      uuid: currentUuid,
      body: {
        finalResult,
        justification: justification.trim(),
        institutionalActions: validActions,
        responsibleEntity: responsibleEntity.trim(),
      },
    });
  }

  function addAction() {
    setActions((prev) => [...prev, ""]);
  }

  function removeAction(i: number) {
    setActions((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateAction(i: number, val: string) {
    setActions((prev) => {
      const next = [...prev];
      next[i] = val;
      return next;
    });
  }

  return (
    <>
      <div
        className="fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="fixed inset-y-0 right-0 z-40 w-full max-w-xl translate-x-0 border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-medium text-slate-400">
                #{alerta.alertUuid.slice(0, 8).toUpperCase()}
              </span>
              <AlertaSeveridad level={alerta.severityLevel} />
              <AlertaEstado status={alerta.status} />
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="space-y-6 p-5">
              <div className={`rounded-lg border p-4 ${riskBg(alerta.riskScore)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Tipología</p>
                    <p className="mt-0.5 text-lg font-semibold text-slate-900">
                      {typologyName(alerta.typologyId)}
                    </p>
                    <p className="text-xs text-slate-500">ID: {alerta.typologyId}</p>
                  </div>
                  <PuntajeRiesgo score={alerta.riskScore} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <p className="flex items-center gap-1 text-xs font-medium text-slate-500">
                      <Radio size={11} /> Módulo Origen
                    </p>
                    <p className="text-sm text-slate-900">
                      {formatModuleName(src?.originModule ?? "")}
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1 text-xs font-medium text-slate-500">
                      <Hash size={11} /> Evento Origen
                    </p>
                    <p className="font-mono text-xs text-slate-700">{src?.originEventId}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1 text-xs font-medium text-slate-500">
                      <Fingerprint size={11} /> Canal
                    </p>
                    <p className="text-sm capitalize text-slate-900">
                      {loc?.channel === "REMOTE"
                        ? "Remoto"
                        : loc?.channel === "PRESENCIAL"
                          ? "Presencial"
                          : "Desconocido"}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {loc?.pollingStation && (
                    <div>
                      <p className="text-xs font-medium text-slate-500">Mesa</p>
                      <p className="text-sm text-slate-900">{loc.pollingStation}</p>
                    </div>
                  )}
                  {loc?.constituency && (
                    <div>
                      <p className="text-xs font-medium text-slate-500">Circunscripción</p>
                      <p className="text-sm text-slate-900">{loc.constituency}</p>
                    </div>
                  )}
                  {loc?.tableId && (
                    <div>
                      <p className="text-xs font-medium text-slate-500">ID Mesa</p>
                      <p className="text-sm text-slate-900">{loc.tableId}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium text-slate-500">Score Source</p>
                    <p className="text-sm text-slate-900">{alerta.riskScoreSource}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
                <p className="text-xs font-semibold text-slate-500">Referencia de Origen</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Hash:</span>
                    <code className="ml-1 font-mono text-[10px] text-slate-700 break-all">
                      {src?.verificationHash?.slice(0, 24)}...
                    </code>
                  </div>
                  <div>
                    <span className="text-slate-400">Certificado:</span>
                    <span className="ml-1 text-slate-700">
                      {src?.certifiedTimestamp
                        ? formatTimestamp(src.certifiedTimestamp)
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {alerta.contextMetadata &&
                Object.keys(alerta.contextMetadata).length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-slate-500">
                      Metadatos Contextuales
                    </p>
                    <pre className="max-h-48 overflow-auto rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-600">
                      {JSON.stringify(alerta.contextMetadata, null, 2)}
                    </pre>
                  </div>
                )}

              <LineaTiempo alerta={alerta} />

              {cierre && alerta.status === "CERRADO" && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-emerald-600" />
                    <p className="text-sm font-semibold text-emerald-800">Caso Cerrado</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-emerald-600 font-medium">Resultado:</span>
                      <p className="text-emerald-900 font-semibold">{cierre.finalResult === "CONFIRMED_FRAUD" ? "Fraude Confirmado" : "Desestimado"}</p>
                    </div>
                    <div>
                      <span className="text-emerald-600 font-medium">Entidad Responsable:</span>
                      <p className="text-emerald-900">{cierre.responsibleEntity}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-emerald-600 font-medium">Justificación:</span>
                      <p className="text-emerald-900 mt-0.5">{cierre.justification}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-emerald-600 font-medium">Acciones:</span>
                      <ul className="list-disc list-inside mt-0.5 text-emerald-900">
                        {cierre.institutionalActions.map((a, i) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="text-emerald-600 font-medium">Cerrado por:</span>
                      <p className="text-emerald-900">{cierre.actorId} ({cierre.actorRole})</p>
                    </div>
                    <div>
                      <span className="text-emerald-600 font-medium">Fecha:</span>
                      <p className="text-emerald-900">{formatTimestamp(cierre.closureTimestamp)}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-emerald-600 font-medium">Firma HMAC:</span>
                      <code className="block mt-0.5 font-mono text-[10px] text-emerald-700 break-all">
                        {cierre.signature}
                      </code>
                    </div>
                  </div>
                </div>
              )}

              {closureStep === "form" && alerta.status !== "CERRADO" && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-4">
                  <p className="text-sm font-semibold text-amber-800">Formulario de Cierre de Caso</p>

                  <div>
                    <label className="block text-xs font-medium text-amber-700 mb-1">Resultado Final</label>
                    <select
                      value={finalResult}
                      onChange={(e) => setFinalResult(e.target.value as ResultadoFinal)}
                      className="w-full rounded-lg border border-amber-300 px-3 py-1.5 text-sm bg-white"
                    >
                      <option value="CONFIRMED_FRAUD">Fraude Confirmado</option>
                      <option value="DISMISSED">Desestimado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-amber-700 mb-1">Justificación Detallada</label>
                    <textarea
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                      rows={3}
                      placeholder="Describa las razones del cierre..."
                      className="w-full rounded-lg border border-amber-300 px-3 py-1.5 text-sm resize-none bg-white"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-amber-700">Acciones Institucionales</label>
                      <button
                        type="button"
                        onClick={addAction}
                        className="text-xs text-amber-700 hover:text-amber-900 font-medium"
                      >
                        + Agregar
                      </button>
                    </div>
                    <div className="space-y-2">
                      {actions.map((a, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            type="text"
                            value={a}
                            onChange={(e) => updateAction(i, e.target.value)}
                            placeholder="Describa la accion..."
                            className="flex-1 rounded-lg border border-amber-300 px-3 py-1.5 text-sm bg-white"
                          />
                          {actions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeAction(i)}
                              className="text-red-500 hover:text-red-700 text-xs px-1"
                            >
                              X
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-amber-700 mb-1">Entidad Responsable</label>
                    <input
                      type="text"
                      value={responsibleEntity}
                      onChange={(e) => setResponsibleEntity(e.target.value)}
                      placeholder="Ej: Registraduria Nacional - Delegacion"
                      className="w-full rounded-lg border border-amber-300 px-3 py-1.5 text-sm bg-white"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSubmitClosure}
                      disabled={isClosing || !justification.trim() || actions.filter(a => a.trim()).length === 0 || !responsibleEntity.trim()}
                      className="flex-1 rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800 disabled:opacity-50"
                    >
                      {isClosing ? "Cerrando..." : "Confirmar Cierre"}
                    </button>
                    <button
                      onClick={() => setClosureStep("idle")}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {closureStep === "done" && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={18} className="text-emerald-600" />
                    <p className="text-sm font-semibold text-emerald-800">
                      Caso cerrado exitosamente
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-emerald-600">
                    El registro de cierre ha sido firmado y persistido de forma inmutable.
                  </p>
                </div>
              )}

              {alerta.status !== "CERRADO" && closureStep === "idle" && (
                <div className="space-y-3">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <User size={12} />
                      Asignado a
                    </label>
                    <input
                      type="text"
                      value={assignee}
                      onChange={(e) => setAssignee(e.target.value)}
                      placeholder="Nombre del analista..."
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm transition-colors placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <FileText size={12} />
                      Notas de Resolución
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Anotaciones, hallazgos, evidencia..."
                      className="mt-1 w-full resize-none rounded-lg border border-slate-300 px-3 py-1.5 text-sm transition-colors placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {transitions.length > 0 && closureStep === "idle" && alerta.status !== "CERRADO" && (
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-4">
              {transitions.map((t) => (
                <button
                  key={t.to}
                  onClick={() => handleTransition(t.to)}
                  disabled={isPending}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 ${
                    t.variant === "danger"
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : t.variant === "primary"
                        ? "bg-slate-900 text-white hover:bg-slate-800"
                        : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {isPending ? "Procesando..." : t.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
