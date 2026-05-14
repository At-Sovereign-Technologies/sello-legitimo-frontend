import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Mail, MapPin, ShieldCheck } from "lucide-react";
import Footer from "../components/Footer";

// SE-M3-02: recoge datos previos a la votación remota.
// El ciudadano autenticado entra a /votar-remoto, confirma su email
// certificado y circunscripción, y es redirigido al tarjetón con
// los query params que activan el flujo remoto.

const CIRCUNSCRIPCIONES_DISPONIBLES = [
    "PRESIDENCIAL-NACIONAL",
    "BOGOTA",
    "MEDELLIN",
    "CALI",
    "BARRANQUILLA",
];

export default function EmisionRemotaSetup() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [circunscripcion, setCircunscripcion] = useState(
        CIRCUNSCRIPCIONES_DISPONIBLES[0]
    );
    const [error, setError] = useState<string | null>(null);

    const continuar = (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!emailValido) {
            setError("Ingrese un correo electrónico válido.");
            return;
        }

        const params = new URLSearchParams({
            canal: "remoto",
            email,
            circunscripcion,
        });
        navigate(`/tarjeton?${params.toString()}`);
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f6f7] font-sans">
            <main className="flex-1 px-6 py-12 max-w-xl mx-auto w-full">
                <div className="bg-white border rounded-2xl p-8 shadow-sm">
                    <div className="flex items-start gap-3 mb-6">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                            <ShieldCheck size={22} className="text-red-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-gray-900">
                                Votación remota
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Confirme su correo certificado y su
                                circunscripción antes de acceder al tarjetón.
                                Su voto será cifrado y firmado digitalmente.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={continuar} className="space-y-5">
                        <div>
                            <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold flex items-center gap-1">
                                <Mail size={12} /> Correo certificado
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="usuario@ejemplo.gov.co"
                                className="w-full mt-2 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                            />
                            <p className="text-[11px] text-gray-400 mt-1">
                                A esta dirección se enviará el comprobante
                                firmado del voto.
                            </p>
                        </div>

                        <div>
                            <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold flex items-center gap-1">
                                <MapPin size={12} /> Circunscripción
                            </label>
                            <select
                                value={circunscripcion}
                                onChange={(e) =>
                                    setCircunscripcion(e.target.value)
                                }
                                className="w-full mt-2 border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
                            >
                                {CIRCUNSCRIPCIONES_DISPONIBLES.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold uppercase tracking-wide text-sm px-6 py-3 rounded-xl w-full sm:w-auto"
                        >
                            Ir al tarjetón <ArrowRight size={16} />
                        </button>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
}
