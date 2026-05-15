import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Download, CheckCircle2, AlertCircle, Home } from "lucide-react";
import type { ComprobanteVoto as ComprobanteVotoType } from "../types/emision";
import Footer from "../components/Footer";

// SE-M3-01: VVPAT visible y descargable.
// SE-M3-02: número de confirmación + indicación del email.

type LocationState = { comprobante?: ComprobanteVotoType };

function decodeVvpat(base64: string | null | undefined): string | null {
    if (!base64) return null;
    try {
        return atob(base64);
    } catch {
        return null;
    }
}

export default function ComprobanteVoto() {
    const navigate = useNavigate();
    const location = useLocation();
    const { numero } = useParams();
    const [comprobante, setComprobante] = useState<ComprobanteVotoType | null>(
        null
    );

    useEffect(() => {
        const state = location.state as LocationState | null;
        if (state?.comprobante) {
            setComprobante(state.comprobante);
        }
    }, [location.state]);

    if (!comprobante) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
                <AlertCircle size={36} className="text-red-500 mb-3" />
                <h1 className="text-xl font-bold mb-2">
                    Comprobante no disponible
                </h1>
                <p className="text-gray-600 mb-1">
                    Número buscado:{" "}
                    <span className="font-mono">{numero ?? "—"}</span>
                </p>
                <p className="text-gray-500 text-sm mb-6">
                    El comprobante solo se muestra inmediatamente tras la
                    emisión.
                </p>
                <button
                    onClick={() => navigate("/")}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded-xl flex items-center gap-2"
                >
                    <Home size={16} /> Volver al inicio
                </button>
            </div>
        );
    }

    const vvpatTexto = decodeVvpat(comprobante.vvpatBase64);

    const descargarVvpat = () => {
        if (!vvpatTexto) return;
        const blob = new Blob([vvpatTexto], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `vvpat-${comprobante.numeroConfirmacion}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f6f7] font-sans">
            <header className="w-full border-b bg-white px-8 py-3 flex items-center justify-between sticky top-0 z-30">
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                    <Home size={16} /> Inicio
                </button>
            </header>

            <main className="flex-1 px-6 py-10 max-w-3xl mx-auto w-full">
                <div className="bg-white border rounded-2xl p-8 shadow-sm">
                    <div className="flex items-start gap-3 mb-6">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                            <CheckCircle2
                                size={24}
                                className="text-green-600"
                            />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-gray-900">
                                Voto registrado y custodiado
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Conserve este comprobante. El sistema solo
                                almacenó el hash anónimo de su voto.
                            </p>
                        </div>
                    </div>

                    <div className="border-y py-5 my-4">
                        <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                            Número de confirmación
                        </p>
                        <p className="text-3xl font-mono font-extrabold text-red-500 mt-2 tracking-widest">
                            {comprobante.numeroConfirmacion}
                        </p>
                    </div>

                    <dl className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-y-3 text-sm mb-6">
                        <dt className="text-gray-500">Canal</dt>
                        <dd className="font-semibold text-gray-800">
                            {comprobante.canal}
                        </dd>

                        <dt className="text-gray-500">Timestamp</dt>
                        <dd className="font-mono text-xs text-gray-700">
                            {comprobante.timestamp}
                        </dd>

                        <dt className="text-gray-500">Hash del voto</dt>
                        <dd className="font-mono text-xs text-gray-700 break-all">
                            {comprobante.hashVoto}
                        </dd>

                        <dt className="text-gray-500">ID custodia cifrada</dt>
                        <dd className="font-mono text-xs text-gray-700 break-all">
                            {comprobante.custodyId}
                        </dd>

                        <dt className="text-gray-500">Firma digital (RSA)</dt>
                        <dd className="font-mono text-[10px] text-gray-600 break-all max-h-24 overflow-y-auto bg-gray-50 rounded p-2">
                            {comprobante.firmaDigital}
                        </dd>

                        {comprobante.emailDestino && (
                            <>
                                <dt className="text-gray-500">
                                    Correo certificado
                                </dt>
                                <dd className="font-semibold text-gray-800 break-all">
                                    Comprobante enviado a{" "}
                                    {comprobante.emailDestino}
                                </dd>
                            </>
                        )}
                    </dl>

                    {vvpatTexto && (
                        <section className="mt-6">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="font-extrabold text-gray-800">
                                    VVPAT — Comprobante físico
                                </h2>
                                <button
                                    onClick={descargarVvpat}
                                    className="flex items-center gap-2 border rounded-xl px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    <Download size={14} /> Descargar
                                </button>
                            </div>
                            <pre className="bg-gray-50 border rounded-xl px-4 py-3 text-[11px] font-mono text-gray-800 whitespace-pre overflow-x-auto">
                                {vvpatTexto}
                            </pre>
                            <p className="text-xs text-gray-500 mt-2 italic">
                                Revise el comprobante antes de depositarlo en
                                la urna física.
                            </p>
                        </section>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
