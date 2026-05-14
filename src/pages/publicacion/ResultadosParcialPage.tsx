// ── ResultadosParcialPage ────────────────────────────────────────────────────
// Ruta: /publicacion/resultados
// Muestra resultados parciales acumulados al cierre del día.
// Solo disponible cuando estadoMotor === JORNADA_CERRADA_DIA.
//
// La advertencia legal se renderiza LITERALMENTE como banner fijo superior.

import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import ParticipacionStats from "../../components/publicacion/ParticipacionStats";
import AdvertenciaLegalBanner from "../../components/publicacion/AdvertenciaLegalBanner";
import EstadoJornadaInfo from "../../components/publicacion/EstadoJornadaInfo";
import { useMotorPublicacion } from "../../hooks/useMotorPublicacion";
import { Loader2, CalendarCheck } from "lucide-react";

function formatDate(iso: string): string {
    try {
        const date = new Date(iso);
        return new Intl.DateTimeFormat("es-CO", {
            dateStyle: "long",
            timeStyle: "short",
        }).format(date);
    } catch {
        return iso;
    }
}

export default function ResultadosParcialPage() {
    const {
        estadoMotor,
        participacion,
        resultados,
        errorResultados,
        cargandoParticipacion,
        cargandoResultados,
    } = useMotorPublicacion();

    const isJornadaActiva =
        estadoMotor === "JORNADA_ACTIVA" ||
        errorResultados === "RESULTADOS_NO_DISPONIBLES_EN_JORNADA_ACTIVA";

    const isJornadaCerrada = estadoMotor === "JORNADA_CERRADA_DIA";

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f6f7]">
            <NavBar />

            <main className="flex-1 px-6 py-10">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2">Resultados Parciales</h2>
                        <p className="text-gray-600">
                            Resultados parciales acumulados al cierre de la jornada electoral
                            del día.
                        </p>
                    </div>

                    {/* Loading initial state */}
                    {estadoMotor === null && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 size={32} className="animate-spin text-red-500 mb-4" />
                            <p className="text-gray-500">
                                Verificando estado de la jornada...
                            </p>
                        </div>
                    )}

                    {/* JORNADA ACTIVA — show informational message */}
                    {isJornadaActiva && <EstadoJornadaInfo />}

                    {/* Participación en vivo (always visible if available during active day) */}
                    {isJornadaActiva && participacion && !cargandoParticipacion && (
                        <div className="mt-6">
                            <h3 className="font-bold text-gray-800 mb-4 px-1">
                                Participación en tiempo real
                            </h3>
                            <ParticipacionStats participacion={participacion} />
                        </div>
                    )}

                    {/* JORNADA CERRADA — show results */}
                    {isJornadaCerrada && cargandoResultados && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 size={32} className="animate-spin text-red-500 mb-4" />
                            <p className="text-gray-500">Cargando resultados parciales...</p>
                        </div>
                    )}

                    {isJornadaCerrada && resultados && !cargandoResultados && (
                        <>
                            {/* Legal warning banner — MUST appear first, before any data */}
                            <AdvertenciaLegalBanner advertencia={resultados.advertencia} />

                            {/* Day metadata */}
                            <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                    <CalendarCheck size={18} className="text-red-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">
                                        Día {resultados.numeroDiaJornada} de la Jornada Electoral
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        Cierre: {formatDate(resultados.timestampCierreDelDia)}
                                    </p>
                                </div>
                            </div>

                            {/* Participation stats from the resultados payload */}
                            <ParticipacionStats participacion={resultados} />
                        </>
                    )}

                    {/* Network error fetching resultados */}
                    {isJornadaCerrada &&
                        errorResultados === "ERROR_RED" &&
                        !cargandoResultados && (
                            <div className="bg-white rounded-2xl border p-8 text-center">
                                <p className="text-gray-700 font-semibold mb-2">
                                    No se pudieron cargar los resultados parciales.
                                </p>
                                <p className="text-gray-500 text-sm">
                                    Se reintentará automáticamente al detectar un cambio de estado.
                                </p>
                            </div>
                        )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
