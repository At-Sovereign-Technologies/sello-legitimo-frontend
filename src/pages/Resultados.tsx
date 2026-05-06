import { useState, useEffect } from "react"
import {
  BarChart3, Loader2, AlertCircle,
  History, GitCompare, TrendingUp, ChevronDown, ChevronUp, Minus,
} from "lucide-react"
import { getElectionResults, getResultsHistory, getResultsComparison, getResultsTrends } from "../api/results.api"
import { getActiveElections } from "../api/elections.api"
import type { ElectionResults, HistoryEntry, HistoryResponse, ComparisonResponse, TrendsResponse } from "../types/results"
import type { Election } from "../types/elections"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"
import type { CandidateResult } from "../types/results"

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "resultados" | "historico" | "comparacion" | "tendencias"

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ELECTION_TYPES: Record<string, string> = {
  PRESIDENTIAL: "Presidencial",
  SENATE:       "Senado",
  LOCAL:        "Local",
  REFERENDUM:   "Consulta",
}

function trendIcon(trend: string) {
  if (trend === "RISING")  return <ChevronUp   size={14} className="text-green-500" />
  if (trend === "FALLING") return <ChevronDown size={14} className="text-red-500"   />
  return                          <Minus       size={14} className="text-gray-400"  />
}

function trendLabel(trend: string) {
  return trend === "RISING" ? "Subiendo" : trend === "FALLING" ? "Bajando" : "Estable"
}

function trendColor(trend: string) {
  return trend === "RISING" ? "text-green-600 bg-green-50" :
         trend === "FALLING" ? "text-red-500 bg-red-50" :
         "text-gray-500 bg-gray-100"
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ResultBar({ candidate, totalVotes }: { candidate: CandidateResult; totalVotes: number }) {
  const pct = totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0
  return (
    <div className="bg-white rounded-xl border p-5 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-3">
        <p className="font-bold text-gray-900">{candidate.name}</p>
        <div className="text-right">
          <p className="text-2xl font-extrabold text-gray-900">{pct.toFixed(1)}%</p>
          <p className="text-xs text-gray-500">{candidate.votes.toLocaleString()} votos</p>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div className="bg-red-500 h-3 rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-extrabold text-gray-900">{value}</p>
    </div>
  )
}

function ErrorBox({ msg, onRetry }: { msg: string; onRetry?: () => void }) {
  return (
    <div className="bg-white rounded-2xl border p-8 text-center">
      <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
      <p className="text-gray-700 font-semibold mb-2">{msg}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-red-500 text-sm font-medium hover:underline">
          Reintentar
        </button>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 size={32} className="animate-spin text-red-500 mb-4" />
      <p className="text-gray-500">Cargando...</p>
    </div>
  )
}

// ─── TAB: RESULTADOS (original) ───────────────────────────────────────────────
function TabResultados({ elections }: { elections: Election[] }) {
  const [selectedId, setSelectedId]   = useState<number | null>(elections[0]?.id ?? null)
  const [results, setResults]         = useState<ElectionResults | null>(null)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [searched, setSearched]       = useState(false)

  const fetch = async () => {
    if (selectedId === null) return
    setLoading(true); setError(null); setResults(null)
    try {
      setResults(await getElectionResults(selectedId))
      setSearched(true)
    } catch {
      setError("No se pudieron cargar los resultados.")
      setSearched(true)
    } finally { setLoading(false) }
  }

  const selected = elections.find(e => e.id === selectedId)

  return (
    <div className="space-y-6">
      {/* Selector */}
      <div className="bg-white rounded-2xl border p-6">
        <label className="text-xs text-gray-500">ELECCIÓN</label>
        <select
          value={selectedId ?? ""}
          onChange={e => { setSelectedId(Number(e.target.value)); setResults(null); setSearched(false); setError(null) }}
          className="w-full border rounded-lg px-3 py-3 mt-1 bg-white text-sm text-gray-700 outline-none cursor-pointer mb-4"
        >
          {elections.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <button
          onClick={fetch}
          disabled={loading || selectedId === null}
          className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : "Consultar Resultados"}
        </button>
      </div>

      {error && !loading && <ErrorBox msg={error} onRetry={fetch} />}
      {loading && <Spinner />}

      {results && !loading && !error && (
        <>
          <div className="bg-white rounded-2xl border p-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <BarChart3 size={18} className="text-red-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{selected?.name}</h3>
              <p className="text-xs text-gray-500">Total: {results.totalVotes.toLocaleString()} votos</p>
            </div>
          </div>
          <div className="space-y-4">
            {results.candidates.slice().sort((a, b) => b.votes - a.votes).map(c => (
              <ResultBar key={c.name} candidate={c} totalVotes={results.totalVotes} />
            ))}
          </div>
        </>
      )}

      {searched && !results && !loading && !error && (
        <div className="bg-white rounded-2xl border p-8 text-center">
          <BarChart3 size={40} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-semibold">No hay resultados disponibles.</p>
        </div>
      )}
    </div>
  )
}

// ─── TAB: HISTÓRICO ───────────────────────────────────────────────────────────
function TabHistorico() {
  const [data, setData]       = useState<HistoryResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [typeFilter, setType] = useState("")
  const [candFilter, setCand] = useState("")

  const fetch = async () => {
    setLoading(true); setError(null)
    try {
      setData(await getResultsHistory({
        type:      typeFilter || undefined,
        candidate: candFilter || undefined,
      }))
    } catch {
      setError("No se pudo cargar el histórico.")
    } finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  const typeColor: Record<string, string> = {
    PRESIDENTIAL: "bg-purple-100 text-purple-700",
    SENATE:       "bg-blue-100 text-blue-700",
    LOCAL:        "bg-green-100 text-green-700",
    REFERENDUM:   "bg-yellow-100 text-yellow-700",
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white rounded-2xl border p-5 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
          <label className="text-xs text-gray-400 uppercase tracking-wide">Tipo</label>
          <select
            value={typeFilter}
            onChange={e => setType(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm text-gray-700 outline-none bg-white"
          >
            <option value="">Todos</option>
            <option value="PRESIDENTIAL">Presidencial</option>
            <option value="SENATE">Senado</option>
            <option value="LOCAL">Local</option>
            <option value="REFERENDUM">Consulta</option>
          </select>
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
          <label className="text-xs text-gray-400 uppercase tracking-wide">Candidato</label>
          <input
            type="text"
            placeholder="Nombre..."
            value={candFilter}
            onChange={e => setCand(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm text-gray-700 outline-none"
          />
        </div>
        <button
          onClick={fetch}
          disabled={loading}
          className="bg-red-500 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition disabled:opacity-60"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : "Filtrar"}
        </button>
      </div>

      {/* Stats */}
      {data && !loading && (
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Total elecciones" value={data.totalElections} />
          <StatCard label="Votos históricos"  value={data.totalVotesCast.toLocaleString()} />
        </div>
      )}

      {error  && <ErrorBox msg={error} onRetry={fetch} />}
      {loading && <Spinner />}

      {/* Tabla */}
      {data && !loading && (
        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Elección","Tipo","Fecha","Votos","Ganador","%"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.elections.map((e: HistoryEntry) => (
                  <tr key={e.electionId} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-semibold text-gray-900">{e.electionName}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${typeColor[e.electionType] ?? "bg-gray-100 text-gray-600"}`}>
                        {ELECTION_TYPES[e.electionType] ?? e.electionType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{e.date}</td>
                    <td className="px-4 py-3 text-gray-700">{e.totalVotes.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-900">{e.winner}</td>
                    <td className="px-4 py-3 font-bold text-red-500">{e.winnerPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.elections.length === 0 && (
            <div className="p-8 text-center text-gray-400">No hay elecciones para los filtros seleccionados.</div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── TAB: COMPARACIÓN ─────────────────────────────────────────────────────────
function TabComparacion({ elections }: { elections: Election[] }) {
  const [selected, setSelected] = useState<number[]>([])
  const [data, setData]         = useState<ComparisonResponse | null>(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const toggle = (id: number) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const fetch = async () => {
    if (selected.length < 2) return
    setLoading(true); setError(null)
    try { setData(await getResultsComparison(selected)) }
    catch { setError("No se pudo cargar la comparación.") }
    finally { setLoading(false) }
  }

  const COLORS = ["#ef4444","#3b82f6","#10b981","#f59e0b","#8b5cf6","#ec4899"]

  return (
    <div className="space-y-6">
      {/* Selector de elecciones */}
      <div className="bg-white rounded-2xl border p-5">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Selecciona elecciones a comparar (mín. 2)</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {elections.map(e => (
            <button
              key={e.id}
              onClick={() => toggle(e.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
                selected.includes(e.id)
                  ? "bg-red-500 text-white border-red-500"
                  : "bg-white text-gray-700 border-gray-200 hover:border-red-300"
              }`}
            >
              {e.name}
            </button>
          ))}
        </div>
        <button
          onClick={fetch}
          disabled={selected.length < 2 || loading}
          className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : "Comparar"}
        </button>
        {selected.length === 1 && (
          <p className="text-xs text-center text-gray-400 mt-2">Selecciona al menos una elección más</p>
        )}
      </div>

      {error  && <ErrorBox msg={error} onRetry={fetch} />}
      {loading && <Spinner />}

      {data && !loading && (
        <div className="space-y-4">
          {data.candidates.slice(0, 6).map((c, i) => (
            <div key={c.name} className="bg-white rounded-2xl border p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="font-bold text-gray-900">{c.name}</span>
                </div>
              </div>
              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${data.electionNames.length}, 1fr)` }}>
                {data.electionNames.map((name, j) => (
                  <div key={name} className="text-center">
                    <p className="text-xs text-gray-400 mb-1 truncate">{name}</p>
                    <p className="text-xl font-extrabold" style={{ color: COLORS[i % COLORS.length] }}>
                      {c.percentages[j]?.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">{c.votes[j]?.toLocaleString()} votos</p>
                    {/* mini bar */}
                    <div className="mt-2 w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-700"
                        style={{ width: `${c.percentages[j] ?? 0}%`, background: COLORS[i % COLORS.length] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── TAB: TENDENCIAS ──────────────────────────────────────────────────────────
function TabTendencias() {
  const [data, setData]       = useState<TrendsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const fetch = async () => {
    setLoading(true); setError(null)
    try { setData(await getResultsTrends()) }
    catch { setError("No se pudieron cargar las tendencias.") }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  const maxVotes = data ? Math.max(...data.totalVotesPerElection) : 1

  return (
    <div className="space-y-6">
      {error  && <ErrorBox msg={error} onRetry={fetch} />}
      {loading && <Spinner />}

      {data && !loading && (
        <>
          {/* Participación global */}
          <div className="bg-white rounded-2xl border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Participación por elección</h3>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 ${trendColor(data.participationTrend)}`}>
                {trendIcon(data.participationTrend)} {trendLabel(data.participationTrend)}
              </span>
            </div>
            <div className="flex items-end gap-3 h-36">
              {data.labels.map((label, i) => {
                const h = (data.totalVotesPerElection[i] / maxVotes) * 100
                return (
                  <div key={label} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-gray-700">
                      {(data.totalVotesPerElection[i] / 1_000_000).toFixed(1)}M
                    </span>
                    <div className="w-full rounded-t-lg bg-red-500 transition-all duration-700" style={{ height: `${h}%` }} />
                    <span className="text-xs text-gray-400 text-center leading-tight">{label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tendencias por candidato */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-800 px-1">Tendencia por candidato</h3>
            {data.candidateTrends.slice(0, 8).map(c => {
              const maxPct = Math.max(...c.percentages, 1)
              return (
                <div key={c.name} className="bg-white rounded-2xl border p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900">{c.name}</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${trendColor(c.trend)}`}>
                      {trendIcon(c.trend)} {trendLabel(c.trend)}
                    </span>
                  </div>
                  <div className="flex items-end gap-2 h-16">
                    {data.labels.map((label, i) => {
                      const h = (c.percentages[i] / maxPct) * 100
                      return (
                        <div key={label} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-xs font-bold text-gray-600">{c.percentages[i].toFixed(1)}%</span>
                          <div
                            className="w-full rounded-t bg-red-400 transition-all duration-700"
                            style={{ height: `${Math.max(h, 4)}%` }}
                          />
                          <span className="text-xs text-gray-400 text-center truncate w-full">{label.split(" ")[0]}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "resultados",  label: "Resultados",  icon: <BarChart3   size={15} /> },
  { id: "historico",   label: "Histórico",   icon: <History     size={15} /> },
  { id: "comparacion", label: "Comparación", icon: <GitCompare  size={15} /> },
  { id: "tendencias",  label: "Tendencias",  icon: <TrendingUp  size={15} /> },
]

export default function Resultados() {
  const [activeTab, setActiveTab]         = useState<Tab>("resultados")
  const [elections, setElections]         = useState<Election[]>([])
  const [loadingElections, setLoadingEl]  = useState(true)
  const [electionError, setElectionError] = useState(false)

  useEffect(() => {
    getActiveElections()
      .then(setElections)
      .catch(() => setElectionError(true))
      .finally(() => setLoadingEl(false))
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f6f7]">
      <NavBar />

      <main className="flex-1 px-6 py-10">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold">Resultados Electorales</h2>
              <p className="text-gray-600 mt-1">Consulta resultados, histórico, comparativas y tendencias.</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white border rounded-2xl p-1 mb-6 shadow-sm">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition ${
                  activeTab === t.id
                    ? "bg-red-500 text-white shadow"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          {loadingElections ? (
            <Spinner />
          ) : electionError ? (
            <ErrorBox msg="No se pudieron cargar las elecciones." />
          ) : (
            <>
              {activeTab === "resultados"  && <TabResultados  elections={elections} />}
              {activeTab === "historico"   && <TabHistorico />}
              {activeTab === "comparacion" && <TabComparacion elections={elections} />}
              {activeTab === "tendencias"  && <TabTendencias  />}
            </>
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}