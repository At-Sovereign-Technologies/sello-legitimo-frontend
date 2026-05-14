import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { emitirPresencial, emitirRemoto } from "../api/emision.api";
import type {
    EmisionVoto,
    CanalVoto,
    ComprobanteVoto,
} from "../types/emision";
import Footer from "../components/Footer";

// SE-M3-01 / SE-M3-02 — pantalla obligatoria de confirmación antes de
// registrar definitivamente el voto.

type LocationState = {
    seleccion: { id: string; nombre: string; partido?: string } | null;
    enBlanco: boolean;
    canal: CanalVoto;
    circunscripcionId: string;
    votanteId: string;
    handshakeId?: string | null;
    emailDestino?: string;
};

export default function ConfirmacionVoto() {
    const navigate = useNavigate();
    const location = useLocation();
    const state = (location.state ?? null) as LocationState | null;

    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const payloadEmision: EmisionVoto | null = useMemo(() => {
        if (!state) return null;
        return {
            votanteId: state.votanteId,
            canal: state.canal,
            circunscripcionId: state.circunscripcionId,
            handshakeId: state.handshakeId ?? null,
            preferencias:
                state.enBlanco || !state.seleccion
                    ? {}
                    : { [state.seleccion.id]: 1 },
            enBlanco: state.enBlanco,
        };
    }, [state]);

    if (!state || !payloadEmision) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
                <AlertCircle size={36} className="text-red-500 mb-3" />
                <h1 className="text-xl font-bold mb-2">Sesión incompleta</h1>
                <p className="text-gray-600 mb-6">
                    No se recibieron datos de la selección. Vuelva al tarjetón
                    para reintentar.
                </p>
                <button
                    onClick={() => navigate("/tarjeton")}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded-xl"
                >
                    Volver al tarjetón
                </button>
            </div>
        );
    }

    const resumenSeleccion = state.enBlanco
        ? "VOTO EN BLANCO"
        : state.seleccion?.nombre ?? "(sin selección)";

    const confirmar = async () => {
        setEnviando(true);
        setError(null);
        try {
            let comprobante: ComprobanteVoto;
            if (state.canal === "Presencial") {
                comprobante = await emitirPresencial(payloadEmision);
            } else {
                comprobante = await emitirRemoto({
                    emision: payloadEmision,
                    emailDestino: state.emailDestino ?? "",
                });
            }
            navigate(`/comprobante-voto/${comprobante.numeroConfirmacion}`, {
                state: { comprobante },
            });
        } catch (e) {
            const mensaje =
                e instanceof Error ? e.message : "Error registrando el voto";
            setError(mensaje);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f6f7] font-sans">
            <header className="w-full border-b bg-white px-8 py-3 flex items-center sticky top-0 z-30">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
                    disabled={enviando}
                >
                    <ArrowLeft size={16} />
                    Volver a editar
                </button>
            </header>

            <main className="flex-1 px-6 py-10 max-w-2xl mx-auto w-full">
                <div className="bg-white border rounded-2xl p-8 shadow-sm">
                    <div className="flex items-start gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                            <AlertCircle size={20} className="text-red-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-gray-900">
                                Confirmación obligatoria
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Revise su selección antes de registrar el voto
                                de forma definitiva. Una vez confirmado, no
                                podrá modificarse.
                            </p>
                        </div>
                    </div>

                    <div className="border-y py-6 my-4">
                        <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                            Su selección
                        </p>
                        <p className="text-2xl font-extrabold text-red-500 mt-2">
                            {resumenSeleccion}
                        </p>
                        {state.seleccion?.partido && !state.enBlanco && (
                            <p className="text-sm text-gray-500 italic mt-1">
                                {state.seleccion.partido}
                            </p>
                        )}
                    </div>

                    <dl className="grid grid-cols-2 gap-y-3 text-sm mb-8">
                        <dt className="text-gray-500">Canal de emisión</dt>
                        <dd className="font-semibold text-gray-800">
                            {state.canal}
                        </dd>
                        <dt className="text-gray-500">Circunscripción</dt>
                        <dd className="font-semibold text-gray-800">
                            {state.circunscripcionId}
                        </dd>
                        {state.canal === "Presencial" && state.handshakeId && (
                            <>
                                <dt className="text-gray-500">Handshake</dt>
                                <dd className="font-mono text-xs text-gray-700 break-all">
                                    {state.handshakeId}
                                </dd>
                            </>
                        )}
                        {state.canal === "Remoto" && state.emailDestino && (
                            <>
                                <dt className="text-gray-500">
                                    Correo certificado
                                </dt>
                                <dd className="font-semibold text-gray-800 break-all">
                                    {state.emailDestino}
                                </dd>
                            </>
                        )}
                    </dl>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                        <button
                            onClick={() => navigate(-1)}
                            disabled={enviando}
                            className="border rounded-xl px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                        >
                            Volver a editar
                        </button>
                        <button
                            onClick={confirmar}
                            disabled={enviando}
                            className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold uppercase tracking-wide text-sm px-6 py-3 rounded-xl"
                        >
                            {enviando ? (
                                <>
                                    <Loader2
                                        size={16}
                                        className="animate-spin"
                                    />
                                    Registrando…
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={16} />
                                    Confirmar y registrar voto
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
