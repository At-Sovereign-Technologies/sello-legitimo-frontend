import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
    Accessibility,
    ShieldCheck,
    UserCheck,
    UserX,
    AlertCircle,
    Loader2,
    ArrowRight,
} from "lucide-react";
import axios from "axios";
import { registrarAsistencia } from "../api/asistencia.api";
import type {
    SolicitudAsistencia,
    TipoAsistencia,
} from "../types/asistencia";
import Footer from "../components/Footer";

// SE-M3-05: pantalla del jurado para registrar voto asistido antes de
// abrir la sesión del votante en el tarjetón.

const TIPOS: { valor: TipoAsistencia; etiqueta: string; descripcion: string }[] = [
    { valor: "Discapacidad", etiqueta: "Discapacidad", descripcion: "Discapacidad fisica, visual, motora o cognitiva." },
    { valor: "EdadAvanzada", etiqueta: "Edad avanzada", descripcion: "Adulto mayor que requiere acompanamiento." },
    { valor: "Analfabetismo", etiqueta: "Analfabetismo", descripcion: "Dificultad para leer o escribir el tarjeton." },
    { valor: "Otra", etiqueta: "Otra", descripcion: "Otra razon legalmente reconocida." },
];

export default function AsistenciaJurado() {
    const navigate = useNavigate();
    const [documentoVotante, setDocumentoVotante] = useState("");
    const [documentoAcompanante, setDocumentoAcompanante] = useState("");
    const [esFamiliar, setEsFamiliar] = useState(false);
    const [tipo, setTipo] = useState<TipoAsistencia>("Discapacidad");
    const [mesaId, setMesaId] = useState("MESA_001");
    const [jornadaId, setJornadaId] = useState("JORNADA_2026_PRESIDENCIAL");
    const [juradoId, setJuradoId] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [bloqueado, setBloqueado] = useState<string | null>(null);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setBloqueado(null);

        if (documentoVotante.trim().length < 5 || documentoAcompanante.trim().length < 5) {
            setError("Los documentos deben tener al menos 5 caracteres.");
            return;
        }
        if (documentoVotante.trim() === documentoAcompanante.trim()) {
            setError("El votante y el acompanante no pueden tener el mismo documento.");
            return;
        }

        const payload: SolicitudAsistencia = {
            documentoVotante: documentoVotante.trim(),
            documentoAcompanante: documentoAcompanante.trim(),
            esFamiliar,
            tipoAsistencia: tipo,
            mesaId: mesaId.trim(),
            jornadaId: jornadaId.trim(),
            juradoId: juradoId.trim() || "JURADO_ANONIMO",
        };

        setEnviando(true);
        try {
            const respuesta = await registrarAsistencia(payload);
            // CA #1: registrada antes de iniciar la sesion. Redirigir al
            // tarjeton con tokenAsistencia para que cuando el votante emita
            // su voto, el backend pueda vincular la asistencia.
            const params = new URLSearchParams({
                handshakeId: respuesta.registroId,
                tokenAsistencia: respuesta.sesionToken,
                circunscripcion: mesaId,
            });
            navigate(`/tarjeton?${params.toString()}`);
        } catch (e) {
            // CA #4: bloqueo por exceso de limite -> 409 Conflict.
            if (axios.isAxiosError(e) && e.response?.status === 409) {
                const detalle = e.response.data?.mensaje ?? "Acompanante excede el limite.";
                setBloqueado(detalle);
            } else if (axios.isAxiosError(e) && e.response?.data?.mensaje) {
                setError(e.response.data.mensaje);
            } else {
                setError(e instanceof Error ? e.message : "Error registrando la asistencia.");
            }
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f6f7] font-sans">
            <header className="w-full border-b bg-white px-8 py-3 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                        <Accessibility size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-base leading-none">Voto asistido</h1>
                        <p className="text-[10px] text-red-500 font-bold tracking-wider uppercase">
                            Modulo del jurado · SE-M3-05
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigate("/")}
                    className="text-sm font-semibold text-gray-600 hover:text-gray-900"
                >
                    Volver
                </button>
            </header>

            <main className="flex-1 px-6 py-10 max-w-2xl mx-auto w-full">
                <div className="bg-white border rounded-2xl p-8 shadow-sm">
                    <div className="flex items-start gap-3 mb-6">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                            <ShieldCheck size={22} className="text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-gray-900">
                                Registrar asistencia
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Capture los datos del votante y del acompanante
                                antes de abrir la sesion. El sistema validara
                                que el acompanante no exceda el limite legal
                                para acompanantes no-familiares.
                            </p>
                        </div>
                    </div>

                    {bloqueado && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex items-start gap-3">
                            <UserX size={20} className="text-red-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-red-700 text-sm">
                                    Asistencia bloqueada
                                </p>
                                <p className="text-xs text-red-600 mt-1 leading-relaxed">
                                    {bloqueado}
                                </p>
                                <p className="text-xs text-red-500 mt-2">
                                    El acompanante propuesto no puede continuar.
                                    Solicite otro acompanante o registre la
                                    relacion como familiar si aplica.
                                </p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 flex items-start gap-3">
                            <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-700">{error}</p>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                    Documento votante
                                </label>
                                <input
                                    type="text"
                                    value={documentoVotante}
                                    onChange={(e) => setDocumentoVotante(e.target.value)}
                                    required
                                    placeholder="1010101010"
                                    className="w-full mt-2 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                />
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                    Documento acompanante
                                </label>
                                <input
                                    type="text"
                                    value={documentoAcompanante}
                                    onChange={(e) => setDocumentoAcompanante(e.target.value)}
                                    required
                                    placeholder="2020202020"
                                    className="w-full mt-2 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                />
                            </div>
                        </div>

                        <label className="flex items-start gap-3 border rounded-xl p-3 cursor-pointer hover:bg-gray-50 transition">
                            <input
                                type="checkbox"
                                checked={esFamiliar}
                                onChange={(e) => setEsFamiliar(e.target.checked)}
                                className="mt-1"
                            />
                            <div>
                                <p className="font-semibold text-sm text-gray-800">
                                    El acompanante es familiar del votante
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                                    Marque solo si verifico la relacion (parentesco,
                                    matrimonio, union marital). Familiares no estan
                                    sujetos al limite de "un acompanante por jornada".
                                </p>
                            </div>
                        </label>

                        <div>
                            <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2 block">
                                Tipo de asistencia
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {TIPOS.map((t) => (
                                    <button
                                        type="button"
                                        key={t.valor}
                                        onClick={() => setTipo(t.valor)}
                                        className={`text-left border rounded-xl p-3 transition ${
                                            tipo === t.valor
                                                ? "border-red-500 bg-red-50"
                                                : "border-gray-200 hover:bg-gray-50"
                                        }`}
                                    >
                                        <p className="font-bold text-sm text-gray-800">
                                            {t.etiqueta}
                                        </p>
                                        <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
                                            {t.descripcion}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                    Mesa
                                </label>
                                <input
                                    type="text"
                                    value={mesaId}
                                    onChange={(e) => setMesaId(e.target.value)}
                                    required
                                    className="w-full mt-2 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                />
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                    Jornada
                                </label>
                                <input
                                    type="text"
                                    value={jornadaId}
                                    onChange={(e) => setJornadaId(e.target.value)}
                                    required
                                    className="w-full mt-2 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                />
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                    ID jurado
                                </label>
                                <input
                                    type="text"
                                    value={juradoId}
                                    onChange={(e) => setJuradoId(e.target.value)}
                                    placeholder="JURADO_001"
                                    className="w-full mt-2 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={enviando}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold uppercase tracking-wide text-sm px-6 py-3 rounded-xl"
                        >
                            {enviando ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Registrando...
                                </>
                            ) : (
                                <>
                                    <UserCheck size={16} />
                                    Registrar y abrir tarjeton
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
}
