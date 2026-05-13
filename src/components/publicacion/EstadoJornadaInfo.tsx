// ── EstadoJornadaInfo ────────────────────────────────────────────────────────
// Mensaje informativo mostrado cuando la jornada está activa y los resultados
// parciales aún no están disponibles.
// NO muestra códigos de error internos al usuario.

import { Info } from "lucide-react";

export default function EstadoJornadaInfo() {
    return (
        <div
            data-testid="estado-jornada-info"
            className="bg-white rounded-2xl shadow-sm border p-8 text-center"
        >
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Info size={24} className="text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">
                Jornada Electoral en Curso
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
                Los resultados parciales estarán disponibles una vez concluida la jornada
                de votación del día. Vuelve a partir del cierre oficial.
            </p>
        </div>
    );
}
