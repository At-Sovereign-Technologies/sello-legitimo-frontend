import React from "react";

interface Props {
    data: any;
}

const AuditorDashboard: React.FC<Props> = ({ data }) => {
    return (
        <div className="space-y-6">
            <div className="bg-red-50 p-6 rounded-lg border border-red-100">
                <h3 className="text-red-800 font-bold mb-4 text-lg">
                    Alertas Fraude FRA
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                    {data.alertasFraudeFRA?.map(
                        (alerta: string, idx: number) => (
                            <li key={idx} className="text-red-700 font-medium">
                                {alerta}
                            </li>
                        ),
                    )}
                </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Actas Digitales</h3>
                    <button className="text-sm bg-gray-100 px-3 py-1 rounded text-gray-700 font-medium hover:bg-gray-200 transition-colors">
                        Exportar Log Global
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-700">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3">ID Acta</th>
                                <th className="px-4 py-3">
                                    Hash SHA-256 (Integridad)
                                </th>
                                <th className="px-4 py-3">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="font-mono text-xs">
                            {data.actasDigitales?.map((acta: any) => (
                                <tr
                                    key={acta.id}
                                    className="border-b border-gray-50"
                                >
                                    <td className="px-4 py-3 font-bold">
                                        {acta.id}
                                    </td>
                                    <td
                                        className="px-4 py-3 truncate max-w-xs"
                                        title={acta.hashSha256}
                                    >
                                        {acta.hashSha256}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${acta.estado.includes("FIRMADA") ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                                        >
                                            {acta.estado}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuditorDashboard;
