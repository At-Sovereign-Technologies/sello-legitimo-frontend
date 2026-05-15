import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import { listarAlertas } from "../../api/fraudeAlerts.api";
import NavegacionFraude from "../../components/fraude/NavegacionFraude";
import FiltrosAlertas from "../../components/fraude/FiltrosAlertas";
import PanelDetalle from "../../components/fraude/PanelDetalle";
import type { EstadoAlerta, AlertasFilterParams, Severidad } from "../../types/fraudeAlerts";
import { useSearchParams } from "react-router-dom";

const ESTADOS: EstadoAlerta[] = [
  "DETECTADO", "EN_EVALUACION", "EN_INVESTIGACION",
  "ESCALADO", "CONFIRMADO", "DESCARTADO", "CERRADO",
];

const ESTADO_COLORS: Record<EstadoAlerta, string> = {
  DETECTADO: "bg-slate-100 text-slate-700 border-slate-300",
  EN_EVALUACION: "bg-blue-100 text-blue-700 border-blue-300",
  EN_INVESTIGACION: "bg-amber-100 text-amber-700 border-amber-300",
  ESCALADO: "bg-orange-100 text-orange-700 border-orange-300",
  CONFIRMADO: "bg-red-100 text-red-700 border-red-300",
  DESCARTADO: "bg-green-100 text-green-700 border-green-300",
  CERRADO: "bg-slate-200 text-slate-500 border-slate-400",
};

export default function GestionCasosPage() {
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
      size: 50,
    }),
    [searchParams],
  );

  const { data: pageData, isLoading } = useQuery({
    queryKey: ["fraude", "gestion-casos", filters],
    queryFn: () => listarAlertas(filters),
    placeholderData: (prev) => prev,
  });

  const groupedAlerts = useMemo(() => {
    const groups: Record<EstadoAlerta, typeof pageData extends { content: infer C } ? C : never[] > = {} as any;
    ESTADOS.forEach((s) => (groups as any)[s] = []);
    pageData?.content?.forEach((a) => {
      if ((groups as any)[a.status]) {
        (groups as any)[a.status].push(a);
      }
    });
    return groups;
  }, [pageData]);

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

        <div className="mb-4">
          <FiltrosAlertas />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {ESTADOS.map((estado) => {
              const alerts = (groupedAlerts as any)[estado] ?? [];
              return (
                <div key={estado} className="rounded-xl border border-slate-200 bg-white shadow-xs">
                  <div className={`rounded-t-xl border-b px-3 py-2 ${ESTADO_COLORS[estado]}`}>
                    <p className="text-xs font-bold uppercase tracking-wide">{estado.replace(/_/g, " ")}</p>
                    <p className="text-lg font-bold">{alerts.length}</p>
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto p-2 space-y-2">
                    {alerts.length === 0 && (
                      <p className="py-4 text-center text-xs text-slate-400">Sin casos</p>
                    )}
                    {alerts.map((alerta: any) => (
                      <div
                        key={alerta.alertUuid}
                        className={`cursor-pointer rounded-lg border p-2 text-xs transition-all hover:shadow-sm ${
                          selectedUuid === alerta.alertUuid
                            ? "border-slate-900 bg-slate-50"
                            : "border-transparent bg-slate-50"
                        }`}
                        onClick={() => setSelectedUuid(alerta.alertUuid)}
                      >
                        <p className="font-mono font-medium text-slate-900 truncate">
                          {alerta.alertUuid.slice(0, 8)}...
                        </p>
                        <p className="text-slate-500 truncate">{alerta.typologyId}</p>
                        <div className="mt-1 flex items-center gap-1">
                          <span className={`inline-block rounded px-1 py-0.5 text-[10px] font-medium ${
                            alerta.severityLevel === "CRITICAL" ? "bg-red-100 text-red-700" :
                            alerta.severityLevel === "SUSPICIOUS" ? "bg-amber-100 text-amber-700" :
                            "bg-blue-100 text-blue-700"
                          }`}>{alerta.severityLevel}</span>
                          {estado !== "CERRADO" && (
                            <span className="text-[10px] text-slate-400">Risk: {alerta.riskScore}</span>
                          )}
                          {estado === "CERRADO" && <Lock size={10} className="text-slate-400" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {pageData && pageData.totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 py-4">
            <button onClick={() => handlePageChange(pageData.number)} disabled={pageData.first}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-30">
              Anterior
            </button>
            <span className="text-xs text-slate-400">
              Página {pageData.number + 1} de {pageData.totalPages}
            </span>
            <button onClick={() => handlePageChange(pageData.number + 2)} disabled={pageData.last}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-30">
              Siguiente
            </button>
          </div>
        )}
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
