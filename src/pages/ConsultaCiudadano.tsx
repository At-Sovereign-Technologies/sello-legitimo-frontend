import { useState } from "react"
import { Search, MapPin, CheckCircle, XCircle, Loader2, AlertTriangle, Info } from "lucide-react"
import { getCitizen } from "../api/citizen.api"
import type { CitizenResponse } from "../types/citizen"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"

const resolveApiError = (err: unknown, fallback: string): string => {
    if (typeof err === "object" && err !== null) {
        const maybeResponse = (err as { response?: { data?: { message?: unknown } } }).response
        const message = maybeResponse?.data?.message
        if (typeof message === "string" && message.trim().length > 0) return message
    }
    return fallback
}

export default function ConsultaCiudadano() {
    const [document, setDocument] = useState("")
    const [result, setResult] = useState<CitizenResponse | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searched, setSearched] = useState(false)

    const handleSearch = async () => {
        if (!document.trim()) {
            setError("Ingrese su número de documento.")
            return
        }

        setLoading(true)
        setError(null)
        setResult(null)

        try {
            const data = await getCitizen(document)
            setResult(data)
            setSearched(true)
        } catch (err: unknown) {
            setError(resolveApiError(err, "No se pudo completar la consulta. Intente nuevamente."))
            setSearched(true)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f6f7]">
            <NavBar />

            <main className="flex-1 px-6 py-10">
                <div className="max-w-3xl mx-auto">

                    {/* TITLE */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2">Consulta Ciudadana</h2>
                        <p className="text-gray-600">
                            Consulte su puesto de votación asignado y verifique su estado de participación electoral.
                        </p>
                    </div>

                    {/* SEARCH FORM */}
                    <div className="bg-white rounded-2xl shadow-sm border p-8 mb-6">
                        <label className="text-xs text-gray-500">NÚMERO DE CÉDULA</label>
                        <div className="flex items-center border rounded-lg px-3 py-3 mt-1 bg-white mb-4">
                            <Search size={16} className="text-gray-400 mr-2" />
                            <input
                                value={document}
                                onChange={(e) => setDocument(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="w-full outline-none"
                                placeholder="Ingrese su número de identificación"
                            />
                        </div>

                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {loading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                "Consultar"
                            )}
                        </button>
                    </div>

                    {/* ERROR */}
                    {error && (
                        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* RESULTS */}
                    {searched && !error && result && (
                        <>
                            {/* FINES ALERT */}
                            {result.hasFines && (
                                <div className="mb-6 px-5 py-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                                        <AlertTriangle size={18} className="text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-amber-800 text-sm">Multa pendiente por inasistencia electoral</p>
                                        <p className="text-amber-700 text-sm mt-1">
                                            Usted tiene una multa registrada por no haber ejercido su derecho al voto en una elección anterior.
                                            Acérquese a la registraduría más cercana para más información.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-6">

                                {/* STATION CARD */}
                                <div className="bg-white rounded-2xl shadow-sm border p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                            <MapPin size={18} className="text-red-500" />
                                        </div>
                                        <h3 className="font-bold text-gray-900">Puesto de Votación</h3>
                                    </div>

                                    {result.pollingStation ? (
                                        <div className="space-y-3 text-sm">
                                            <div>
                                                <span className="text-xs text-gray-500 uppercase">Puesto Asignado</span>
                                                <p className="font-semibold text-gray-800">{result.pollingStation}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">
                                            No se encontró información del puesto de votación.
                                        </p>
                                    )}
                                </div>

                                {/* PARTICIPATION CARD */}
                                <div className="bg-white rounded-2xl shadow-sm border p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${result.status === "VOTED" ? "bg-green-100" : "bg-yellow-100"}`}>
                                            {result.status === "VOTED" ? (
                                                <CheckCircle size={18} className="text-green-600" />
                                            ) : (
                                                <XCircle size={18} className="text-yellow-600" />
                                            )}
                                        </div>
                                        <h3 className="font-bold text-gray-900">Estado de Participación</h3>
                                    </div>

                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <span className="text-xs text-gray-500 uppercase">Cédula</span>
                                            <p className="font-semibold text-gray-800">{result.document}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 uppercase">Estado</span>
                                            <p className={`font-bold ${result.status === "VOTED" ? "text-green-600" : "text-yellow-600"}`}>
                                                {result.status === "VOTED" ? "Ha ejercido su voto" : "No ha votado"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* MANDATORY VOTING CARD */}
                                {result.isMandatory && (
                                    <div className="bg-white rounded-2xl shadow-sm border p-6 md:col-span-2">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <Info size={18} className="text-blue-600" />
                                            </div>
                                            <h3 className="font-bold text-gray-900">Obligatoriedad del Voto</h3>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Su participación en esta elección es <span className="font-bold text-blue-700">obligatoria</span>.
                                            El incumplimiento puede generar sanciones de acuerdo con la normatividad electoral vigente.
                                        </p>
                                    </div>
                                )}

                            </div>
                        </>
                    )}

                </div>
            </main>

            <Footer />
        </div>
    )
}
