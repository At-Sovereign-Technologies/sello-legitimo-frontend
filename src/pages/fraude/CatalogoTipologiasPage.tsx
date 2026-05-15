import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { listarTipologias, crearTipologia, actualizarTipologia, eliminarTipologia } from "../../api/tipologias.api";
import NavegacionFraude from "../../components/fraude/NavegacionFraude";
import type { Tipologia, CrearTipologiaRequest, Severidad } from "../../types/fraudeAlerts";

const role = () => localStorage.getItem("mockRole") ?? "";
const isSuperAdmin = () => role() === "SuperAdmin";

interface ModalState {
  open: boolean;
  editing: Tipologia | null;
}

const defaultForm: CrearTipologiaRequest = {
  id: "",
  name: "",
  description: "",
  defaultSeverity: "SUSPICIOUS",
  requiresReview: true,
  justification: "",
};

export default function CatalogoTipologiasPage() {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<ModalState>({ open: false, editing: null });
  const [form, setForm] = useState<CrearTipologiaRequest>({ ...defaultForm });
  const [error, setError] = useState("");

  const { data: tipologias = [], isLoading } = useQuery({
    queryKey: ["fraude", "tipologias"],
    queryFn: listarTipologias,
  });

  const createMutation = useMutation({
    mutationFn: crearTipologia,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["fraude", "tipologias"] }); closeModal(); },
    onError: (e: any) => setError(e.response?.data?.detail ?? e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: CrearTipologiaRequest }) => actualizarTipologia(id, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["fraude", "tipologias"] }); closeModal(); },
    onError: (e: any) => setError(e.response?.data?.detail ?? e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: eliminarTipologia,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fraude", "tipologias"] }),
    onError: (e: any) => setError(e.response?.data?.detail ?? e.message),
  });

  function openCreate() {
    setForm({ ...defaultForm });
    setModal({ open: true, editing: null });
    setError("");
  }

  function openEdit(t: Tipologia) {
    setForm({
      id: t.id,
      name: t.name,
      description: t.description ?? "",
      defaultSeverity: t.defaultSeverity,
      requiresReview: t.requiresReview,
      justification: "",
    });
    setModal({ open: true, editing: t });
    setError("");
  }

  function closeModal() {
    setModal({ open: false, editing: null });
    setError("");
  }

  function handleSave() {
    setError("");
    if (modal.editing) {
      updateMutation.mutate({ id: modal.editing.id, body: form });
    } else {
      createMutation.mutate(form);
    }
  }

  function handleDelete(id: string) {
    if (window.confirm("Eliminar tipologia " + id + "?")) {
      deleteMutation.mutate(id);
    }
  }

  return (
    <div className="bg-slate-50 h-full">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <NavegacionFraude />

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">Catálogo de Tipologías</h3>
          {isSuperAdmin() && (
            <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
              <Plus size={16} /> Nueva Tipología
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">ID</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Nombre</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Severidad</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Requiere Revisión</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Creada</th>
                  {isSuperAdmin() && <th className="px-4 py-3 text-right font-medium text-slate-500">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tipologias.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{t.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{t.name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        t.defaultSeverity === "CRITICAL" ? "bg-red-100 text-red-700" :
                        t.defaultSeverity === "SUSPICIOUS" ? "bg-amber-100 text-amber-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>{t.defaultSeverity}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{t.requiresReview ? "Sí" : "No"}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                    {isSuperAdmin() && (
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => openEdit(t)} className="mr-2 rounded p-1 text-slate-400 hover:text-blue-600"><Pencil size={15} /></button>
                        <button onClick={() => handleDelete(t.id)} className="rounded p-1 text-slate-400 hover:text-red-600"><Trash2 size={15} /></button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={closeModal}>
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-bold text-slate-900">
              {modal.editing ? "Editar Tipología" : "Nueva Tipología"}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">ID <span className="text-red-500">*</span></label>
                <input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "") })}
                  disabled={!!modal.editing}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono disabled:bg-slate-100"
                  placeholder="MAYUSCULAS_CON_GUION_BAJO  ej: NUEVO_TIPO_FRAUDE" />
                <p className="text-[10px] text-slate-400 mt-0.5">Solo mayúsculas, números y guión bajo</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Nombre <span className="text-red-500">*</span></label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Nombre descriptivo de la tipología" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Descripción</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" rows={2}
                  placeholder="Descripción del comportamiento fraudulento" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Severidad</label>
                  <select value={form.defaultSeverity} onChange={(e) => setForm({ ...form, defaultSeverity: e.target.value as Severidad })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                    <option value="INFORMATIONAL">INFORMATIONAL</option>
                    <option value="SUSPICIOUS">SUSPICIOUS</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Requiere Revisión</label>
                  <select value={form.requiresReview ? "true" : "false"} onChange={(e) => setForm({ ...form, requiresReview: e.target.value === "true" })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Justificación <span className="text-amber-600">(requerida si hay fase electoral activa)</span>
                </label>
                <textarea value={form.justification} onChange={(e) => setForm({ ...form, justification: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" rows={2} placeholder="Motivo de la modificación..." />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={closeModal} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button onClick={handleSave} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
                {modal.editing ? "Actualizar" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
