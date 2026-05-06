import React from "react";
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
}

const CandidatoDashboard: React.FC<Props> = ({ data }) => {
    // Transform object to array for recharts
    const chartData = data.votosPropiosPorMesa
        ? Object.entries(data.votosPropiosPorMesa).map(([name, value]) => ({
              name: name.split(" - ")[0], // Abreviar el nombre para el gráfico
              fullName: name,
              votos: value,
          }))
        : [];

    return (
        <div className="space-y-6">
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
                <p className="text-sm text-yellow-700 font-bold uppercase tracking-wide">
                    RESULTADOS PRELIMINARES — Carácter informativo
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium mb-1">
                        Estado de Candidatura
                    </h3>
                    <p className="text-2xl font-bold">
                        {data.estadoCandidatura || "N/A"}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium mb-1">
                        Mesas Reportadas
                    </h3>
                    <p className="text-2xl font-bold">
                        {data.porcentajeMesasReportadas}%
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium mb-1">
                        Alertas Activas
                    </h3>
                    <p className="text-2xl font-bold text-red-600">
                        {data.alertasReclamacionesActivas ? "Sí" : "No"}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col">
                    <h3 className="text-lg font-bold mb-4">
                        Votos Propios por Mesa (Gráfico)
                    </h3>
                    <div className="flex-grow min-h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{
                                    top: 10,
                                    right: 30,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip
                                    formatter={(value: any) => [
                                        `${value} votos`,
                                        "Votos",
                                    ]}
                                    labelFormatter={(label) =>
                                        chartData.find((d) => d.name === label)
                                            ?.fullName || label
                                    }
                                />
                                <Bar
                                    dataKey="votos"
                                    fill="#3b82f6"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col">
                    <h3 className="text-lg font-bold mb-4">
                        Votos Propios por Mesa (Detalle)
                    </h3>
                    <div className="overflow-auto flex-grow max-h-[300px]">
                        <table className="w-full text-left text-sm text-gray-700">
                            <thead className="bg-gray-100 text-gray-600 uppercase text-xs sticky top-0">
                                <tr>
                                    <th className="px-4 py-3">Mesa / Puesto</th>
                                    <th className="px-4 py-3 text-right">
                                        Votos
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.votosPropiosPorMesa &&
                                    Object.entries(
                                        data.votosPropiosPorMesa,
                                    ).map(([key, value]) => (
                                        <tr
                                            key={key}
                                            className="border-b border-gray-50 hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-3">{key}</td>
                                            <td className="px-4 py-3 font-semibold text-right">
                                                {String(value)}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidatoDashboard;
