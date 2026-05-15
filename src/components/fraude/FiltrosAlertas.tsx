import { useSearchParams } from "react-router-dom";
import { Search, Filter, RotateCcw } from "lucide-react";
import { TIPOLOGIAS_LIST, MODULOS_ORIGEN } from "../../utils/fraudeAlerts";
import type { EstadoAlerta, Severidad } from "../../types/fraudeAlerts";

const STATUS_OPTIONS: { value: EstadoAlerta; label: string }[] = [
  { value: "DETECTADO", label: "Detectado" },
  { value: "EN_EVALUACION", label: "En Evaluación" },
  { value: "EN_INVESTIGACION", label: "En Investigación" },
  { value: "ESCALADO", label: "Escalado" },
  { value: "CONFIRMADO", label: "Confirmado" },
  { value: "DESCARTADO", label: "Descartado" },
  { value: "CERRADO", label: "Cerrado" },
];

const SEVERITY_OPTIONS: { value: Severidad; label: string }[] = [
  { value: "CRITICAL", label: "Crítico" },
  { value: "SUSPICIOUS", label: "Sospechoso" },
  { value: "INFORMATIONAL", label: "Informativo" },
];

function Select({
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  label: string;
  value: string | undefined;
  onChange: (v: string | undefined) => void;
  options: { value: string; label: string }[];
  allLabel: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-500">{label}</label>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-xs transition-colors hover:border-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
      >
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function FiltrosAlertas() {
  const [params, setParams] = useSearchParams();

  function setFilter(key: string, value: string | undefined) {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      if (key !== "page") next.delete("page");
      return next;
    });
  }

  function clearFilters() {
    setParams(new URLSearchParams());
  }

  const hasFilters = Array.from(params.entries()).some(([k]) => k !== "page");
  const searchValue = params.get("q") ?? "";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-700">Filtros</span>
        </div>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs font-medium text-slate-400 transition-colors hover:text-slate-700"
          >
            <RotateCcw size={12} />
            Limpiar
          </button>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        <Select
          label="Estado"
          value={params.get("status") ?? undefined}
          onChange={(v) => setFilter("status", v)}
          options={STATUS_OPTIONS}
          allLabel="Todos los estados"
        />
        <Select
          label="Severidad"
          value={params.get("severity") ?? undefined}
          onChange={(v) => setFilter("severity", v)}
          options={SEVERITY_OPTIONS}
          allLabel="Todas las severidades"
        />
        <Select
          label="Tipología"
          value={params.get("typologyId") ?? undefined}
          onChange={(v) => setFilter("typologyId", v)}
          options={TIPOLOGIAS_LIST.map((t) => ({ value: t.id, label: t.name }))}
          allLabel="Todas las tipologías"
        />
        <Select
          label="Módulo Origen"
          value={params.get("originModule") ?? undefined}
          onChange={(v) => setFilter("originModule", v)}
          options={MODULOS_ORIGEN.map((m) => ({ value: m.id, label: m.id }))}
          allLabel="Todos los módulos"
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">
            Buscar
          </label>
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchValue}
              onChange={(e) =>
                setFilter("q", e.target.value || undefined)
              }
              placeholder="UUID, mesa, cédula..."
              className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-sm text-slate-700 transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
