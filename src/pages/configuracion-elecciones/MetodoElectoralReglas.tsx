import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronRight, ChevronDown, ChevronLeft, RotateCcw } from "lucide-react"
import UserMenu from "../../components/UserMenu"
import {
  loadConfiguracionPaso1Draft,
  loadConfiguracionPaso2Draft,
  saveConfiguracionPaso2Draft,
} from "../../services/configuracionDraftService"
import {
  getMetodoVictoryConfig,
  getModelosCompatibles,
  getTipoEleccionPreset,
  sanitizePaso2Draft,
  defaultConfiguracionSenado,
  defaultConfiguracionCamara,
  defaultConfiguracionCamaraEspeciales,
  type MetodoElectoral,
  type ModeloCandidatura,
  type Paso2Config,
  type ConfiguracionSenado,
  type ConfiguracionCamaraDepto,
  type ConfiguracionCamaraEspecial,
} from "../../services/electionConfigRules"

const metodos: { id: MetodoElectoral; titulo: string; codigo: string; desc: string }[] = [
  {
    id: "ME-01",
    codigo: "ME-01",
    titulo: "Mayoría Simple",
    desc: "Gana quien obtiene el mayor numero de votos validos.",
  },
  {
    id: "ME-02",
    codigo: "ME-02",
    titulo: "Absoluta / 2da Vuelta",
    desc: "Exige superar el 50% o pasar a una segunda vuelta.",
  },
  {
    id: "ME-03",
    codigo: "ME-03",
    titulo: "Proporcional",
    desc: "Reparte curules con formula de asignacion y umbral electoral.",
  },
  {
    id: "ME-04",
    codigo: "ME-04",
    titulo: "Voto Alternativo",
    desc: "Elimina al menos votado y redistribuye segun preferencias.",
  },
]

const modelos: {
  id: ModeloCandidatura
  titulo: string
  descripcion: string
}[] = [
  {
    id: "unico",
    titulo: "Candidato Único",
    descripcion: "La eleccion se resuelve entre personas individuales.",
  },
  {
    id: "abierta",
    titulo: "Lista de Partido Abierta",
    descripcion: "Se vota por partido y candidato, y el orden lo define el votante.",
  },
  {
    id: "cerrada",
    titulo: "Lista de Partido Cerrada",
    descripcion: "Se vota solo por el partido y el orden ya viene definido.",
  },
]

function clampCurules(val: string): string {
  const n = parseInt(val, 10)
  if (isNaN(n) || n < 1) return "1"
  return String(n)
}

function clampUmbral(val: string): string {
  const n = parseFloat(val)
  if (isNaN(n) || n < 0) return "0"
  if (n > 100) return "100"
  return val
}

function getModeloHelperText(metodoSeleccionado: MetodoElectoral) {
  if (metodoSeleccionado === "ME-03") {
    return "En proporcional puedes elegir listas abiertas, cerradas, o ambas a la vez."
  }

  return "Para mayoría simple, segunda vuelta y voto alternativo solo aplica candidato unico."
}

export default function MetodoElectoralReglas() {
  const navigate = useNavigate()

  const draftPaso1 = loadConfiguracionPaso1Draft()
  const draftPaso2 = loadConfiguracionPaso2Draft()
  const paso2Inicial = sanitizePaso2Draft(draftPaso1.tipoEleccion, draftPaso2)
  const presetTipoEleccion = getTipoEleccionPreset(draftPaso1.tipoEleccion)

  const [metodoSeleccionado, setMetodoSeleccionado] = useState<MetodoElectoral>(
    paso2Inicial.metodoSeleccionado
  )
  const [umbralElectoral, setUmbralElectoral] = useState(paso2Inicial.umbralElectoral)
  const [metodoCurules, setMetodoCurules] = useState(paso2Inicial.metodoCurules)
  const [modelosCandidatura, setModelosCandidatura] = useState<ModeloCandidatura[]>(
    paso2Inicial.modelosCandidatura
  )
  const [votoBlancoHabilitado, setVotoBlancoHabilitado] = useState(
    paso2Inicial.votoBlancoHabilitado
  )
  const [idiomaTargeton, setIdiomaTargeton] = useState(paso2Inicial.idiomaTargeton)
  const [numeroCurules, setNumeroCurules] = useState(paso2Inicial.numeroCurules)
  const [guardando, setGuardando] = useState(false)
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null)
  const [guardadoExitoso, setGuardadoExitoso] = useState(false)

  const metodoConfig = getMetodoVictoryConfig(metodoSeleccionado)
  const modelosCompatibles =
    presetTipoEleccion?.modelosCompatibles ?? getModelosCompatibles(metodoSeleccionado)
  const metodoBloqueado = presetTipoEleccion?.lockMethod ?? false
  const modeloBloqueado = presetTipoEleccion?.lockModelo ?? false
  const esLegislativa = draftPaso1.tipoEleccion === "LEGISLATIVA"

  // Estado específico para elección legislativa
  const [tabLegislativa, setTabLegislativa] = useState<"senado" | "camara">("senado")
  const [configSenado, setConfigSenado] = useState<ConfiguracionSenado>(
    paso2Inicial.configuracionSenado ?? defaultConfiguracionSenado()
  )
  const [configCamara, setConfigCamara] = useState<ConfiguracionCamaraDepto[]>(
    paso2Inicial.configuracionCamara ?? defaultConfiguracionCamara()
  )
  const [configCamaraEspeciales, setConfigCamaraEspeciales] = useState<ConfiguracionCamaraEspecial[]>(
    paso2Inicial.configuracionCamaraEspeciales ?? defaultConfiguracionCamaraEspeciales()
  )

  function applyPaso2State(next: Paso2Config) {
    setMetodoSeleccionado(next.metodoSeleccionado)
    setUmbralElectoral(next.umbralElectoral)
    setMetodoCurules(next.metodoCurules)
    setNumeroCurules(next.numeroCurules)
    setModelosCandidatura(next.modelosCandidatura)
    setVotoBlancoHabilitado(next.votoBlancoHabilitado)
    setIdiomaTargeton(next.idiomaTargeton)
  }

  function normalizeCurrentPaso2(overrides: Partial<Paso2Config> = {}) {
    return sanitizePaso2Draft(draftPaso1.tipoEleccion, {
      metodoSeleccionado,
      umbralElectoral,
      metodoCurules,
      numeroCurules,
      modelosCandidatura,
      votoBlancoHabilitado,
      idiomaTargeton,
      ...overrides,
    })
  }

  function handleMetodoSeleccion(nextMetodo: MetodoElectoral) {
    if (metodoBloqueado) return
    applyPaso2State(normalizeCurrentPaso2({ metodoSeleccionado: nextMetodo }))
  }

  function handleModeloToggle(modelo: ModeloCandidatura) {
    if (modeloBloqueado || !modelosCompatibles.includes(modelo)) return

    let nuevosModelos: ModeloCandidatura[]

    if (modelo === "unico") {
      // Candidato único es exclusivo: deselecciona los demás
      nuevosModelos = ["unico"]
    } else {
      // Listas de partido: se pueden combinar entre sí, pero excluyen a "unico"
      const sinUnico = modelosCandidatura.filter((m) => m !== "unico")
      if (sinUnico.includes(modelo)) {
        // Desmarcar: solo si queda al menos uno seleccionado
        const restantes = sinUnico.filter((m) => m !== modelo)
        nuevosModelos = restantes.length > 0 ? restantes : sinUnico
      } else {
        nuevosModelos = [...sinUnico, modelo]
      }
    }

    applyPaso2State(normalizeCurrentPaso2({ modelosCandidatura: nuevosModelos }))
  }

  function buildPayload(): Paso2Config {
    const base = normalizeCurrentPaso2()
    if (esLegislativa) {
      return {
        ...base,
        configuracionSenado: configSenado,
        configuracionCamara: configCamara,
        configuracionCamaraEspeciales: configCamaraEspeciales,
      }
    }
    return base
  }

  async function handleGuardarBorrador() {
    setGuardando(true)
    setErrorGuardado(null)
    setGuardadoExitoso(false)

    try {
      const payload = buildPayload()
      saveConfiguracionPaso2Draft(payload)
      applyPaso2State(payload)
      setGuardadoExitoso(true)
    } catch (error) {
      setErrorGuardado(
        error instanceof Error ? error.message : "No se pudo guardar el avance local"
      )
      throw error
    } finally {
      setGuardando(false)
    }
  }

  async function handleContinuar() {
    try {
      await handleGuardarBorrador()
      navigate("/configuracion/circunscripciones")
    } catch {
      // El error ya se muestra en pantalla.
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
            <p className="font-bold text-sm text-gray-900">Sello Legítimo</p>
            <p className="text-red-500 text-[10px] font-semibold tracking-wider">
              SISTEMA ELECTORAL COLOMBIANO
            </p>
          </div>
        </div>

        <UserMenu />
      </header>

      <main className="flex-1 px-8 py-6 max-w-4xl mx-auto w-full">

        <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
          <button onClick={() => navigate("/")} className="hover:text-gray-700">
            Configuración de Elección
          </button>
          <ChevronRight size={12} />
          <span className="text-gray-700">Métodos y Reglas</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Métodos y Reglas de Victoria
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Paso 2: define cómo se cuentan los votos y qué modelos de candidatura son válidos.
        </p>

        <div className="bg-white border rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="text-xs font-semibold text-gray-500 tracking-wide">
                PROGRESO DE CONFIGURACIÓN
              </p>
              <p className="text-xs text-red-500 font-semibold mt-0.5">
                Paso 2 de 3: Método Electoral y Reglas
              </p>
            </div>
            <span className="text-lg font-bold text-gray-900">66%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full">
            <div className="h-1.5 bg-red-500 rounded-full" style={{ width: "66%" }} />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Siguiente: Circunscripciones y Distritos
          </p>
        </div>

        <div className="bg-white border rounded-xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
              1
            </div>
            <h2 className="font-semibold text-gray-900">Seleccionar Método Electoral</h2>
          </div>

          {presetTipoEleccion && (
            <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              Este tipo de elección fija automáticamente el método electoral en {metodoSeleccionado}.
            </div>
          )}

          <div className="grid grid-cols-4 gap-3">
            {metodos.map((m) => {
              const selected = metodoSeleccionado === m.id
              const disabled = metodoBloqueado && !selected
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleMetodoSeleccion(m.id)}
                  disabled={disabled || metodoBloqueado}
                  className={`text-left border rounded-xl p-4 transition ${
                    selected
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  } ${disabled ? "opacity-45 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-gray-500">{m.codigo}</span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 ${
                        selected ? "bg-red-500 border-red-500" : "border-gray-300"
                      }`}
                    />
                  </div>
                  <p className="text-xs font-semibold text-gray-800 mb-1">{m.titulo}</p>
                  <p className="text-[11px] text-gray-500 leading-snug">{m.desc}</p>
                </button>
              )
            })}
          </div>
        </div>

        <div className="bg-white border rounded-xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
              2
            </div>
            <h2 className="font-semibold text-gray-900">Configuración de Reglas de Victoria</h2>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 mb-4">
            <p className="text-sm font-semibold text-gray-900 mb-1">{metodoConfig.titulo}</p>
            <p className="text-sm text-gray-600">{metodoConfig.descripcion}</p>
          </div>

          {/* ── Rama LEGISLATIVA: Senado + Cámara ── */}
          {esLegislativa ? (
            <div>
              {/* Tabs */}
              <div className="flex gap-1 mb-5 border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => setTabLegislativa("senado")}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition ${
                    tabLegislativa === "senado"
                      ? "border-red-500 text-red-600 bg-red-50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-base"></span>
                  Senado de la República
                </button>
                <button
                  type="button"
                  onClick={() => setTabLegislativa("camara")}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition ${
                    tabLegislativa === "camara"
                      ? "border-red-500 text-red-600 bg-red-50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-base"></span>
                  Cámara de Representantes
                </button>
              </div>

              {/* ── Tab: SENADO ── */}
              {tabLegislativa === "senado" && (
                <div>
                  <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 mb-5">
                    <p className="text-xs font-semibold text-blue-800 mb-0.5">Senado de la República — Circunscripción Nacional</p>
                    <p className="text-xs text-blue-700">
                      El Senado se elige en circunscripción nacional. Todos los partidos compiten en el ámbito del territorio colombiano.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Umbral Electoral (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={configSenado.umbral}
                          onChange={(e) => setConfigSenado((p) => ({ ...p, umbral: clampUmbral(e.target.value) }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 pr-8 focus:outline-none focus:ring-2 focus:ring-red-300"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Mínimo para asignar curules. Ej: 3%.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Número de Curules <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={configSenado.curules}
                        onChange={(e) => setConfigSenado((p) => ({ ...p, curules: clampCurules(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                      />
                      <p className="text-xs text-gray-400 mt-1">Total de senadores a elegir.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Fórmula de Asignación <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={configSenado.formula}
                          onChange={(e) => setConfigSenado((p) => ({ ...p, formula: e.target.value }))}
                          className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-300"
                        >
                          <option value="dhondt">D'Hondt</option>
                          <option value="sainte-lague">Sainte-Laguë</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Tab: CÁMARA DE REPRESENTANTES ── */}
              {tabLegislativa === "camara" && (
                <div>
                  <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 mb-5">
                    <p className="text-xs font-semibold text-amber-800 mb-0.5">Cámara de Representantes — Circunscripciones Territoriales y Especiales</p>
                    <p className="text-xs text-amber-700">
                      Cada departamento tiene una circunscripción propia. Asigna el número de curules y el umbral para cada uno.
                    </p>
                  </div>

                  {/* Resumen + Botón reset */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5">
                        <p className="text-xs text-gray-500">
                          Total territorial:{" "}
                          <span className="font-bold text-gray-900">
                            {configCamara.reduce((acc, d) => acc + (parseInt(d.curules) || 0), 0)} curules
                          </span>
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5">
                        <p className="text-xs text-gray-500">
                          Especiales:{" "}
                          <span className="font-bold text-gray-900">
                            {configCamaraEspeciales
                              .filter((e) => e.habilitada)
                              .reduce((acc, e) => acc + (parseInt(e.curules) || 0), 0)}{" "}
                            curules
                          </span>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setConfigCamara(defaultConfiguracionCamara())
                        setConfigCamaraEspeciales(defaultConfiguracionCamaraEspeciales())
                      }}
                      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-300 rounded-lg px-3 py-1.5 transition"
                    >
                      <RotateCcw size={12} />
                      Restaurar valores por defecto
                    </button>
                  </div>

                  {/* Tabla de departamentos */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                    {/* Header fijo */}
                    <div className="grid grid-cols-[1fr_120px_120px] bg-gray-100 border-b border-gray-200">
                      <div className="px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">Departamento</div>
                      <div className="px-3 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide text-center">Curules</div>
                      <div className="px-3 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide text-center">Umbral (%)</div>
                    </div>

                    {/* Filas scrollables */}
                    <div className="overflow-y-auto" style={{ maxHeight: "320px" }}>
                      {configCamara.map((depto, idx) => (
                        <div
                          key={depto.departamento}
                          className={`grid grid-cols-[1fr_120px_120px] items-center border-b border-gray-100 last:border-0 ${
                            idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                          }`}
                        >
                          <div className="px-4 py-2 text-sm text-gray-800 font-medium">{depto.departamento}</div>
                          <div className="px-3 py-2">
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={depto.curules}
                              onChange={(e) => {
                                const updated = [...configCamara]
                                updated[idx] = { ...updated[idx], curules: clampCurules(e.target.value) }
                                setConfigCamara(updated)
                              }}
                              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-center text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                            />
                          </div>
                          <div className="px-3 py-2">
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={depto.umbral}
                                onChange={(e) => {
                                  const updated = [...configCamara]
                                  updated[idx] = { ...updated[idx], umbral: clampUmbral(e.target.value) }
                                  setConfigCamara(updated)
                                }}
                                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-center text-gray-700 pr-6 focus:outline-none focus:ring-2 focus:ring-red-300"
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Circunscripciones especiales */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-100 border-b border-gray-200 px-4 py-2.5">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Circunscripciones Especiales</p>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {configCamaraEspeciales.map((esp, idx) => (
                        <div key={esp.nombre} className="flex items-center gap-4 px-4 py-3">
                          {/* Toggle habilitada */}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...configCamaraEspeciales]
                              updated[idx] = { ...updated[idx], habilitada: !updated[idx].habilitada }
                              setConfigCamaraEspeciales(updated)
                            }}
                            className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                              esp.habilitada ? "bg-red-500" : "bg-gray-300"
                            }`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                                esp.habilitada ? "translate-x-4.5" : "translate-x-0.5"
                              }`}
                            />
                          </button>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold ${esp.habilitada ? "text-gray-800" : "text-gray-400"}`}>
                              {esp.nombre}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{esp.descripcion}</p>
                          </div>
                          {/* Curules */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-gray-500">Curules:</span>
                            <input
                              type="number"
                              min="1"
                              step="1"
                              disabled={!esp.habilitada}
                              value={esp.curules}
                              onChange={(e) => {
                                const updated = [...configCamaraEspeciales]
                                updated[idx] = { ...updated[idx], curules: clampCurules(e.target.value) }
                                setConfigCamaraEspeciales(updated)
                              }}
                              className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-sm text-center text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:bg-gray-100 disabled:text-gray-400"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

          ) : (
            /* ── Rama GENÉRICA para otros tipos de elección ── */
            <>
              {metodoConfig.usaConteoDirecto && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 mb-4">
                  Regla activa: conteo directo de votos. No aplica umbral electoral ni método de curules.
                </div>
              )}

              {metodoConfig.umbralFijo && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Umbral Electoral Implícito
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={metodoConfig.umbralFijo}
                        readOnly
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 pr-8 bg-gray-50"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                        %
                      </span>
                    </div>
                  </div>
                  <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                    Configuración clave: si nadie supera el 50%, el sistema debe preparar una segunda vuelta.
                  </div>
                </div>
              )}

              {(metodoConfig.usaUmbralEditable || metodoConfig.usaMetodoCurules || metodoConfig.usaNumeroCurules) && (
                <div className="grid grid-cols-2 gap-4 mb-3">
                  {metodoConfig.usaUmbralEditable && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Umbral Electoral (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={umbralElectoral}
                          onChange={(e) => setUmbralElectoral(clampUmbral(e.target.value))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 pr-8 focus:outline-none focus:ring-2 focus:ring-red-300"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                          %
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Ejemplo: 3% minimo para participar en la asignación de curules.
                      </p>
                    </div>
                  )}

                  {metodoConfig.usaNumeroCurules && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Numero de Curules <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={numeroCurules}
                        onChange={(e) => setNumeroCurules(clampCurules(e.target.value))}
                        placeholder="Ej: 100"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                      />
                    </div>
                  )}

                  {metodoConfig.usaMetodoCurules && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Método de Asignación de Curules <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={metodoCurules}
                          onChange={(e) => setMetodoCurules(e.target.value)}
                          className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-300"
                        >
                          <option value="dhondt">D'Hondt</option>
                          <option value="sainte-lague">Sainte-Laguë</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {metodoConfig.usaRedistribucion && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-gray-200 p-4 bg-white">
                    <p className="text-sm font-semibold text-gray-900 mb-1">Eliminación sucesiva</p>
                    <p className="text-xs text-gray-500">
                      El sistema elimina al candidato con menos votos en cada ronda.
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4 bg-white">
                    <p className="text-sm font-semibold text-gray-900 mb-1">Redistribución de preferencias</p>
                    <p className="text-xs text-gray-500">
                      Los votos se reasignan según el siguiente orden marcado por el votante.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="bg-white border rounded-xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
              3
            </div>
            <h2 className="font-semibold text-gray-900">Modelo de Candidatura</h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {modelos.map((modelo) => {
              const esMultiSeleccionable = modelo.id !== "unico"
              const selected = modelosCandidatura.includes(modelo.id)
              const disabled = !modelosCompatibles.includes(modelo.id)
              return (
                <button
                  key={modelo.id}
                  type="button"
                  onClick={() => handleModeloToggle(modelo.id)}
                  disabled={disabled || modeloBloqueado}
                  className={`text-left border rounded-xl p-4 transition ${
                    selected
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  } ${disabled ? "opacity-45 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    {esMultiSeleccionable ? (
                      // Checkbox cuadrado para listas de partido (pueden combinarse)
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          selected ? "bg-red-500 border-red-500" : "border-gray-300"
                        }`}
                      >
                        {selected && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                            <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    ) : (
                      // Radio circular para candidato único (excluyente)
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                          selected ? "bg-red-500 border-red-500" : "border-gray-300"
                        }`}
                      />
                    )}
                    {esMultiSeleccionable && !disabled && (
                      <span className="text-[9px] text-red-400 font-semibold tracking-wide">MULTI</span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-gray-800 mb-1">{modelo.titulo}</p>
                  <p className="text-[11px] text-gray-500 leading-snug">{modelo.descripcion}</p>
                </button>
              )
            })}
          </div>

          {metodoSeleccionado === "ME-03" && (
            <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
              Puedes seleccionar <strong>Lista Abierta</strong>, <strong>Lista Cerrada</strong> o <strong>ambas</strong> simultáneamente.
              Al menos una debe quedar seleccionada.
            </div>
          )}

          <p className="text-xs text-gray-400 mt-2">{getModeloHelperText(metodoSeleccionado)}</p>
        </div>

        <div className="bg-white border rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
              4
            </div>
            <h2 className="font-semibold text-gray-900">Tarjetón e Idioma</h2>
          </div>

          <div className="grid grid-cols-2 gap-6 items-start">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800 mb-0.5">
                    Voto en Blanco
                  </p>
                  <p className="text-xs text-gray-500">
                    Mantiene la opción oficial de voto en blanco en el tarjetón.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setVotoBlancoHabilitado(!votoBlancoHabilitado)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none mt-0.5 ${
                    votoBlancoHabilitado ? "bg-red-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      votoBlancoHabilitado ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Idioma Principal del Tarjetón
              </label>
              <div className="relative">
                <select
                  value={idiomaTargeton}
                  onChange={(e) => setIdiomaTargeton(e.target.value)}
                  className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  <option value="es-CO">Español (Colombia)</option>
                  <option value="en">Inglés</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {(errorGuardado || guardadoExitoso) && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
              errorGuardado
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {errorGuardado || "Avance del paso 2 guardado localmente. Se enviará al final."}
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            <ChevronLeft size={14} />
            Regresar al Paso 1
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleGuardarBorrador}
              disabled={guardando}
              className="px-5 py-2 text-sm text-gray-600 hover:text-gray-900 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {guardando ? "Guardando..." : "Guardar Borrador"}
            </button>
            <button
              type="button"
              onClick={handleContinuar}
              disabled={guardando}
              className="px-5 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition flex items-center gap-1 disabled:cursor-not-allowed disabled:bg-red-300"
            >
              {guardando ? "Enviando..." : "Continuar al Paso 3"}
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </main>

      <footer className="border-t bg-white py-3 px-8 text-center text-xs text-gray-400">
        Certificado ISO 27001 &nbsp;|&nbsp; Regulado por el CNE (Colombia) &nbsp;|&nbsp; Estándar de Sistemas a Sistema
      </footer>

    </div>
  )
}