import { type FormEvent, useState } from "react";
import { useParams } from "react-router-dom";
import {
    AlertTriangle,
    CheckCircle2,
    Loader2,
    LockKeyhole,
} from "lucide-react";
import axios from "axios";
import PageHeader from "../../components/PageHeader";
import { abrirMesa } from "../../api/aperturaMesa.api";

const MENSAJE_ERROR_APERTURA =
    "Autorización denegada: Credenciales inválidas o jurados no asignados a esta mesa.";

export default function AperturaMesa() {
    const { mesaId } = useParams();
    const [credencialJurado1, setCredencialJurado1] = useState("");
    const [credencialJurado2, setCredencialJurado2] = useState("");
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mesaAbierta, setMesaAbierta] = useState(false);

    const tituloMesa = mesaId || "sin identificador";

    async function manejarApertura(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!mesaId) {
            setError("No fue posible identificar la mesa a abrir.");
            return;
        }

        const token1 = credencialJurado1.trim();
        const token2 = credencialJurado2.trim();

        if (!token1 || !token2) {
            setError("Debes ingresar las dos credenciales para continuar.");
            return;
        }

        setCargando(true);
        setError(null);

        try {
            await abrirMesa(mesaId, [token1, token2]);
            setMesaAbierta(true);
            setCredencialJurado1("");
            setCredencialJurado2("");
        } catch (errorApertura) {
            if (
                axios.isAxiosError(errorApertura) &&
                errorApertura.response?.status === 403
            ) {
                setError(MENSAJE_ERROR_APERTURA);
            } else {
                setError(
                    errorApertura instanceof Error
                        ? errorApertura.message
                        : MENSAJE_ERROR_APERTURA,
                );
            }
        } finally {
            setCargando(false);
        }
    }

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
            <PageHeader />

            <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-4xl space-y-6">
                    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_60px_-30px_rgba(15,23,42,0.35)]">
                        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 px-6 py-6 text-white sm:px-8">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
                                        <LockKeyhole className="h-3.5 w-3.5" />
                                        Protocolo de apertura M de N
                                    </div>
                                    <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                                        Mesa {tituloMesa} - Protocolo de
                                        Apertura de Quórum
                                    </h1>
                                    <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
                                        Ingrese dos credenciales válidas de
                                        jurados asignados para autorizar la
                                        apertura oficial de la mesa.
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                                        Quórum requerido
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-emerald-300">
                                        2 de 2
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-6 sm:px-8 sm:py-8">
                            {error && (
                                <div
                                    role="alert"
                                    className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-800 shadow-sm"
                                >
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="mt-0.5 h-5 w-5 flex-none text-red-600" />
                                        <p>{error}</p>
                                    </div>
                                </div>
                            )}

                            {mesaAbierta ? (
                                <div className="space-y-6">
                                    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-8 text-center shadow-sm">
                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-200">
                                            <CheckCircle2 className="h-8 w-8" />
                                        </div>
                                        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
                                            Mesa abierta
                                        </p>
                                        <h2 className="mt-2 text-3xl font-black tracking-[0.18em] text-emerald-900">
                                            MESA ABIERTA
                                        </h2>
                                        <p className="mt-3 text-sm text-emerald-800">
                                            La autorización de quórum fue
                                            validada y la mesa {tituloMesa} quedó
                                            habilitada para continuar con el
                                            proceso.
                                        </p>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <button
                                            type="button"
                                            disabled
                                            className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-slate-100 px-5 py-4 text-sm font-semibold text-slate-500 shadow-sm"
                                        >
                                            Descargar Formulario E-11
                                        </button>
                                        <button
                                            type="button"
                                            disabled
                                            className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-slate-100 px-5 py-4 text-sm font-semibold text-slate-500 shadow-sm"
                                        >
                                            Descargar Formulario E-9
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form
                                    className="space-y-6"
                                    onSubmit={manejarApertura}
                                >
                                    <div className="grid gap-5 lg:grid-cols-2">
                                        <label className="block space-y-2">
                                            <span className="text-sm font-semibold text-slate-700">
                                                Credencial Jurado 1
                                            </span>
                                            <input
                                                type="password"
                                                autoComplete="off"
                                                value={credencialJurado1}
                                                onChange={(event) =>
                                                    setCredencialJurado1(
                                                        event.target.value,
                                                    )
                                                }
                                                disabled={cargando}
                                                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                                                placeholder="Ingrese la credencial segura"
                                            />
                                        </label>

                                        <label className="block space-y-2">
                                            <span className="text-sm font-semibold text-slate-700">
                                                Credencial Jurado 2
                                            </span>
                                            <input
                                                type="password"
                                                autoComplete="off"
                                                value={credencialJurado2}
                                                onChange={(event) =>
                                                    setCredencialJurado2(
                                                        event.target.value,
                                                    )
                                                }
                                                disabled={cargando}
                                                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                                                placeholder="Ingrese la credencial segura"
                                            />
                                        </label>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                                        El sistema validará exactamente dos
                                        credenciales criptográficas antes de
                                        autorizar la apertura de la mesa.
                                    </div>

                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                            Canal seguro protegido
                                        </p>
                                        <button
                                            type="submit"
                                            disabled={cargando}
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-700 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-blue-400 disabled:shadow-none"
                                        >
                                            {cargando ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Autorizando apertura...
                                                </>
                                            ) : (
                                                "Autorizar Apertura de Mesa"
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}