import { useQueries } from "@tanstack/react-query";
import {
  Shield,
  AlertTriangle,
  MapPin,
  BarChart3,
  EyeOff,
} from "lucide-react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  obtenerAlertasPorZona,
  obtenerCasosPorEstado,
  obtenerMapaRiesgo,
  obtenerTipologiasPorDistrito,
} from "../../api/fraudeAlerts.api";
import {
  statusConfig,
  typologyName,
} from "../../utils/fraudeAlerts";
import NavegacionFraude from "../../components/fraude/NavegacionFraude";

const COLORS = [
  "#2563eb", "#dc2626", "#d97706", "#059669",
  "#7c3aed", "#ea580c", "#0891b2", "#be123c",
  "#65a30d", "#0d9488", "#a21caf", "#ca8a04",
];

function TarjetaKPI({
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

function SuppressedBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
      <EyeOff size={10} />
      Suprimido
    </span>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
      <h3 className="mb-4 text-sm font-semibold text-slate-700">{title}</h3>
      {children}
    </div>
  );
}

export default function MetricasPage() {
  const results = useQueries({
    queries: [
      {
        queryKey: ["fraude", "metricas", "alertas-por-zona"],
        queryFn: obtenerAlertasPorZona,
        refetchInterval: 30_000,
      },
      {
        queryKey: ["fraude", "metricas", "casos-por-estado"],
        queryFn: obtenerCasosPorEstado,
        refetchInterval: 30_000,
      },
      {
        queryKey: ["fraude", "metricas", "mapa-riesgo"],
        queryFn: obtenerMapaRiesgo,
        refetchInterval: 30_000,
      },
      {
        queryKey: ["fraude", "metricas", "tipologias-por-distrito"],
        queryFn: obtenerTipologiasPorDistrito,
        refetchInterval: 30_000,
      },
    ],
  });

  const [zonasData, estadosData, riesgoData, tipologiasData] = results;

  const isLoading = results.some((r) => r.isLoading);

  if (isLoading) {
    return (
      <div className="bg-slate-50 h-full">
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          </div>
        </main>
      </div>
    );
  }

  const zonas = zonasData?.data?.zonas ?? [];
  const estados = estadosData?.data?.estados ?? [];
  const celdas = riesgoData?.data?.celdas ?? [];
  const distritos = tipologiasData?.data?.distritos ?? [];

  const totalAlertasActivas = zonas.reduce((s, z) => s + z.activeAlerts, 0);
  const totalCasos = estados.reduce((s, e) => s + e.count, 0);
  const totalSuprimidas = zonas.filter((z) => z.suppressed).length;

  const statusChartData = estados.map((e) => ({
    name: statusConfig(e.status as never)?.label ?? e.status,
    value: e.count,
    suppressed: e.suppressed,
  }));

  const distritoChartData = distritos.map((d) => ({
    name: `${typologyName(d.typologyId)} (${d.distrito})`,
    value: d.count,
    suppressed: d.suppressed,
  })).sort((a, b) => b.value - a.value).slice(0, 15);

  const zonaChartData = zonas.map((z) => ({
    name: z.zona,
    value: z.activeAlerts,
    suppressed: z.suppressed,
  }));

  return (
    <div className="bg-slate-50 h-full">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <NavegacionFraude />

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <TarjetaKPI
            icon={AlertTriangle}
            label="Alertas Activas"
            count={totalAlertasActivas}
            color="bg-red-600"
          />
          <TarjetaKPI
            icon={BarChart3}
            label="Total Casos"
            count={totalCasos}
            color="bg-slate-700"
          />
          <TarjetaKPI
            icon={MapPin}
            label="Zonas con Alertas"
            count={zonas.length}
            color="bg-blue-500"
          />
          <TarjetaKPI
            icon={EyeOff}
            label="Celdas Suprimidas (k=5)"
            count={totalSuprimidas}
            color="bg-amber-500"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartCard title="Alertas Activas por Zona Geográfica">
            {zonaChartData.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Sin datos</p>
            ) : (
              <div className="space-y-2">
                {zonaChartData.map((z) => (
                  <div key={z.name} className="flex items-center gap-3">
                    <span className="w-28 text-sm text-slate-600 truncate">{z.name}</span>
                    <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${Math.min((z.value / Math.max(...zonaChartData.map(x => x.value))) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-900 w-12 text-right">
                      {z.value}
                    </span>
                    {z.suppressed && <SuppressedBadge />}
                  </div>
                ))}
              </div>
            )}
          </ChartCard>

          <ChartCard title="Distribución por Estado">
            {statusChartData.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Sin datos</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={statusChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={140}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {statusChartData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Mapa de Riesgo por Zona">
            {celdas.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Sin datos</p>
            ) : (
              <div className="space-y-3">
                {celdas.map((c) => (
                  <div key={c.zona} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-600">{c.zona}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">
                            {c.suppressed ? "—" : c.averageRiskScore.toFixed(1)}
                          </span>
                          {c.suppressed && <SuppressedBadge />}
                        </div>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            c.suppressed
                              ? "bg-slate-300"
                              : c.averageRiskScore >= 66
                                ? "bg-red-500"
                                : c.averageRiskScore >= 31
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                          }`}
                          style={{
                            width: c.suppressed ? 0 : `${Math.min(c.averageRiskScore, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>

          <ChartCard title="Tipologías por Distrito (top 15)">
            {distritoChartData.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Sin datos</p>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(200, distritoChartData.length * 35)}>
                <BarChart data={distritoChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={200}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar dataKey="value" fill="#475569" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <EyeOff size={12} />
            Las celdas con menos de 5 casos se marcan como suprimidas para proteger el secreto del sufragio (k-anonimato, k=5)
          </p>
        </div>
      </main>
    </div>
  );
}
