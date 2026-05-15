import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileCheck, Plus, AlertTriangle, CheckCircle, XCircle, Hash, HelpCircle, Lock, File as FileIcon, FileText } from "lucide-react";
import { listarAlertas } from "../../api/fraudeAlerts.api";
import { asociarEvidencia, listarEvidenciasPorAlerta, obtenerSiguienteReferenceId } from "../../api/evidencias.api";
import NavegacionFraude from "../../components/fraude/NavegacionFraude";
import SubirDocumento from "../../components/fraude/SubirDocumento";
import VistaPreviaDocumento from "../../components/fraude/VistaPreviaDocumento";
import type { CrearEvidenciaRequest, SubirDocumentoResponse } from "../../types/fraudeAlerts";

export default function EvidenciasPage() {
  const queryClient = useQueryClient();
  const [selectedAlertUuid, setSelectedAlertUuid] = useState<string>("");
  const [referenceId, setReferenceId] = useState("");
  const [hashSignature, setHashSignature] = useState("");
  const [rawTimestamp, setRawTimestamp] = useState(new Date().toISOString().slice(0, 16));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadedDoc, setUploadedDoc] = useState<SubirDocumentoResponse | null>(null);
  const [docsAsociados, setDocsAsociados] = useState<Record<string, SubirDocumentoResponse>>({});
  const [uploadKey, setUploadKey] = useState(0);
  const [previewDoc, setPreviewDoc] = useState<SubirDocumentoResponse | null>(null);

  const { data: alertas } = useQuery({
    queryKey: ["fraude", "alertas", { size: 200 }],
    queryFn: () => listarAlertas({ size: 200 }),
  });

  const { data: nextRefId, refetch: refetchRefId } = useQuery({
    queryKey: ["fraude", "evidencias", "next-reference-id"],
    queryFn: obtenerSiguienteReferenceId,
  });

  useEffect(() => {
    if (nextRefId?.referenceId) {
      setReferenceId(nextRefId.referenceId);
    }
  }, [nextRefId]);

  const { data: evidencias = [], isLoading: loadingEv } = useQuery({
    queryKey: ["fraude", "evidencias", selectedAlertUuid],
    queryFn: () => listarEvidenciasPorAlerta(selectedAlertUuid),
    enabled: !!selectedAlertUuid,
  });

  const createMutation = useMutation({
    mutationFn: asociarEvidencia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fraude", "evidencias"] });
      refetchRefId();
      if (uploadedDoc) {
        setDocsAsociados((prev) => ({ ...prev, [referenceId]: uploadedDoc }));
      }
      setUploadedDoc(null);
      setUploadKey((k) => k + 1);
      setSuccess("Evidencia asociada exitosamente");
      setError("");
      setHashSignature("");
      setRawTimestamp(new Date().toISOString().slice(0, 16));
    },
    onError: (e: any) => {
      setError(e.response?.data?.detail ?? e.message);
      setSuccess("");
    },
  });

  function generateMockHash() {
    if (!referenceId.trim()) return;
    const canonical = referenceId + "|" + rawTimestamp + ":00";
    const encoder = new TextEncoder();
    const data = encoder.encode(canonical);
    crypto.subtle.digest("SHA-256", data).then((buf) => {
      const arr = Array.from(new Uint8Array(buf));
      setHashSignature(arr.map((b) => b.toString(16).padStart(2, "0")).join(""));
    });
  }

  function handleSubmit() {
    setError("");
    setSuccess("");
    if (!selectedAlertUuid) { setError("Seleccione una alerta"); return; }
    if (!referenceId.trim()) { setError("Ingrese un Reference ID"); return; }
    if (!hashSignature.trim()) { setError("Ingrese o genere el Hash Signature"); return; }
    if (!/^[a-f0-9]{64}$/.test(hashSignature)) { setError("Hash invalido: debe tener 64 caracteres hexadecimales"); return; }

    const body: CrearEvidenciaRequest = {
      alertUuid: selectedAlertUuid,
      referenceId: referenceId.trim(),
      hashSignature,
      originalTimestamp: rawTimestamp + ":00",
    };
    createMutation.mutate(body);
  }

  const alertaOptions = alertas?.content?.filter((a) => a.status !== "CERRADO") ?? [];

  return (
    <div className="bg-slate-50 h-full">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <NavegacionFraude />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900">
              <Plus size={18} /> Asociar Evidencia
            </h3>

            {error && (
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                <AlertTriangle size={14} /> {error}
              </div>
            )}
            {success && (
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
                <CheckCircle size={14} /> {success}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Alerta (Caso activo)</label>
                <select
                  value={selectedAlertUuid}
                  onChange={(e) => setSelectedAlertUuid(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar alerta...</option>
                  {alertaOptions.map((a) => (
                    <option key={a.alertUuid} value={a.alertUuid}>
                      {a.alertUuid.slice(0, 8)}... - {a.typologyId} [{a.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Reference ID</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    value={referenceId}
                    readOnly
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 pl-8 text-sm font-mono text-slate-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Generado automáticamente por el sistema
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Timestamp Original</label>
                <input
                  type="datetime-local"
                  value={rawTimestamp}
                  onChange={(e) => setRawTimestamp(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Usado para generar el hash de verificación
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-500">Hash Signature (SHA-256)</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setHashSignature("")}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Limpiar
                    </button>
                    <button
                      type="button"
                      onClick={generateMockHash}
                      disabled={!referenceId.trim()}
                      className="text-xs text-blue-600 hover:underline disabled:text-slate-300"
                    >
                      Generar hash
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <Hash size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    value={hashSignature}
                    onChange={(e) => setHashSignature(e.target.value.toLowerCase().replace(/[^a-f0-9]/g, ""))}
                    className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-2 text-sm font-mono text-[11px]"
                    placeholder="64 caracteres hexadecimales (a-f, 0-9)"
                    maxLength={64}
                  />
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <HelpCircle size={10} className="text-slate-300" />
                  <p className="text-[10px] text-slate-400">
                    Canonical: <code className="bg-slate-100 px-1 rounded">referenceId|YYYY-MM-DDTHH:mm:ss</code>
                  </p>
                  {hashSignature && hashSignature.length === 64 && (
                    <span className="ml-auto text-[10px] text-green-600">✓ 64 hex</span>
                  )}
                  {hashSignature && hashSignature.length > 0 && hashSignature.length !== 64 && (
                    <span className="ml-auto text-[10px] text-amber-600">{hashSignature.length}/64 chars</span>
                  )}
                </div>
              </div>

              <SubirDocumento onUpload={setUploadedDoc} resetKey={uploadKey} />

              <button
                onClick={handleSubmit}
                disabled={createMutation.isPending || !hashSignature || hashSignature.length !== 64}
                className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {createMutation.isPending ? "Verificando..." : "Asociar Evidencia"}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900">
              <FileCheck size={18} /> Evidencias Asociadas
            </h3>

            {!selectedAlertUuid ? (
              <p className="py-8 text-center text-sm text-slate-400">Selecciona una alerta para ver sus evidencias</p>
            ) : loadingEv ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
              </div>
            ) : evidencias.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Sin evidencias asociadas a esta alerta</p>
            ) : (
              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {evidencias.map((ev) => {
                  const doc = docsAsociados[ev.referenceId];
                  return (
                    <div key={ev.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-medium text-slate-900">{ev.referenceId}</span>
                        {ev.verified ? (
                          <span className="flex items-center gap-1 text-green-600"><CheckCircle size={12} /> Verificada</span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600"><XCircle size={12} /> No verificada</span>
                        )}
                      </div>
                      <p className="font-mono text-[10px] text-slate-400 truncate">{ev.hashSignature}</p>
                      <p className="text-slate-500 mt-1">Original: {new Date(ev.originalTimestamp).toLocaleString()}</p>
                      {doc && (
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="mt-2 flex w-full cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 text-left transition-colors hover:bg-slate-50"
                        >
                          {doc.mimeType.startsWith("image/") ? (
                            <img src={doc.mockUrl} alt="" className="h-10 w-10 rounded object-cover" />
                          ) : doc.mimeType === "application/pdf" ? (
                            <div className="flex h-10 w-10 items-center justify-center rounded bg-red-50">
                              <FileText size={16} className="text-red-500" />
                            </div>
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-100">
                              <FileIcon size={16} className="text-slate-400" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[11px] font-medium text-slate-700">{doc.fileName}</p>
                            <p className="text-[10px] text-slate-400">
                              {(doc.fileSize / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {previewDoc && (
          <VistaPreviaDocumento doc={previewDoc} onClose={() => setPreviewDoc(null)} />
        )}
      </main>
    </div>
  );
}
