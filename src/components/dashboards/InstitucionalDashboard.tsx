import React from "react";
import type { MockRole } from "../../contexts/MockAuthContext";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface Props {
    data: any;
    role: MockRole;
}

const InstitucionalDashboard: React.FC<Props> = ({ data, role }) => {
    const isFiscalia = role === "FISCALIA";

    const chartData = data.resultadosConsolidados
        ? Object.entries(data.resultadosConsolidados).map(
              ([candidate, votes]) => ({
                  name: candidate
                      .replace("Candidato ", "C. ")
                      .replace("Voto ", "V. "),
                  fullName: candidate,
                  votos: votes,
              }),
          )
        : [];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mock Map Placeholder as a static CSS skeleton */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col">
                    <h3 className="text-lg font-bold mb-4">
                        Mapa Georreferenciado
                    </h3>
                    <div className="flex-grow min-h-[300px] bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full h-full animate-[pulse_2s_ease-in-out_infinite]" />
                        <div className="text-center text-gray-500 px-4 z-10">
                            <svg
                                className="w-12 h-12 mx-auto mb-2 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                                />
                            </svg>
                            <p className="font-semibold text-gray-600">
                                Capa de Mapa Institucional (Mock)
                            </p>
                            <p className="text-sm mt-1">
                                Simulación de visualización en mapa de{" "}
                                {isFiscalia ? "Incidentes" : "Alertas de Actas"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 flex flex-col">
                    {/* Key Metrics / Info based on role */}
                    {isFiscalia ? (
                        <div className="bg-red-50 p-6 rounded-lg shadow-sm border border-red-100 flex-1">
                            <h3 className="text-lg font-bold text-red-800 mb-4">
                                Casos de Fraude en Investigación
                            </h3>
                            <ul className="space-y-3">
                                {data.casosFraudeInvestigacion?.map(
                                    (caso: string, idx: number) => {
                                        const parts = caso.split(":");
                                        return (
                                            <li
                                                key={idx}
                                                className="bg-white p-3 rounded shadow-sm text-sm border-l-4 border-red-500"
                                            >
                                                <span className="font-semibold">
                                                    {parts[0]}:
                                                </span>{" "}
                                                {parts.slice(1).join(":")}
                                            </li>
                                        );
                                    },
                                )}
                            </ul>
                            <div className="mt-6 pt-4 border-t border-red-200">
                                <span className="text-sm font-medium text-red-700">
                                    Anomalías de Tráfico (Red):{" "}
                                </span>
                                <span className="text-xl font-bold text-red-900">
                                    {data.alertasAnomaliasTrafico}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex-1 flex flex-col">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">
                                Resultados Consolidados
                            </h3>

                            <div className="h-[200px] w-full mb-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={chartData}
                                        margin={{
                                            top: 0,
                                            right: 0,
                                            left: 0,
                                            bottom: 0,
                                        }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                        />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fontSize: 11 }}
                                            interval={0}
                                        />
                                        <YAxis
                                            tickFormatter={(val) =>
                                                `${val / 1000000}M`
                                            }
                                        />
                                        <Tooltip
                                            formatter={(value: any) => [
                                                Number(value).toLocaleString(),
                                                "Votos",
                                            ]}
                                            labelFormatter={(label) =>
                                                chartData.find(
                                                    (d) => d.name === label,
                                                )?.fullName || label
                                            }
                                        />
                                        <Bar
                                            dataKey="votos"
                                            fill="#10b981"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="space-y-3 mb-6 flex-grow">
                                {data.resultadosConsolidados &&
                                    Object.entries(
                                        data.resultadosConsolidados,
                                    ).map(([candidate, votes]) => (
                                        <div
                                            key={candidate}
                                            className="flex justify-between items-center bg-gray-50 p-2 rounded"
                                        >
                                            <span className="text-sm font-medium">
                                                {candidate}
                                            </span>
                                            <span className="font-mono font-bold text-blue-700">
                                                {(
                                                    votes as number
                                                ).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">
                                    Mesas Actas Pendientes:
                                </span>
                                <span className="text-xl font-bold text-orange-500">
                                    {data.mesasActasPendientes}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstitucionalDashboard;
