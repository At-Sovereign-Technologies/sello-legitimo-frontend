import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    Lock,
    Mail,
    MapPin,
    ShieldCheck,
    UserRound,
    Loader2,
    AlertTriangle,
} from "lucide-react";
import Footer from "../components/Footer";
import {
    CIUDADANO_DEMO_DEFAULT,
    consultarEnrolamientoRemoto,
} from "../api/enrolamientoRemoto.api";
import type { DatosEnrolamientoRemoto } from "../types/enrolamientoRemoto";

// SE-M3-02 — Antesala del tarjetón remoto.
//
// Decisión de diseño: los datos críticos (email certificado + circunscripción)
// NO los edita el votante. Se traen de su enrolamiento previo (lista blanca,
// US-SR-M3-01). Esto cumple:
//   - "Desplegar el tarjetón al ciudadano autenticado" (CA US-SE-M3-02).
//   - Atributo de calidad "Seguridad Perimetral": el votante no puede inyectar
//     un email distinto al certificado, ni cambiar de circunscripción.
//   - Atributo "Trazabilidad": el comprobante llega al correo que se asoció en
//     el enrolamiento, no a uno arbitrario.
//
// HOY: la consulta de enrolamiento es mock (ver consultarEnrolamientoRemoto).
// Cuando GestionPreElectoral-service exponga el endpoint, el adaptador HTTP
// reemplaza al mock sin tocar esta pantalla.

export default function EmisionRemotaSetup() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Hoy permitimos ?ciudadanoId=... para que la demo pueda alternar entre
    // los enrolados mock. Cuando exista auth real, este id se lee del contexto
    // de sesión, no del query string, y el campo desaparece de la URL.
    const ciudadanoId =
        searchParams.get("ciudadanoId") ?? CIUDADANO_DEMO_DEFAULT;

    const [datos, setDatos] = useState<DatosEnrolamientoRemoto | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelado = false;
        setCargando(true);
        setError(null);
        consultarEnrolamientoRemoto(ciudadanoId)
            .then((d) => {
                if (cancelado) return;
                setDatos(d);
            })
            .catch((e) => {
                if (cancelado) return;
                setError(
                    e instanceof Error
                        ? e.message
                        : "No se pudo consultar el enrolamiento."
                );
            })
            .finally(() => {
                if (!cancelado) setCargando(false);
            });
        return () => {
            cancelado = true;
        };
    }, [ciudadanoId]);

    const irAlTarjeton = () => {
        if (!datos) return;
        const params = new URLSearchParams({
            canal: "remoto",
            email: datos.emailCertificado,
            circunscripcion: datos.circunscripcionId,
            votanteId: datos.ciudadanoId,
        });
        navigate(`/tarjeton?${params.toString()}`);
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f6f7] font-sans">
            <main className="flex-1 px-6 py-12 max-w-2xl mx-auto w-full">
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
                                Estos datos provienen de su enrolamiento previo
                                para voto remoto. No se pueden modificar: garantizan
                                que el comprobante llegue al correo certificado
                                registrado y que el voto se compute en la
                                circunscripción correcta.
                            </p>
                        </div>
                    </div>

                    {cargando && (
                        <div className="flex items-center gap-2 text-gray-500 text-sm py-6">
                            <Loader2 size={16} className="animate-spin" />
                            Consultando su enrolamiento...
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 flex items-start gap-2 text-sm text-red-700">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            {error}
                        </div>
                    )}

                    {!cargando && !error && datos && datos.estadoEnrolamiento !== "HABILITADO" && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-start gap-3">
                            <AlertTriangle
                                size={20}
                                className="text-amber-600 shrink-0 mt-0.5"
                            />
                            <div>
                                <p className="font-bold text-amber-700 text-sm">
                                    {datos.estadoEnrolamiento === "NO_REGISTRADO"
                                        ? "No está enrolado para voto remoto"
                                        : datos.estadoEnrolamiento === "PENDIENTE"
                                          ? "Enrolamiento pendiente de aprobación"
                                          : "Enrolamiento rechazado"}
                                </p>
                                <p className="text-xs text-amber-600 mt-1 leading-relaxed">
                                    Solo los ciudadanos cuyo enrolamiento esté
                                    en estado <strong>HABILITADO</strong> pueden
                                    emitir voto remoto. Acérquese a la entidad
                                    para regularizar su estado o ejerza su voto
                                    presencialmente en su mesa asignada.
                                </p>
                            </div>
                        </div>
                    )}

                    {!cargando && !error && datos && datos.estadoEnrolamiento === "HABILITADO" && (
                        <>
                            <dl className="border rounded-xl divide-y mb-6">
                                <Fila
                                    icon={<UserRound size={14} />}
                                    etiqueta="Ciudadano"
                                    valor={datos.nombreCiudadano}
                                />
                                <Fila
                                    icon={<Lock size={14} />}
                                    etiqueta="Documento"
                                    valor={datos.documentoEnmascarado}
                                    monoespacio
                                />
                                <Fila
                                    icon={<Mail size={14} />}
                                    etiqueta="Correo certificado"
                                    valor={datos.emailCertificado}
                                    monoespacio
                                    locked
                                />
                                <Fila
                                    icon={<MapPin size={14} />}
                                    etiqueta="Circunscripción"
                                    valor={datos.circunscripcionNombre}
                                    locked
                                />
                                <Fila
                                    icon={<CheckCircle2 size={14} />}
                                    etiqueta="Estado del enrolamiento"
                                    valor="HABILITADO"
                                    valorClassName="text-green-700 font-bold"
                                />
                            </dl>

                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6 flex items-start gap-2 text-xs text-blue-700">
                                <Lock size={14} className="shrink-0 mt-0.5" />
                                <span>
                                    Los campos marcados con candado no son
                                    editables. Vienen directamente del registro
                                    de enrolamiento certificado.
                                </span>
                            </div>

                            <button
                                onClick={irAlTarjeton}
                                className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold uppercase tracking-wide text-sm px-6 py-3 rounded-xl w-full sm:w-auto"
                            >
                                Continuar al tarjetón <ArrowRight size={16} />
                            </button>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}

function Fila({
    icon,
    etiqueta,
    valor,
    monoespacio,
    locked,
    valorClassName,
}: {
    icon: React.ReactNode;
    etiqueta: string;
    valor: string;
    monoespacio?: boolean;
    locked?: boolean;
    valorClassName?: string;
}) {
    return (
        <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-500 font-semibold shrink-0">
                {icon}
                {etiqueta}
            </div>
            <div
                className={`text-sm text-right break-all ${
                    monoespacio ? "font-mono text-xs" : "font-semibold"
                } ${valorClassName ?? "text-gray-800"}`}
            >
                {valor}
                {locked && (
                    <Lock
                        size={11}
                        className="inline ml-1.5 text-gray-400 align-baseline"
                    />
                )}
            </div>
        </div>
    );
}
