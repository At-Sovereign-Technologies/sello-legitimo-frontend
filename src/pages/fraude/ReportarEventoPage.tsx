import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Send,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { reportarEvento } from "../../api/fraudeAlerts.api";
import type {
  ReportarEventoRequest,
  AlertaFraude,
} from "../../types/fraudeAlerts";
import { MODULOS_ORIGEN } from "../../utils/fraudeAlerts";
import NavegacionFraude from "../../components/fraude/NavegacionFraude";
import AlertaSeveridad from "../../components/fraude/AlertaSeveridad";
import AlertaEstado from "../../components/fraude/AlertaEstado";
import PuntajeRiesgo from "../../components/fraude/PuntajeRiesgo";

interface MetadataPair {
  key: string;
  value: string;
}

export default function ReportarEventoPage() {
  const navigate = useNavigate();

  const [source, setSource] = useState("");
  const [eventType, setEventType] = useState("");
  const [originEventId, setOriginEventId] = useState("");
  const [verificationHash, setVerificationHash] = useState("");
  const [certifiedTimestamp, setCertifiedTimestamp] = useState("");
  const [tableId, setTableId] = useState("");
  const [pollingStation, setPollingStation] = useState("");
  const [constituency, setConstituency] = useState("");
  const [channel, setChannel] = useState("");
  const [metadataPairs, setMetadataPairs] = useState<MetadataPair[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AlertaFraude | null>(null);

  function addMetadataPair() {
    setMetadataPairs([...metadataPairs, { key: "", value: "" }]);
  }

  function updateMetadataPair(index: number, field: "key" | "value", val: string) {
    const updated = metadataPairs.map((pair, i) =>
      i === index ? { ...pair, [field]: val } : pair,
    );
    setMetadataPairs(updated);
  }

  function removeMetadataPair(index: number) {
    setMetadataPairs(metadataPairs.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setResult(null);

    const metadata: Record<string, unknown> = {};
    for (const pair of metadataPairs) {
      if (pair.key.trim()) {
        const numVal = Number(pair.value);
        metadata[pair.key.trim()] = isNaN(numVal) ? pair.value : numVal;
      }
    }

    const ts = certifiedTimestamp
      ? new Date(certifiedTimestamp).toISOString()
      : new Date().toISOString();

    const body: ReportarEventoRequest = {
      source,
      eventType,
      originEventId,
      verificationHash,
      certifiedTimestamp: ts,
      logicalLocation: {
        tableId: tableId || undefined,
        pollingStation: pollingStation || undefined,
        constituency: constituency || undefined,
        channel: channel || undefined,
      },
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    };

    try {
      const data = await reportarEvento(body);
      setResult(data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error al reportar el evento";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-slate-50 h-full">

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <NavegacionFraude />

        {result ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle size={20} />
                <span className="font-semibold">
                  Evento procesado exitosamente
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-bold text-slate-900">
                    #{result.alertUuid.slice(0, 8).toUpperCase()}
                  </span>
                  <AlertaSeveridad level={result.severityLevel} />
                  <AlertaEstado status={result.status} />
                </div>
                <PuntajeRiesgo score={result.riskScore} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-500">Tipología:</span>{" "}
                  <span className="font-medium">{result.typologyId}</span>
                </div>
                <div>
                  <span className="text-slate-500">Módulo:</span>{" "}
                  <span className="font-medium">
                    {result.sourceReference?.originModule}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Evento:</span>{" "}
                  <span className="font-mono text-xs">
                    {result.sourceReference?.originEventId}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Score Source:</span>{" "}
                  <span>{result.riskScoreSource}</span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => navigate("/fraude/alertas")}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Ver en Centro de Investigación
                </button>
                <button
                  onClick={() => {
                    setResult(null);
                    setSource("");
                    setEventType("");
                    setOriginEventId("");
                    setVerificationHash("");
                    setCertifiedTimestamp("");
                    setTableId("");
                    setPollingStation("");
                    setConstituency("");
                    setChannel("");
                    setMetadataPairs([]);
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Reportar otro evento
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
                Datos del Evento
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-500">
                    Módulo Origen
                  </label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
                    required
                  >
                    <option value="">Seleccione un módulo</option>
                    {MODULOS_ORIGEN.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-500">
                    Tipo de Evento
                  </label>
                  <input
                    type="text"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    placeholder="ej: LOGIN_FAILED"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-500">
                    ID Evento Origen
                  </label>
                  <input
                    type="text"
                    value={originEventId}
                    onChange={(e) => setOriginEventId(e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    placeholder="ej: EVT-001-2024"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-500">
                    Timestamp Certificado
                  </label>
                  <input
                    type="datetime-local"
                    value={certifiedTimestamp}
                    onChange={(e) => setCertifiedTimestamp(e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    required
                  />
                </div>

                <div className="col-span-2 flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-500">
                    Hash de Verificación (SHA-256)
                  </label>
                  <input
                    type="text"
                    value={verificationHash}
                    onChange={(e) => setVerificationHash(e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs"
                    placeholder="Hash SHA-256 en hexadecimal (64 caracteres)"
                    pattern="^[a-f0-9]{64}$"
                    required
                  />
                  <p className="text-[10px] text-slate-400">
                    SHA-256 de:{" "}
                    <code className="bg-slate-100 px-1">
                      originEventId|certifiedTimestamp|source|eventType
                    </code>
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
                Ubicación Lógica
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-500">
                    Mesa
                  </label>
                  <input
                    type="text"
                    value={tableId}
                    onChange={(e) => setTableId(e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    placeholder="MESA-001"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-500">
                    Puesto de Votación
                  </label>
                  <input
                    type="text"
                    value={pollingStation}
                    onChange={(e) => setPollingStation(e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    placeholder="PUESTO-001"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-500">
                    Circunscripción
                  </label>
                  <input
                    type="text"
                    value={constituency}
                    onChange={(e) => setConstituency(e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    placeholder="CIRC-01"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-500">
                    Canal
                  </label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
                  >
                    <option value="">Sin especificar</option>
                    <option value="REMOTE">Remoto</option>
                    <option value="PRESENCIAL">Presencial</option>
                    <option value="UNKNOWN">Desconocido</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Metadatos
                </h2>
                <button
                  type="button"
                  onClick={addMetadataPair}
                  className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700"
                >
                  <Plus size={14} />
                  Agregar campo
                </button>
              </div>

              {metadataPairs.length === 0 && (
                <p className="text-xs text-slate-400">
                  Sin metadatos adicionales.
                </p>
              )}

              <div className="space-y-2">
                {metadataPairs.map((pair, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={pair.key}
                      onChange={(e) =>
                        updateMetadataPair(i, "key", e.target.value)
                      }
                      placeholder="Clave"
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      value={pair.value}
                      onChange={(e) =>
                        updateMetadataPair(i, "value", e.target.value)
                      }
                      placeholder="Valor"
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => removeMetadataPair(i)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
            >
              {submitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Send size={16} />
              )}
              {submitting ? "Procesando..." : "Reportar Evento"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
