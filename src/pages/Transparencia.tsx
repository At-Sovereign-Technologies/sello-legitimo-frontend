import { useState, useEffect } from "react"
import {
    FileText,
    ShieldCheck,
    ShieldX,
    Clock,
    Loader2,
    AlertCircle,
    ClipboardList,
} from "lucide-react"
import { getActas, getAuditTrail } from "../api/transparency.api"
import type { Acta, AuditEntry } from "../types/transparency"
import Header from "../components/LoginHeader"
import Footer from "../components/Footer"

type Tab = "actas" | "auditoria"

function ActasTable({ actas }: { actas: Acta[] }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b text-left text-xs text-gray-500 uppercase">
                        <th className="py-3 px-4 font-semibold">Mesa</th>
                        <th className="py-3 px-4 font-semibold">Puesto</th>
                        <th className="py-3 px-4 font-semibold text-center">Votos</th>
                        <th className="py-3 px-4 font-semibold text-center">Verificada</th>
                        <th className="py-3 px-4 font-semibold">Firma Digital</th>
                        <th className="py-3 px-4 font-semibold">Fecha</th>
                    </tr>
                </thead>
                <tbody>
                    {actas.map((acta) => (
                        <tr key={acta.id} className="border-b hover:bg-gray-50 transition">
                            <td className="py-3 px-4 font-medium text-gray-900">{acta.stationId}</td>
                            <td className="py-3 px-4 text-gray-700">{acta.stationName}</td>
                            <td className="py-3 px-4 text-center font-semibold text-gray-900">
                                {acta.totalVotes.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-center">
                                {acta.verified ? (
                                    <span className="inline-flex items-center gap-1 text-green-600 font-semibold text-xs">
                                        <ShieldCheck size={14} /> Sí
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-yellow-600 font-semibold text-xs">
                                        <ShieldX size={14} /> Pendiente
                                    </span>
                                )}
                            </td>
                            <td className="py-3 px-4 text-gray-500 font-mono text-xs">
                                {acta.digitalSignature.length > 16
                                    ? `${acta.digitalSignature.slice(0, 16)}…`
                                    : acta.digitalSignature}
                            </td>
                            <td className="py-3 px-4 text-gray-500 text-xs">{acta.createdAt}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function AuditTimeline({ entries }: { entries: AuditEntry[] }) {
    return (
        <div className="space-y-4">
            {entries.map((entry) => (
                <div key={entry.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                            <Clock size={14} className="text-red-500" />
                        </div>
                        <div className="w-px flex-1 bg-gray-200 mt-1" />
                    </div>
                    <div className="pb-6 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-gray-900 text-sm">{entry.action}</span>
                            <span className="text-xs text-gray-400">{entry.timestamp}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">Actor: {entry.actor}</p>
                        <p className="text-sm text-gray-700 mt-1">{entry.details}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function Transparencia() {
    const [tab, setTab] = useState<Tab>("actas")
    const [actas, setActas] = useState<Acta[]>([])
    const [audit, setAudit] = useState<AuditEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = async (activeTab: Tab) => {
        setLoading(true)
        setError(null)
        try {
            if (activeTab === "actas") {
                const data = await getActas()
                setActas(data)
            } else {
                const data = await getAuditTrail()
                setAudit(data)
            }
        } catch {
            setError("No se pudieron cargar los datos. Intente nuevamente.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData(tab)
    }, [tab])

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f6f7]">
            <Header />

            <main className="flex-1 px-6 py-10">
                <div className="max-w-5xl mx-auto">

                    {/* TITLE */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2">Transparencia Electoral</h2>
                        <p className="text-gray-600">
                            Consulte actas oficiales, registros de auditoría y la trazabilidad del proceso electoral.
                        </p>
                    </div>

                    {/* TABS */}
                    <div className="flex gap-2 mb-6">
                        <button
                            onClick={() => setTab("actas")}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition ${tab === "actas"
                                    ? "bg-red-500 text-white"
                                    : "bg-white border text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            <FileText size={15} />
                            Actas Oficiales
                        </button>
                        <button
                            onClick={() => setTab("auditoria")}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition ${tab === "auditoria"
                                    ? "bg-red-500 text-white"
                                    : "bg-white border text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            <ClipboardList size={15} />
                            Auditoría
                        </button>
                    </div>

                    {/* LOADING */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 size={32} className="animate-spin text-red-500 mb-4" />
                            <p className="text-gray-500">Cargando datos...</p>
                        </div>
                    )}

                    {/* ERROR */}
                    {error && !loading && (
                        <div className="bg-white rounded-2xl border p-8 text-center">
                            <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
                            <p className="text-gray-700 font-semibold mb-2">{error}</p>
                            <button
                                onClick={() => fetchData(tab)}
                                className="text-red-500 text-sm font-medium hover:underline"
                            >
                                Reintentar
                            </button>
                        </div>
                    )}

                    {/* ACTAS TAB */}
                    {!loading && !error && tab === "actas" && (
                        actas.length > 0 ? (
                            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                                <ActasTable actas={actas} />
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border p-8 text-center">
                                <FileText size={40} className="text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 font-semibold">No hay actas disponibles.</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    Las actas se publicarán una vez se generen en las mesas de votación.
                                </p>
                            </div>
                        )
                    )}

                    {/* AUDIT TAB */}
                    {!loading && !error && tab === "auditoria" && (
                        audit.length > 0 ? (
                            <div className="bg-white rounded-2xl border shadow-sm p-6">
                                <AuditTimeline entries={audit} />
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border p-8 text-center">
                                <ClipboardList size={40} className="text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 font-semibold">No hay registros de auditoría.</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    Los registros se generarán a medida que se ejecute el proceso electoral.
                                </p>
                            </div>
                        )
                    )}

                </div>
            </main>

            <Footer />
        </div>
    )
}
