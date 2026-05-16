import { useEffect, useMemo, useState } from "react";
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
import { getToken, getDisplayUsername } from "../services/authService";

// SE-M3-02 — Antesala del tarjetón remoto.
//
// El votante llega aquí YA AUTENTICADO (ProtectedRoute redirige a /login si
// no hay sesión). Esta pantalla:
//   1. Lee el ciudadanoId del JWT de sesión.
//   2. Consulta el enrolamiento previo en la Lista Blanca (US-SR-M3-01).
//   3. Muestra email certificado + circunscripción en READ-ONLY.
//   4. Solo permite continuar si el enrolamiento está HABILITADO.
//
// Atributos de calidad cubiertos:
//   - "Desplegar tarjetón al ciudadano autenticado" — JWT validado por ProtectedRoute.
//   - Seguridad Perimetral — votante no puede cambiar destino del comprobante.
//   - Trazabilidad — comprobante llega al correo del enrolamiento, no a uno arbitrario.
//   - Integridad — voto se computa en la circunscripción donde está inscrito.
//
// HOY: la consulta de enrolamiento es mock. Cuando GestionPreElectoral-service
// exponga GET /api/v1/lista-blanca/ciudadano/{id}, el adaptador HTTP reemplaza
// al mock sin tocar esta pantalla.

// Decodifica el payload de un JWT sin verificar la firma (solo para leer claims).
function decodeJwtSub(token: string): string | null {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;
        const payload = JSON.parse(atob(parts[1])) as Record<string, unknown>;
        return (
            (payload.sub as string) ||
            (payload.ciudadanoId as string) ||
            (payload.userId as string) ||
            null
        );
    } catch {
        return null;
    }
}

export default function EmisionRemotaSetup() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Resolución del ciudadanoId, en orden de prioridad:
    //   1. JWT de sesión (auth real, lo normal en producción).
    //   2. ?ciudadanoId=... en el query (útil para QA: alternar entre enrolados mock).
    //   3. CIUDADANO_DEMO_DEFAULT (fallback para sesiones sin sub resoluble en demo).
    const ciudadanoId = useMemo(() => {
        const desdeQuery = searchParams.get("ciudadanoId");
        if (desdeQuery) return desdeQuery;
        const token = getToken();
        if (token) {
            const sub = decodeJwtSub(token);
            if (sub) return sub;
        }
        return CIUDADANO_DEMO_DEFAULT;
    }, [searchParams]);

    const usuarioVisible = getDisplayUsername();

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
                                Sesión iniciada como{" "}
                                <strong className="text-gray-700">
                                    {usuarioVisible}
                                </strong>
                                . Los datos a continuación provienen de su
                                enrolamiento previo y no se pueden modificar:
                                garantizan que el comprobante llegue al correo
                                certificado registrado y que el voto se compute
                                en la circunscripción correcta.
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
