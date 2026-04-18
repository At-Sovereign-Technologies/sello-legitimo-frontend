import { useState, useEffect } from "react"
import { BarChart3, RefreshCw, Loader2, AlertCircle } from "lucide-react"
import { getElectionResults } from "../api/results.api"
import type { ElectionResults, CandidateResult } from "../types/results"
import Header from "../components/LoginHeader"
import Footer from "../components/Footer"

function ResultBar({ candidate, maxVotes }: { candidate: CandidateResult; maxVotes: number }) {
    const barWidth = maxVotes > 0 ? (candidate.votes / maxVotes) * 100 : 0

    return (
        <div className="bg-white rounded-xl border p-5 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="font-bold text-gray-900">{candidate.name}</p>
                    <p className="text-xs text-gray-500">{candidate.party}</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-extrabold text-gray-900">
                        {candidate.percentage.toFixed(1)}%
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
    const [results, setResults] = useState<ElectionResults | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchResults = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getElectionResults()
            setResults(data)
        } catch {
            setError("No se pudieron cargar los resultados. Intente nuevamente.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchResults()
    }, [])

    const maxVotes = results
        ? Math.max(...results.results.map((r) => r.votes), results.blankVotes, 1)
        : 1

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
                            disabled={loading}
                            className="flex items-center gap-2 border rounded-xl px-4 py-2 text-sm text-gray-700 hover:bg-white transition font-medium disabled:opacity-60 shrink-0"
                        >
                            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                            Actualizar
                        </button>
                    </div>

                    {/* LOADING */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 size={32} className="animate-spin text-red-500 mb-4" />
                            <p className="text-gray-500">Cargando resultados...</p>
                        </div>
                    )}

                    {/* ERROR */}
                    {error && !loading && (
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

                    {/* RESULTS */}
                    {results && !loading && !error && (
                        <>
                            {/* SUMMARY BAR */}
                            <div className="bg-white rounded-2xl border p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                        <BarChart3 size={18} className="text-red-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{results.title}</h3>
                                        <p className="text-xs text-gray-500">
                                            Total de votos: {results.totalVotes.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400">
                                    Última actualización: {results.lastUpdated}
                                </p>
                            </div>

                            {/* CANDIDATE BARS */}
                            <div className="space-y-4 mb-6">
                                {results.results
                                    .slice()
                                    .sort((a, b) => b.votes - a.votes)
                                    .map((candidate) => (
                                        <ResultBar
                                            key={candidate.candidateId}
                                            candidate={candidate}
                                            maxVotes={maxVotes}
                                        />
                                    ))}
                            </div>

                            {/* BLANK VOTES */}
                            <div className="bg-white rounded-xl border p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <p className="font-bold text-gray-900">Votos en Blanco</p>
                                        <p className="text-xs text-gray-500">Voto en blanco</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-extrabold text-gray-900">
                                            {results.totalVotes > 0
                                                ? ((results.blankVotes / results.totalVotes) * 100).toFixed(1)
                                                : "0.0"}
                                            %
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {results.blankVotes.toLocaleString()} votos
                                        </p>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="bg-gray-400 h-3 rounded-full transition-all duration-700 ease-out"
                                        style={{
                                            width: `${maxVotes > 0 ? (results.blankVotes / maxVotes) * 100 : 0
                                                }%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* EMPTY STATE */}
                    {!results && !loading && !error && (
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
