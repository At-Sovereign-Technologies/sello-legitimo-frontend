import { useState, useEffect } from "react"
import { Clock, Loader2, AlertCircle, ShieldCheck } from "lucide-react"
import { getTransparency } from "../api/transparency.api"
import { getActiveElections } from "../api/elections.api"
import type { TransparencyResponse, TransparencyRecord } from "../types/transparency"
import type { Election } from "../types/elections"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"

function RecordTimeline({ records }: { records: TransparencyRecord[] }) {
    return (
        <div className="space-y-4">
            {records.map((record, index) => (
                <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                            <Clock size={14} className="text-red-500" />
                        </div>
                        <div className="w-px flex-1 bg-gray-200 mt-1" />
                    </div>
                    <div className="pb-6 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-gray-900 text-sm">{record.eventType}</span>
                            <span className="text-xs text-gray-400">{record.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{record.description}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function Transparencia() {
    const [elections, setElections] = useState<Election[]>([])
    const [selectedId, setSelectedId] = useState<number | null>(null)
    const [transparency, setTransparency] = useState<TransparencyResponse | null>(null)
    const [eventTypeFilter, setEventTypeFilter] = useState<string>("ALL")
    const [loadingElections, setLoadingElections] = useState(true)
    const [loadingRecords, setLoadingRecords] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searched, setSearched] = useState(false)

    useEffect(() => {
        const fetchElections = async () => {
            try {
                const data = await getActiveElections()
                setElections(data)
                if (data.length > 0) setSelectedId(data[0].id)
            } catch {
                setError("No se pudieron cargar las elecciones disponibles.")
            } finally {
                setLoadingElections(false)
            }
        }
        fetchElections()
    }, [])

    const fetchRecords = async () => {
        if (selectedId === null) return

        setLoadingRecords(true)
        setError(null)
        setTransparency(null)
        setEventTypeFilter("ALL")

        try {
            const data = await getTransparency(selectedId)
            setTransparency(data)
            setSearched(true)
        } catch {
            setError("No se pudieron cargar los registros. Intente nuevamente.")
            setSearched(true)
        } finally {
            setLoadingRecords(false)
        }
    }

    const eventTypes = transparency
        ? ["ALL", ...Array.from(new Set(transparency.records.map((r) => r.eventType)))]
        : ["ALL"]

    const filteredRecords = transparency
        ? eventTypeFilter === "ALL"
            ? transparency.records
            : transparency.records.filter((r) => r.eventType === eventTypeFilter)
        : []

    const selectedElection = elections.find((e) => e.id === selectedId)

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f6f7]">
            <NavBar />

            <main className="flex-1 px-6 py-10">
                <div className="max-w-5xl mx-auto">

                    {/* TITLE */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2">Transparencia Electoral</h2>
                        <p className="text-gray-600">
                            Consulte la trazabilidad y registros del proceso electoral.
                        </p>
                    </div>

                    {/* SELECTOR */}
                    <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
                        <label className="text-xs text-gray-500">ELECCIÓN</label>

                        {loadingElections ? (
                            <div className="flex items-center gap-2 mt-2 text-gray-400 text-sm">
                                <Loader2 size={16} className="animate-spin" />
                                Cargando elecciones...
                            </div>
                        ) : (
                            <select
                                value={selectedId ?? ""}
                                onChange={(e) => {
                                    setSelectedId(Number(e.target.value))
                                    setTransparency(null)
                                    setSearched(false)
                                    setError(null)
                                    setEventTypeFilter("ALL")
                                }}
                                className="w-full border rounded-lg px-3 py-3 mt-1 bg-white text-sm text-gray-700 outline-none cursor-pointer mb-4"
                            >
                                {elections.map((e) => (
                                    <option key={e.id} value={e.id}>
                                        {e.name}
                                    </option>
                                ))}
                            </select>
                        )}

                        <button
                            onClick={fetchRecords}
                            disabled={loadingRecords || selectedId === null || loadingElections}
                            className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {loadingRecords ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                "Consultar Registros"
                            )}
                        </button>
                    </div>

                    {/* ERROR */}
                    {error && !loadingRecords && (
                        <div className="bg-white rounded-2xl border p-8 text-center">
                            <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
                            <p className="text-gray-700 font-semibold mb-2">{error}</p>
                            <button
                                onClick={fetchRecords}
                                className="text-red-500 text-sm font-medium hover:underline"
                            >
                                Reintentar
                            </button>
                        </div>
                    )}

                    {/* LOADING RECORDS */}
                    {loadingRecords && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 size={32} className="animate-spin text-red-500 mb-4" />
                            <p className="text-gray-500">Cargando registros...</p>
                        </div>
                    )}

                    {/* RECORDS */}
                    {transparency && !loadingRecords && !error && (
                        <>
                            {/* SUMMARY */}
                            <div className="bg-white rounded-2xl border p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                        <ShieldCheck size={18} className="text-red-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{selectedElection?.name}</h3>
                                        <p className="text-xs text-gray-500">
                                            {filteredRecords.length} registro{filteredRecords.length !== 1 ? "s" : ""}
                                        </p>
                                    </div>
                                </div>

                                {/* FILTER BY EVENT TYPE */}
                                <select
                                    value={eventTypeFilter}
                                    onChange={(e) => setEventTypeFilter(e.target.value)}
                                    className="border rounded-lg px-3 py-2 bg-white text-sm text-gray-700 outline-none cursor-pointer"
                                >
                                    {eventTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type === "ALL" ? "Todos los eventos" : type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {filteredRecords.length > 0 ? (
                                <div className="bg-white rounded-2xl border shadow-sm p-6">
                                    <RecordTimeline records={filteredRecords} />
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl border p-8 text-center">
                                    <ShieldCheck size={40} className="text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 font-semibold">No hay registros para este filtro.</p>
                                </div>
                            )}
                        </>
                    )}

                    {/* EMPTY STATE */}
                    {searched && !transparency && !loadingRecords && !error && (
                        <div className="bg-white rounded-2xl border p-8 text-center">
                            <ShieldCheck size={40} className="text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-semibold">No hay registros disponibles.</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Los registros se generarán a medida que se ejecute el proceso electoral.
                            </p>
                        </div>
                    )}

                </div>
            </main>

            <Footer />
        </div>
    )
}