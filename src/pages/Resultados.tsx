import { useState, useEffect } from "react"
import { BarChart3, RefreshCw, Loader2, AlertCircle } from "lucide-react"
import { getElectionResults } from "../api/results.api"
import { getActiveElections } from "../api/elections.api"
import type { ElectionResults } from "../types/results"
import type { Election } from "../types/elections"
import Header from "../components/LoginHeader"
import Footer from "../components/Footer"
import type { CandidateResult } from "../types/results"

function ResultBar({ candidate, maxVotes, totalVotes }: { candidate: CandidateResult; maxVotes: number; totalVotes: number }) {
    const barWidth = maxVotes > 0 ? (candidate.votes / maxVotes) * 100 : 0
    const percentage = totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0

    return (
        <div className="bg-white rounded-xl border p-5 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="font-bold text-gray-900">{candidate.name}</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-extrabold text-gray-900">
                        {percentage.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">
                        {candidate.votes.toLocaleString()} votos
                    </p>
                </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                    className="bg-red-500 h-3 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${barWidth}%` }}
                />
            </div>
        </div>
    )
}

export default function Resultados() {
    const [elections, setElections] = useState<Election[]>([])
    const [selectedId, setSelectedId] = useState<number | null>(null)
    const [results, setResults] = useState<ElectionResults | null>(null)
    const [loadingElections, setLoadingElections] = useState(true)
    const [loadingResults, setLoadingResults] = useState(false)
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

    const fetchResults = async () => {
        if (selectedId === null) return

        setLoadingResults(true)
        setError(null)
        setResults(null)

        try {
            const data = await getElectionResults(selectedId)
            setResults(data)
            setSearched(true)
        } catch {
            setError("No se pudieron cargar los resultados. Intente nuevamente.")
            setSearched(true)
        } finally {
            setLoadingResults(false)
        }
    }

    const maxVotes = results
        ? Math.max(...results.candidates.map((c) => c.votes), 1)
        : 1

    const selectedElection = elections.find((e) => e.id === selectedId)

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f6f7]">
            <Header />

            <main className="flex-1 px-6 py-10">
                <div className="max-w-4xl mx-auto">

                    {/* TITLE */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                        <div>
                            <h2 className="text-3xl font-bold">Resultados Electorales</h2>
                            <p className="text-gray-600 mt-1">
                                Resultados agregados en tiempo real del proceso electoral.
                            </p>
                        </div>
                        <button
                            onClick={fetchResults}
                            disabled={loadingResults || selectedId === null}
                            className="flex items-center gap-2 border rounded-xl px-4 py-2 text-sm text-gray-700 hover:bg-white transition font-medium disabled:opacity-60 shrink-0"
                        >
                            <RefreshCw size={15} className={loadingResults ? "animate-spin" : ""} />
                            Actualizar
                        </button>
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
                                    setResults(null)
                                    setSearched(false)
                                    setError(null)
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
                            onClick={fetchResults}
                            disabled={loadingResults || selectedId === null || loadingElections}
                            className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {loadingResults ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                "Consultar Resultados"
                            )}
                        </button>
                    </div>

                    {/* ERROR */}
                    {error && !loadingResults && (
                        <div className="bg-white rounded-2xl border p-8 text-center">
                            <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
                            <p className="text-gray-700 font-semibold mb-2">{error}</p>
                            <button
                                onClick={fetchResults}
                                className="text-red-500 text-sm font-medium hover:underline"
                            >
                                Reintentar
                            </button>
                        </div>
                    )}

                    {/* LOADING RESULTS */}
                    {loadingResults && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 size={32} className="animate-spin text-red-500 mb-4" />
                            <p className="text-gray-500">Cargando resultados...</p>
                        </div>
                    )}

                    {/* RESULTS */}
                    {results && !loadingResults && !error && (
                        <>
                            {/* SUMMARY */}
                            <div className="bg-white rounded-2xl border p-6 mb-6 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                    <BarChart3 size={18} className="text-red-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{selectedElection?.name}</h3>
                                    <p className="text-xs text-gray-500">
                                        Total de votos: {results.totalVotes.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* CANDIDATE BARS */}
                            <div className="space-y-4">
                                {results.candidates
                                    .slice()
                                    .sort((a, b) => b.votes - a.votes)
                                    .map((candidate) => (
                                        <ResultBar
                                            key={candidate.name}
                                            candidate={candidate}
                                            maxVotes={maxVotes}
                                            totalVotes={results.totalVotes}
                                        />
                                    ))}
                            </div>
                        </>
                    )}

                    {/* EMPTY STATE */}
                    {searched && !results && !loadingResults && !error && (
                        <div className="bg-white rounded-2xl border p-8 text-center">
                            <BarChart3 size={40} className="text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-semibold">No hay resultados disponibles.</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Los resultados se publicarán una vez inicie el conteo.
                            </p>
                        </div>
                    )}

                </div>
            </main>

            <Footer />
        </div>
    )
}