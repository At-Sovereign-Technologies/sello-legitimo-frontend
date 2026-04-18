import { useState, useEffect } from "react"
import { Calendar, ChevronDown, ChevronUp, Loader2, AlertCircle, Vote } from "lucide-react"
import { getActiveElections } from "../api/elections.api"
import type { Election } from "../types/elections"
import Header from "../components/LoginHeader"
import Footer from "../components/Footer"

const statusConfig: Record<Election["status"], { label: string; bg: string; text: string }> = {
    active: { label: "Activa", bg: "bg-green-100", text: "text-green-700" },
    upcoming: { label: "Próxima", bg: "bg-blue-100", text: "text-blue-700" },
    completed: { label: "Finalizada", bg: "bg-gray-100", text: "text-gray-600" },
}

function ElectionCard({ election }: { election: Election }) {
    const [expanded, setExpanded] = useState(false)
    const status = statusConfig[election.status]

    return (
        <div className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full text-left p-6 flex items-start justify-between gap-4 cursor-pointer"
            >
                <div className="flex items-start gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Vote size={18} className="text-red-500" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg">{election.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{election.type}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${status.bg} ${status.text}`}>
                                {status.label}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Calendar size={12} />
                                {election.startDate} — {election.endDate}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="shrink-0 mt-1">
                    {expanded ? (
                        <ChevronUp size={20} className="text-gray-400" />
                    ) : (
                        <ChevronDown size={20} className="text-gray-400" />
                    )}
                </div>
            </button>

            {expanded && (
                <div className="border-t px-6 py-5 bg-gray-50">
                    <div className="space-y-4 text-sm">
                        <div>
                            <span className="text-xs text-gray-500 uppercase font-semibold">Descripción</span>
                            <p className="text-gray-700 mt-1">{election.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-xs text-gray-500 uppercase font-semibold">Fecha de Inicio</span>
                                <p className="text-gray-700 mt-1">{election.startDate}</p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 uppercase font-semibold">Fecha de Cierre</span>
                                <p className="text-gray-700 mt-1">{election.endDate}</p>
                            </div>
                        </div>
                        {election.totalRegisteredVoters !== undefined && (
                            <div>
                                <span className="text-xs text-gray-500 uppercase font-semibold">Votantes Registrados</span>
                                <p className="text-gray-700 mt-1 font-semibold">
                                    {election.totalRegisteredVoters.toLocaleString()}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default function Elecciones() {
    const [elections, setElections] = useState<Election[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchElections = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getActiveElections()
            setElections(data)
        } catch {
            setError("No se pudieron cargar las elecciones. Intente nuevamente.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchElections()
    }, [])

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f6f7]">
            <Header />

            <main className="flex-1 px-6 py-10">
                <div className="max-w-4xl mx-auto">

                    {/* TITLE */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2">Elecciones Activas</h2>
                        <p className="text-gray-600">
                            Consulte las elecciones vigentes y su configuración pública.
                        </p>
                    </div>

                    {/* LOADING */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 size={32} className="animate-spin text-red-500 mb-4" />
                            <p className="text-gray-500">Cargando elecciones...</p>
                        </div>
                    )}

                    {/* ERROR */}
                    {error && !loading && (
                        <div className="bg-white rounded-2xl border p-8 text-center">
                            <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
                            <p className="text-gray-700 font-semibold mb-2">{error}</p>
                            <button
                                onClick={fetchElections}
                                className="text-red-500 text-sm font-medium hover:underline"
                            >
                                Reintentar
                            </button>
                        </div>
                    )}

                    {/* LIST */}
                    {!loading && !error && elections.length > 0 && (
                        <div className="space-y-4">
                            {elections.map((election) => (
                                <ElectionCard key={election.id} election={election} />
                            ))}
                        </div>
                    )}

                    {/* EMPTY */}
                    {!loading && !error && elections.length === 0 && (
                        <div className="bg-white rounded-2xl border p-8 text-center">
                            <Calendar size={40} className="text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-semibold">No hay elecciones activas.</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Las elecciones se publicarán cuando sean programadas.
                            </p>
                        </div>
                    )}

                </div>
            </main>

            <Footer />
        </div>
    )
}
