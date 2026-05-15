import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Shield,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import type {
  EstadoAlerta,
  Severidad,
  AlertasFilterParams,
} from "../../types/fraudeAlerts";
import { listarAlertas, obtenerMetricas } from "../../api/fraudeAlerts.api";

import NavegacionFraude from "../../components/fraude/NavegacionFraude";
import FiltrosAlertas from "../../components/fraude/FiltrosAlertas";
import AlertaItem from "../../components/fraude/AlertaItem";
import PanelDetalle from "../../components/fraude/PanelDetalle";

function TarjetaResumen({
  icon: Icon,
  label,
  count,
  color,
}: {
  icon: typeof Shield;
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xs">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 tabular-nums">
          {count}
        </p>
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function Paginacion({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1 py-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
      >
        Anterior
      </button>

      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
        let pageNum: number;
        if (totalPages <= 7) {
          pageNum = i + 1;
        } else if (page <= 4) {
          pageNum = i + 1;
        } else if (page >= totalPages - 3) {
          pageNum = totalPages - 6 + i;
        } else {
          pageNum = page - 3 + i;
        }
        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`min-w-[2rem] rounded-lg px-2 py-1.5 text-sm font-medium transition-colors ${
              pageNum === page
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            {pageNum}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
      >
        Siguiente
      </button>
    </div>
  );
}

export default function AlertasPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedUuid, setSelectedUuid] = useState<string | null>(null);

  const filters: AlertasFilterParams = useMemo(
    () => ({
      status: (searchParams.get("status") as EstadoAlerta) ?? undefined,
      severity: (searchParams.get("severity") as Severidad) ?? undefined,
      typologyId: searchParams.get("typologyId") ?? undefined,
      originModule: searchParams.get("originModule") ?? undefined,
      search: searchParams.get("q") ?? undefined,
      page: Number(searchParams.get("page") ?? "1"),
      size: 20,
    }),
    [searchParams],
  );

  const { data: pageData, isLoading } = useQuery({
    queryKey: ["fraude", "alertas", filters],
    queryFn: () => listarAlertas(filters),
    placeholderData: (prev) => prev,
  });

  const { data: metricas } = useQuery({
    queryKey: ["fraude", "metricas"],
    queryFn: obtenerMetricas,
    refetchInterval: 30_000,
  });

  const summary = useMemo(() => {
    const m = metricas;
    return {
      total: m?.totalAlerts ?? 0,
      critical: m?.bySeverity["CRITICAL"] ?? 0,
      suspicious: m?.bySeverity["SUSPICIOUS"] ?? 0,
      informational: m?.bySeverity["INFORMATIONAL"] ?? 0,
    };
  }, [metricas]);

  function handlePageChange(page: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(page));
      return next;
    });
    setSelectedUuid(null);
  }

  return (
    <div className="bg-slate-50 h-full">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <NavegacionFraude />

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <TarjetaResumen
            icon={AlertTriangle}
            label="Críticas"
            count={summary.critical}
            color="bg-red-600"
          />
          <TarjetaResumen
            icon={AlertTriangle}
            label="Sospechosas"
            count={summary.suspicious}
            color="bg-amber-500"
          />
          <TarjetaResumen
            icon={TrendingUp}
            label="Informativas"
            count={summary.informational}
            color="bg-blue-500"
          />
          <TarjetaResumen
            icon={Shield}
            label="Total Alertas"
            count={summary.total}
            color="bg-slate-700"
          />
        </div>

        <div className="mb-6">
          <FiltrosAlertas />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-xs">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
            </div>
          ) : pageData?.content && pageData.content.length > 0 ? (
            <>
              <div className="border-b border-slate-100 px-4 py-2">
                <p className="text-xs font-medium text-slate-400">
                  {pageData.totalElements} alerta
                  {pageData.totalElements !== 1 ? "s" : ""} encontrada
                  {pageData.totalElements !== 1 ? "s" : ""}
                  {pageData.totalPages > 1 &&
                    ` · Página ${pageData.number + 1} de ${pageData.totalPages}`}
                </p>
              </div>
              <div className="divide-y divide-slate-100">
                {pageData.content.map((alerta) => (
                  <AlertaItem
                    key={alerta.alertUuid}
                    alerta={alerta}
                    selected={selectedUuid === alerta.alertUuid}
                    onSelect={() => setSelectedUuid(alerta.alertUuid)}
                  />
                ))}
              </div>
              <Paginacion
                page={pageData.number + 1}
                totalPages={pageData.totalPages}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Shield size={40} className="mb-3 text-slate-300" />
              <p className="text-sm font-medium">
                No se encontraron alertas
              </p>
              <p className="mt-1 text-xs">
                Intenta ajustar los filtros de búsqueda
              </p>
            </div>
          )}
        </div>
      </main>

      {selectedUuid && (
        <PanelDetalle
          alertaUuid={selectedUuid}
          onClose={() => setSelectedUuid(null)}
          filters={filters}
        />
      )}
    </div>
  );
}
