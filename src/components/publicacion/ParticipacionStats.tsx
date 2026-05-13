// ── ParticipacionStats ──────────────────────────────────────────────────────
// Bloque reutilizable de métricas de participación electoral.
// Usado tanto en ParticipacionEnVivoPage como en ResultadosParcialPage.
// NUNCA renderiza campos relacionados con votos, candidatos, partidos,
// tendencias ni resultados.

import type { ParticipacionPayload } from "../../types/publicacion";
import { Users, Percent, Clock, Building2 } from "lucide-react";

interface ParticipacionStatsProps {
    participacion: ParticipacionPayload;
}

function formatTimestamp(iso: string): string {
    try {
        const date = new Date(iso);
        return new Intl.DateTimeFormat("es-CO", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }).format(date);
    } catch {
        return iso;
    }
}

function formatNumber(n: number): string {
    return n.toLocaleString("es-CO");
}

export default function ParticipacionStats({
    participacion,
}: ParticipacionStatsProps) {
    const { totalSufragantes, porcentajeSobreCenso, timestampActualizacion, fuente } =
        participacion;

    return (
        <div className="grid md:grid-cols-2 gap-6" data-testid="participacion-stats">
            {/* Total Sufragantes */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <Users size={18} className="text-red-500" />
                    </div>
                    <h3 className="font-bold text-gray-900">Total Sufragantes</h3>
                </div>
                <p className="text-3xl font-extrabold text-gray-900">
                    {formatNumber(totalSufragantes)}
                </p>
            </div>

            {/* Porcentaje sobre Censo */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Percent size={18} className="text-blue-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">Participación sobre Censo</h3>
                </div>
                <p className="text-3xl font-extrabold text-gray-900">
                    {porcentajeSobreCenso.toFixed(2)}%
                </p>
            </div>

            {/* Última actualización */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Clock size={18} className="text-green-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">Última Actualización</h3>
                </div>
                <p className="text-lg font-semibold text-gray-700">
                    Actualizado a las {formatTimestamp(timestampActualizacion)}
                </p>
            </div>

            {/* Fuente */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <Building2 size={18} className="text-gray-500" />
                    </div>
                    <h3 className="font-bold text-gray-900">Fuente</h3>
                </div>
                <p className="text-sm text-gray-500">{fuente}</p>
            </div>
        </div>
    );
}
