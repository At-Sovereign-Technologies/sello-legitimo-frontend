// ── AdvertenciaLegalBanner ───────────────────────────────────────────────────
// Banner legal obligatorio para la vista de resultados parciales.
// Renderiza el campo `advertencia` LITERALMENTE, sin modificar ni un carácter.
// Requisito legal NO negociable:
// - Banner fijo en la parte superior de la vista de resultados
// - Visible antes de cualquier dato numérico
// - No traducir, resumir, reformatear ni dividir
// - Color semántico de advertencia (amber/warning)
// - Accesible: role="alert" + aria-live="assertive"

import { AlertTriangle } from "lucide-react";

interface AdvertenciaLegalBannerProps {
    advertencia: string;
}

export default function AdvertenciaLegalBanner({
    advertencia,
}: AdvertenciaLegalBannerProps) {
    return (
        <div
            role="alert"
            aria-live="assertive"
            data-testid="advertencia-legal-banner"
            className="mb-6 px-5 py-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3"
        >
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle size={18} className="text-amber-600" />
            </div>
            <p className="text-sm text-amber-800 font-semibold leading-relaxed">
                {advertencia}
            </p>
        </div>
    );
}
