import React, { useMemo } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

interface Props {
    data: any;
}

const COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#8b5cf6"];

const TestigoDashboard: React.FC<Props> = ({ data }) => {
    const chartData = useMemo(() => {
        if (!data?.mesasBajoCobertura) return [];

        // Contar cuántas mesas hay de cada estatus
        const counts = data.mesasBajoCobertura.reduce((acc: any, curr: any) => {
            acc[curr.estado] = (acc[curr.estado] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(counts).map(([name, value]) => ({
            name,
            value,
        }));
    }, [data.mesasBajoCobertura]);

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center">
                <div>
                    <h3 className="text-gray-500 text-sm font-medium mb-1">
                        Conteo Votos Partido (Mesa Asignada)
                    </h3>
                    <p className="text-3xl font-bold text-blue-600">
                        {data.conteoVotosPartido}
                    </p>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                    <p className="text-gray-500 text-sm font-medium mb-1">
                        Total Mesas Asignadas
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                        {data.mesasBajoCobertura?.length || 0}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 lg:col-span-1 flex flex-col">
                    <h3 className="text-lg font-bold mb-4 text-center">
                        Estado de Cobertura
                    </h3>
                    <div className="h-[250px] w-full items-center justify-center flex">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.map((_entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 lg:col-span-2">
                    <h3 className="text-lg font-bold mb-4">
                        Mesas Bajo Cobertura
                    </h3>
                    <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                        <table className="w-full text-left text-sm text-gray-700">
                            <thead className="bg-gray-100 text-gray-600 uppercase text-xs sticky top-0">
                                <tr>
                                    <th className="px-4 py-3">Mesa</th>
                                    <th className="px-4 py-3">Estado</th>
                                    <th className="px-4 py-3 text-right">
                                        Acción
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.mesasBajoCobertura?.map(
                                    (item: any, idx: number) => (
                                        <tr
                                            key={idx}
                                            className="border-b border-gray-50 hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-3 font-medium">
                                                {item.mesa}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                                    {item.estado}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                                                    Descargar E-14
                                                </button>
                                            </td>
                                        </tr>
                                    ),
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestigoDashboard;
