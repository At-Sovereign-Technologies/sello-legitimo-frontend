// ── ParticipacionEnVivoPage ──────────────────────────────────────────────────
// Ruta: /publicacion/participacion
// Muestra en tiempo real el número de sufragantes y el porcentaje de
// participación sobre el censo. Disponible siempre durante la jornada.
//
// Datos que NUNCA aparecen en esta vista: votos, candidatos, partidos,
// tendencias ni resultados.

import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import ParticipacionStats from "../../components/publicacion/ParticipacionStats";
import { useMotorPublicacion } from "../../hooks/useMotorPublicacion";
import { Loader2, WifiOff } from "lucide-react";

export default function ParticipacionEnVivoPage() {
    const {
        participacion,
        cargandoParticipacion,
        errorParticipacion,
    } = useMotorPublicacion();

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f6f7]">
            <NavBar />

            <main className="flex-1 px-6 py-10">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2">
                            Participación Electoral en Vivo
                        </h2>
                        <p className="text-gray-600">
                            Seguimiento en tiempo real de la participación ciudadana durante la
                            jornada electoral.
                        </p>
                    </div>

                    {/* Live indicator */}
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                        </span>
                        <span className="text-sm font-semibold text-red-600">En vivo</span>
                    </div>

                    {/* Offline warning */}
                    {errorParticipacion && participacion && (
                        <div className="mb-6 px-4 py-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm flex items-center gap-2">
                            <WifiOff size={16} />
                            <span>Último dato disponible — sin conexión</span>
                        </div>
                    )}

                    {/* Loading state (only on initial load) */}
                    {cargandoParticipacion && !participacion && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 size={32} className="animate-spin text-red-500 mb-4" />
                            <p className="text-gray-500">Cargando datos de participación...</p>
                        </div>
                    )}

                    {/* Error state with no previous data */}
                    {errorParticipacion && !participacion && (
                        <div className="bg-white rounded-2xl border p-8 text-center">
                            <WifiOff size={40} className="text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-700 font-semibold mb-2">
                                No se pudieron cargar los datos de participación.
                            </p>
                            <p className="text-gray-500 text-sm">
                                Verificando conexión... se reintentará automáticamente.
                            </p>
                        </div>
                    )}

                    {/* Main stats */}
                    {participacion && <ParticipacionStats participacion={participacion} />}
                </div>
            </main>

            <Footer />
        </div>
    );
}
