import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, X } from "lucide-react";
import UserMenu from "../../components/UserMenu";
import {
    buildConfiguracionCompletaDraft,
    clearConfiguracionDraft,
    loadConfiguracionPaso1Draft,
    loadConfiguracionPaso2Draft,
    loadConfiguracionPaso3Draft,
    saveConfiguracionPaso3Draft,
} from "../../services/configuracionDraftService";
import { enviarConfiguracionFinal } from "../../services/eleccionesService";
import { obtenerEleccionPorId } from "../../api/eleccionesApi";
import {
    getCircunscripcionesCompatibles,
    getTipoEleccionPreset,
    sanitizePaso3Draft,
    type CircunscripcionId,
    type MetodoElectoral,
    type Paso3Config,
} from "../../services/electionConfigRules";

type EstadoCircunscripcion = "INACTIVA" | "ACTIVA" | "INHABILITADA";

function clampEdad(val: string): string {
    const n = parseInt(val, 10);
    if (isNaN(n) || n < 0) return "0";
    if (n > 120) return "120";
    return String(n);
}

interface Circunscripcion {
    id: CircunscripcionId;
    titulo: string;
    descripcion: string;
    estado: EstadoCircunscripcion;
}

const circunscripcionesBase: Omit<Circunscripcion, "estado">[] = [
    {
        id: "nacional",
        titulo: "Circunscripción Nacional",
        descripcion: "Todo el país compite como un solo distrito.",
    },
    {
        id: "territorial",
        titulo: "Circunscripción Territorial",
        descripcion:
            "Departamentos, distritos o municipios reparten por separado.",
    },
    {
        id: "especiales",
        titulo: "Circunscripciones Especiales",
        descripcion: "Indígenas, afro, diáspora u otras curules especiales.",
    },
];

const jerarquiaItems = [
    { label: "País", color: "bg-red-500" },
    { label: "Depto./Distrito", color: "bg-orange-400" },
    { label: "Municipio", color: "bg-yellow-400" },
    { label: "Puesto de Votación", color: "bg-green-500" },
    { label: "Mesa", color: "bg-blue-500" },
];

const exenciones = [
    "Personal Activo de Fuerzas Militares y Policía",
    "Discapacidad Permanente Certificada",
    "Ciudadanos Registrados en el Sistema",
    "Fuerza Mayor Debidamente Acreditada",
];

const tipoEleccionLabels: Record<string, string> = {
    PRESIDENCIAL: "Presidencial",
    LEGISLATIVA: "Legislativa",
    TERRITORIAL: "Territorial",
};

const modalidadLabels: Record<string, string> = {
    PRESENCIAL: "Presencial",
    REMOTA: "Remota",
    AMBAS: "Presencial y remota",
};

const circunscripcionLabels: Record<string, string> = {
    NACIONAL: "Nacional",
    TERRITORIAL: "Territorial",
    ESPECIAL: "Especial",
    INTERNACIONAL: "Internacional",
};

function resolverModalidadEsperada(
    presencial: boolean | undefined,
    remota: boolean | undefined,
) {
    if (presencial && remota) return "AMBAS";
    if (presencial) return "PRESENCIAL";
    if (remota) return "REMOTA";
    return "PRESENCIAL";
}

function resolverCircunscripcionEsperada(
    circunscripcion: CircunscripcionId | undefined,
) {
    if (circunscripcion === "nacional") return "NACIONAL";
    if (circunscripcion === "especiales") return "ESPECIAL";
    return "TERRITORIAL";
}

function formatearFechaResumen(valor: unknown) {
    if (typeof valor !== "string" || !valor.trim()) return null;

    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return valor;

    return new Intl.DateTimeFormat("es-CO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(fecha);
}

function formatearValorCatalogo(
    valor: unknown,
    catalogo: Record<string, string>,
    fallbackClave?: string,
) {
    if (typeof valor === "string") {
        const normalizado = valor.trim().toUpperCase();
        if (catalogo[normalizado]) {
            return catalogo[normalizado];
        }
    }

    if (fallbackClave && catalogo[fallbackClave]) {
        return catalogo[fallbackClave];
    }

    return null;
}

function buildCircunscripciones(
    permitidas: CircunscripcionId[],
    activa: CircunscripcionId,
): Circunscripcion[] {
    return circunscripcionesBase.map((circunscripcion) => ({
        ...circunscripcion,
        estado: !permitidas.includes(circunscripcion.id)
            ? "INHABILITADA"
            : circunscripcion.id === activa
              ? "ACTIVA"
              : "INACTIVA",
    }));
}

function getContextoCircunscripcion(metodoSeleccionado: MetodoElectoral) {
    if (metodoSeleccionado === "ME-03") {
        return "En proporcional importan territorial, nacional y especiales porque cada circunscripción puede repartir sus propias curules.";
    }

    if (metodoSeleccionado === "ME-02") {
        return "En segunda vuelta la circunscripción suele ser nacional o territorial, pero no depende de reparto de curules.";
    }

    if (metodoSeleccionado === "ME-04") {
        return "En voto alternativo sigue existiendo un solo ganador, por eso solo aplica territorial o nacional.";
    }

    return "En mayoría simple la circunscripción define dónde compiten los candidatos, no cómo se reparten curules.";
}

export default function CircunscripcionesElegibilidad() {
    const navigate = useNavigate();

    const draftPaso1 = loadConfiguracionPaso1Draft();
    const draftPaso2 = loadConfiguracionPaso2Draft();
    const draftPaso3 = loadConfiguracionPaso3Draft();
    const presetTipoEleccion = getTipoEleccionPreset(draftPaso1.tipoEleccion);
    const metodoSeleccionado =
        (draftPaso2.metodoSeleccionado as MetodoElectoral) ?? "ME-03";
    const paso3Inicial = sanitizePaso3Draft(
        draftPaso1.tipoEleccion,
        metodoSeleccionado,
        draftPaso3,
    );
    const circunscripcionesCompatibles =
        presetTipoEleccion?.circunscripcionesCompatibles ??
        getCircunscripcionesCompatibles(metodoSeleccionado);
    const circunscripcionBloqueada =
        presetTipoEleccion?.lockCircunscripcion ?? false;

    const [circunscripciones, setCircunscripciones] = useState<
        Circunscripcion[]
    >(
        buildCircunscripciones(
            circunscripcionesCompatibles,
            paso3Inicial.circunscripcionActiva,
        ),
    );
    const [edadDesde, setEdadDesde] = useState(paso3Inicial.edadDesde);
    const [edadHasta, setEdadHasta] = useState(paso3Inicial.edadHasta);
    const [excencionesSeleccionadas, setExcencionesSeleccionadas] = useState<
        string[]
    >(paso3Inicial.excencionesSeleccionadas);
    const [guardando, setGuardando] = useState(false);
    const [errorGuardado, setErrorGuardado] = useState<string | null>(null);
    const [guardadoExitoso, setGuardadoExitoso] = useState(false);
    const [eleccionId, setEleccionId] = useState<number | null>(null);
    const [datosBorrador, setDatosBorrador] = useState<Record<
        string,
        unknown
    > | null>(null);
    const [pestanaAbierta, setPestanaAbierta] = useState(false);
    const [cargandoBorrador, setCargandoBorrador] = useState(false);
    const modalidadEsperada = resolverModalidadEsperada(
        draftPaso1.votacionPresencial,
        draftPaso1.votacionRemota,
    );
    const circunscripcionEsperada = resolverCircunscripcionEsperada(
        circunscripciones.find(
            (circunscripcion) => circunscripcion.estado === "ACTIVA",
        )?.id ?? paso3Inicial.circunscripcionActiva,
    );

    function getResumenValor(key: string, valor: unknown) {
        if (key === "tipoEleccion") {
            return formatearValorCatalogo(
                valor,
                tipoEleccionLabels,
                draftPaso1.tipoEleccion,
            );
        }

        if (key === "tipoCircunscripcion") {
            return formatearValorCatalogo(
                valor,
                circunscripcionLabels,
                circunscripcionEsperada,
            );
        }

        if (key === "modalidadHabilitada") {
            return formatearValorCatalogo(
                valor,
                modalidadLabels,
                modalidadEsperada,
            );
        }

        if (key === "fechaInicioJornada" || key === "fechaCierreJornada") {
            return formatearFechaResumen(valor);
        }

        if (typeof valor === "string" && valor.trim()) {
            return valor;
        }

        if (typeof valor === "number") {
            return String(valor);
        }

        return null;
    }

    function toggleEstado(id: CircunscripcionId) {
        if (circunscripcionBloqueada) return;

        setCircunscripciones((prev) => {
            const objetivo = prev.find((c) => c.id === id);
            if (!objetivo || objetivo.estado === "INHABILITADA") return prev;

            return prev.map((c) => {
                if (c.estado === "INHABILITADA") return c;
                return { ...c, estado: c.id === id ? "ACTIVA" : "INACTIVA" };
            });
        });
    }

    function badgeStyle(estado: EstadoCircunscripcion) {
        if (estado === "ACTIVA") return "bg-red-100 text-red-600 font-semibold";
        if (estado === "INACTIVA")
            return "bg-gray-100 text-gray-500 font-semibold";
        return "bg-gray-100 text-gray-400 font-semibold";
    }

    function cardStyle(estado: EstadoCircunscripcion) {
        if (estado === "ACTIVA") return "border-red-400 bg-red-50";
        if (estado === "INHABILITADA")
            return "border-gray-200 bg-gray-50 opacity-60";
        return "border-gray-200 bg-white";
    }

    function buildPaso3Payload(): Paso3Config {
        return sanitizePaso3Draft(draftPaso1.tipoEleccion, metodoSeleccionado, {
            circunscripcionActiva:
                circunscripciones.find(
                    (circunscripcion) => circunscripcion.estado === "ACTIVA",
                )?.id ?? paso3Inicial.circunscripcionActiva,
            edadDesde,
            edadHasta,
            excencionesSeleccionadas,
        });
    }

    async function handleGuardarBorrador() {
        if (eleccionId === null) return;
        setCargandoBorrador(true);
        setErrorGuardado(null);

        try {
            const datos = await obtenerEleccionPorId(eleccionId);
            setDatosBorrador(datos);
            setPestanaAbierta(true);
        } catch (error) {
            setErrorGuardado(
                error instanceof Error
                    ? error.message
                    : "No se pudo obtener el registro de la BD",
            );
        } finally {
            setCargandoBorrador(false);
        }
    }

    async function handleFinalizarConfiguracion() {
        if (!draftPaso1.nombreEleccion?.trim()) {
            setErrorGuardado(
                "Faltan datos del Paso 1: nombre de la elección. Vuelve al paso anterior y complétalo.",
            );
            return;
        }
        if (!draftPaso1.tipoEleccion) {
            setErrorGuardado(
                "Faltan datos del Paso 1: tipo de elección. Vuelve al paso anterior y complétalo.",
            );
            return;
        }
        if (!draftPaso1.fechaInicio) {
            setErrorGuardado(
                "Faltan datos del Paso 1: fecha de inicio. Vuelve al paso anterior y complétalo.",
            );
            return;
        }
        if (!draftPaso1.fechaCierre) {
            setErrorGuardado(
                "Faltan datos del Paso 1: fecha de cierre. Vuelve al paso anterior y complétalo.",
            );
            return;
        }
        if (!draftPaso2.metodoSeleccionado) {
            setErrorGuardado(
                "Faltan datos del Paso 2: método electoral. Vuelve al paso anterior y complétalo.",
            );
            return;
        }

        setGuardando(true);
        setErrorGuardado(null);
        setGuardadoExitoso(false);

        try {
            const payloadPaso3 = buildPaso3Payload();
            saveConfiguracionPaso3Draft(payloadPaso3);
            const payloadFinal = buildConfiguracionCompletaDraft();
            const respuesta = (await enviarConfiguracionFinal({
                ...payloadFinal,
                ...payloadPaso3,
            })) as Record<string, unknown>;
            clearConfiguracionDraft();
            setGuardadoExitoso(true);
            if (typeof respuesta.id === "number") {
                setEleccionId(respuesta.id);
            }
        } catch (error) {
            setErrorGuardado(
                error instanceof Error
                    ? error.message
                    : "No se pudo guardar la configuracion. Intente de nuevo.",
            );
        } finally {
            setGuardando(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white border-b px-8 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">SL</span>
                    </div>
                    <div className="leading-tight">
                        <p className="font-bold text-sm text-gray-900">
                            Sello Legítimo
                        </p>
                        <p className="text-red-500 text-[10px] font-semibold tracking-wider">
                            SISTEMA ELECTORAL COLOMBIANO
                        </p>
                    </div>
                </div>

                <UserMenu />
            </header>

            <main className="flex-1 px-8 py-6 max-w-4xl mx-auto w-full">
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                    <button
                        onClick={() => navigate("/")}
                        className="hover:text-gray-700"
                    >
                        Panel Principal
                    </button>
                    <ChevronRight size={12} />
                    <button
                        onClick={() =>
                            navigate("/configuracion/parametros-base")
                        }
                        className="hover:text-gray-700"
                    >
                        Configuración Electoral
                    </button>
                    <ChevronRight size={12} />
                    <span className="text-gray-700">
                        Geografía y Elegibilidad
                    </span>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    Resumen de Geografía y Reglas de Obligatoriedad
                </h1>
                <p className="text-sm text-gray-500 mb-6">
                    Paso 3: selecciona la circunscripción válida para el método
                    electoral configurado.
                </p>

                <div className="bg-white border rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 tracking-wide">
                                PROGRESO DE CONFIGURACIÓN
                            </p>
                            <p className="text-xs text-red-500 font-semibold mt-0.5">
                                Paso 3 de 3: Revisión Final y Reglas
                            </p>
                        </div>
                        <span className="text-lg font-bold text-gray-900">
                            100%
                        </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full">
                        <div className="h-1.5 bg-red-500 rounded-full w-full" />
                    </div>
                </div>

                <div className="bg-white border rounded-xl p-6 mb-4">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                            1
                        </div>
                        <h2 className="font-semibold text-gray-900">
                            Configuración de Circunscripciones
                        </h2>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 mb-4">
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                            Método electoral activo: {metodoSeleccionado}
                        </p>
                        <p className="text-sm text-gray-600">
                            {getContextoCircunscripcion(metodoSeleccionado)}
                        </p>
                        {circunscripcionBloqueada && (
                            <p className="text-xs text-red-600 mt-2">
                                Esta circunscripción quedó definida
                                automáticamente por el tipo de elección.
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-3">
                        {circunscripciones.map((c) => (
                            <div
                                key={c.id}
                                className={`flex items-center justify-between border rounded-xl px-4 py-3 transition ${cardStyle(c.estado)}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                        <div
                                            className={`w-3 h-3 rounded-full ${c.estado === "ACTIVA" ? "bg-red-500" : "bg-gray-400"}`}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {c.titulo}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {c.descripcion}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    disabled={
                                        c.estado === "INHABILITADA" ||
                                        circunscripcionBloqueada
                                    }
                                    onClick={() => toggleEstado(c.id)}
                                    className={`text-xs px-3 py-1 rounded-lg transition ${badgeStyle(c.estado)} ${
                                        c.estado === "INHABILITADA" ||
                                        circunscripcionBloqueada
                                            ? "cursor-not-allowed opacity-60"
                                            : "cursor-pointer hover:opacity-80"
                                    }`}
                                >
                                    {c.estado}
                                </button>
                            </div>
                        ))}
                    </div>

                    <p className="text-xs text-gray-400 mt-3">
                        Solo puede haber una circunscripción activa al mismo
                        tiempo.
                    </p>
                </div>

                <div className="bg-white border rounded-xl p-6 mb-4">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                            2
                        </div>
                        <h2 className="font-semibold text-gray-900">
                            Jerarquía Geográfica Electoral
                        </h2>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                        {jerarquiaItems.map((item, i) => (
                            <div
                                key={item.label}
                                className="flex items-center gap-1.5 border border-gray-200 rounded-full px-3 py-1.5 bg-white text-xs font-medium text-gray-700"
                            >
                                <span
                                    className={`w-2 h-2 rounded-full flex-shrink-0 ${item.color}`}
                                />
                                <span className="text-gray-400 mr-0.5 font-normal">
                                    {i + 1}.
                                </span>
                                {item.label}
                            </div>
                        ))}
                    </div>

                    <p className="text-xs text-gray-400">
                        Esta estructura define la granularidad de reporte y los
                        puntos de auditoría.
                    </p>
                </div>

                <div className="bg-white border rounded-xl p-6 mb-6">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                            3
                        </div>
                        <h2 className="font-semibold text-gray-900">
                            Voto Obligatorio y Elegibilidad
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 tracking-wide mb-3">
                                Rango de Edad Obligatorio
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">
                                        desde
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="120"
                                        value={edadDesde}
                                        onChange={(e) =>
                                            setEdadDesde(
                                                clampEdad(e.target.value),
                                            )
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">
                                        hasta
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="120"
                                        value={edadHasta}
                                        onChange={(e) =>
                                            setEdadHasta(
                                                clampEdad(e.target.value),
                                            )
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                Los ciudadanos fuera de este rango tendrán
                                derecho al voto voluntario.
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-gray-500 tracking-wide mb-3">
                                Exenciones Automáticas
                            </p>
                            <div className="flex flex-col gap-2">
                                {exenciones.map((ex) => {
                                    const seleccionada =
                                        excencionesSeleccionadas.includes(ex);
                                    return (
                                        <button
                                            key={ex}
                                            type="button"
                                            onClick={() =>
                                                setExcencionesSeleccionadas(
                                                    (prev) =>
                                                        seleccionada
                                                            ? prev.filter(
                                                                  (e) =>
                                                                      e !== ex,
                                                              )
                                                            : [...prev, ex],
                                                )
                                            }
                                            className="flex items-center gap-2 text-left group"
                                        >
                                            <div
                                                className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition ${
                                                    seleccionada
                                                        ? "bg-red-500 border-red-500"
                                                        : "border-gray-300"
                                                }`}
                                            >
                                                {seleccionada && (
                                                    <svg
                                                        className="w-2.5 h-2.5 text-white"
                                                        fill="none"
                                                        viewBox="0 0 10 10"
                                                    >
                                                        <path
                                                            d="M1.5 5l2.5 2.5 4.5-4.5"
                                                            stroke="currentColor"
                                                            strokeWidth="1.5"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                )}
                                            </div>
                                            <span
                                                className={`text-xs transition ${
                                                    seleccionada
                                                        ? "text-gray-800 font-medium"
                                                        : "text-gray-500"
                                                }`}
                                            >
                                                {ex}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            {excencionesSeleccionadas.length === 0 && (
                                <p className="text-xs text-red-400 mt-2">
                                    Selecciona al menos una exención automática.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/configuracion/metodo-electoral")
                        }
                        className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                        Paso Anterior
                    </button>

                    <div className="flex items-center gap-3">
                        {eleccionId !== null && (
                            <button
                                type="button"
                                onClick={handleGuardarBorrador}
                                disabled={cargandoBorrador}
                                className="px-5 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {cargandoBorrador
                                    ? "Consultando..."
                                    : "Ver Borrador"}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleFinalizarConfiguracion}
                            disabled={guardando}
                            className="px-5 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition flex items-center gap-1 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {guardando
                                ? "Enviando..."
                                : "Finalizar Configuración"}
                            <span className="ml-1">&#9654;</span>
                        </button>
                    </div>
                </div>

                {/* Pestaña: registro confirmado en BD */}
                {pestanaAbierta && datosBorrador && (
                    <div className="mt-3 border border-green-200 rounded-xl bg-green-50 overflow-hidden shadow-sm">
                        <div className="flex items-center justify-between px-4 py-2 bg-green-100 border-b border-green-200">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-xs font-semibold text-green-800">
                                    Registro confirmado en BD
                                    {typeof datosBorrador.id === "number" && (
                                        <span className="ml-1 text-green-600 font-normal">
                                            · ID {datosBorrador.id}
                                        </span>
                                    )}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPestanaAbierta(false)}
                                className="text-green-600 hover:text-green-800 transition"
                            >
                                <X size={14} />
                            </button>
                        </div>
                        <div className="px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-1.5">
                            {[
                                { label: "Nombre", key: "nombreOficial" },
                                { label: "Tipo", key: "tipoEleccion" },
                                {
                                    label: "Método",
                                    key: "codigoMetodoElectoral",
                                },
                                {
                                    label: "Circunscripción",
                                    key: "tipoCircunscripcion",
                                },
                                { label: "Estado", key: "estado" },
                                {
                                    label: "Modalidad",
                                    key: "modalidadHabilitada",
                                },
                                { label: "Inicio", key: "fechaInicioJornada" },
                                { label: "Cierre", key: "fechaCierreJornada" },
                                {
                                    label: "Documento no votable",
                                    key: "documentoNoVotable",
                                },
                                {
                                    label: "Exenciones",
                                    key: "excencionesHabilitadas",
                                },
                            ].map(({ label, key }) =>
                                getResumenValor(key, datosBorrador[key]) !=
                                null ? (
                                    <div
                                        key={key}
                                        className="flex gap-1.5 text-xs"
                                    >
                                        <span className="text-gray-500 font-medium w-24 flex-shrink-0">
                                            {label}
                                        </span>
                                        <span className="text-gray-800 truncate">
                                            {getResumenValor(
                                                key,
                                                datosBorrador[key],
                                            )}
                                        </span>
                                    </div>
                                ) : null,
                            )}
                        </div>
                    </div>
                )}

                {(errorGuardado || guardadoExitoso) && (
                    <div
                        className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                            errorGuardado
                                ? "border-red-200 bg-red-50 text-red-700"
                                : "border-green-200 bg-green-50 text-green-700"
                        }`}
                    >
                        {errorGuardado ||
                            "Configuración enviada al microservicio correctamente."}
                    </div>
                )}
            </main>

            <footer className="border-t bg-white py-3 px-8 text-center text-xs text-gray-400">
                Sistema Electoral Certificado ISO 27001 - Módulo de
                Configuración Seguro
            </footer>
        </div>
    );
}
