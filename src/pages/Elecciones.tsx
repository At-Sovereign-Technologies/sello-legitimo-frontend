import { useState, useEffect } from "react"
import { Calendar, Loader2, AlertCircle, Vote, Search } from "lucide-react"
import { getActiveElections } from "../api/elections.api"
import type { Election } from "../types/elections"
import Header from "../components/LoginHeader"
import Footer from "../components/Footer"

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
    ACTIVE: { label: "Activa", bg: "bg-green-100", text: "text-green-700" },
    UPCOMING: { label: "Próxima", bg: "bg-blue-100", text: "text-blue-700" },
    COMPLETED: { label: "Finalizada", bg: "bg-gray-100", text: "text-gray-600" },
}

function ElectionCard({ election }: { election: Election }) {
    const normalizedStatus = election.status?.toUpperCase()
    const status = statusConfig[normalizedStatus] ?? { label: election.status, bg: "bg-gray-100", text: "text-gray-600" }

    return (
        <div className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition overflow-hidden">
            <div className="w-full text-left p-6 flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Vote size={18} className="text-red-500" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg">{election.name}</h3>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${status.bg} ${status.text}`}>
                                {status.label}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function Elecciones() {
    const [elections, setElections] = useState<Election[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("ALL")

    const fetchElections = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getActiveElections()
            console.log("elections:", data)
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

    const filtered = elections.filter((e) => {
        const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = statusFilter === "ALL" || e.status?.toUpperCase() === statusFilter
        return matchesSearch && matchesStatus
    })

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

                    {/* SEARCH & FILTER */}
                    {!loading && !error && (
                        <div className="flex flex-col sm:flex-row gap-3 mb-6">
                            <div className="flex items-center border rounded-lg px-3 py-2.5 bg-white flex-1">
                                <Search size={16} className="text-gray-400 mr-2 shrink-0" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full outline-none text-sm"
                                    placeholder="Buscar por nombre..."
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border rounded-lg px-3 py-2.5 bg-white text-sm text-gray-700 outline-none cursor-pointer"
                            >
                                <option value="ALL">Todos los estados</option>
                                <option value="ACTIVE">Activa</option>
                                <option value="UPCOMING">Próxima</option>
                                <option value="COMPLETED">Finalizada</option>
                            </select>
                        </div>
                    )}

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
                    {!loading && !error && filtered.length > 0 && (
                        <div className="space-y-4">
                            {filtered.map((election) => (
                                <ElectionCard key={election.id} election={election} />
                            ))}
                        </div>
                    )}

                    {/* EMPTY */}
                    {!loading && !error && filtered.length === 0 && (
                        <div className="bg-white rounded-2xl border p-8 text-center">
                            <Calendar size={40} className="text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-semibold">No se encontraron elecciones.</p>
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