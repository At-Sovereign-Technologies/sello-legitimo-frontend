import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Lock, ChevronDown, Clock, ChevronRight } from "lucide-react"
import UserMenu from "../../components/UserMenu"
import {
  loadConfiguracionPaso1Draft,
  loadConfiguracionPaso2Draft,
  loadConfiguracionPaso3Draft,
  saveConfiguracionPaso1Draft,
  saveConfiguracionPaso2Draft,
  saveConfiguracionPaso3Draft,
} from "../../services/configuracionDraftService"
import {
  sanitizePaso2Draft,
  sanitizePaso3Draft,
} from "../../services/electionConfigRules"

export default function ParametrosBase() {
  const navigate = useNavigate()

  const draftPaso1 = loadConfiguracionPaso1Draft()
  const draftPaso2 = loadConfiguracionPaso2Draft()
  const draftPaso3 = loadConfiguracionPaso3Draft()

  const [nombreEleccion, setNombreEleccion] = useState(draftPaso1.nombreEleccion ?? "")
  const [tipoEleccion, setTipoEleccion] = useState(draftPaso1.tipoEleccion ?? "")
  const estadoEleccion = "BORRADOR"
  const today = new Date().toISOString().slice(0, 16)
  const [fechaInicio, setFechaInicio] = useState(draftPaso1.fechaInicio ?? "")
  const [fechaCierre, setFechaCierre] = useState(draftPaso1.fechaCierre ?? "")
  const [jornadaExtendida, setJornadaExtendida] = useState(draftPaso1.jornadaExtendida ?? true)
  const [horaApertura, setHoraApertura] = useState(draftPaso1.horaApertura ?? "08:00")
  const [horaCierre, setHoraCierre] = useState(draftPaso1.horaCierre ?? "16:00")
  const [votacionPresencial, setVotacionPresencial] = useState(
    draftPaso1.votacionPresencial ?? true
  )
  const [votacionRemota, setVotacionRemota] = useState(draftPaso1.votacionRemota ?? true)
  const [guardando, setGuardando] = useState(false)
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null)
  const [guardadoExitoso, setGuardadoExitoso] = useState(false)

  function handleTipoEleccionChange(nextTipoEleccion: string) {
    setTipoEleccion(nextTipoEleccion)

    if (!nextTipoEleccion) return

    const paso2Normalizado = sanitizePaso2Draft(nextTipoEleccion, draftPaso2)
    const paso3Normalizado = sanitizePaso3Draft(
      nextTipoEleccion,
      paso2Normalizado.metodoSeleccionado,
      draftPaso3
    )

    saveConfiguracionPaso2Draft(paso2Normalizado)
    saveConfiguracionPaso3Draft(paso3Normalizado)
  }

  function buildPayload() {
    return {
      nombreEleccion,
      tipoEleccion,
      estadoEleccion,
      fechaInicio,
      fechaCierre,
      jornadaExtendida,
      horaApertura,
      horaCierre,
      votacionPresencial,
      votacionRemota,
    }
  }

  async function handleGuardarBorrador() {
    setGuardando(true)
    setErrorGuardado(null)
    setGuardadoExitoso(false)

    try {
      saveConfiguracionPaso1Draft(buildPayload())
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
    if (!nombreEleccion.trim()) {
      setErrorGuardado("El nombre de la elección es obligatorio.")
      return
    }
    if (!tipoEleccion) {
      setErrorGuardado("El tipo de elección es obligatorio.")
      return
    }
    if (!fechaInicio) {
      setErrorGuardado("La fecha y hora de inicio son obligatorias.")
      return
    }
    if (!fechaCierre) {
      setErrorGuardado("La fecha y hora de cierre son obligatorias.")
      return
    }
    if (new Date(fechaCierre) <= new Date(fechaInicio)) {
      setErrorGuardado("La fecha de cierre debe ser posterior a la fecha de inicio.")
      return
    }

    try {
      await handleGuardarBorrador()
      navigate("/configuracion/metodo-electoral")
    } catch {
      // El error ya se muestra en pantalla.
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
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

      {/* Main */}
      <main className="flex-1 px-8 py-6 max-w-4xl mx-auto w-full">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
          <button onClick={() => navigate("/")} className="hover:text-gray-700">
            Panel de control
          </button>
          <ChevronRight size={12} />
          <span className="text-gray-700">Nueva configuración electoral</span>
        </div>

        {/* Page title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Configuración Básica y Modalidad
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Cumplimiento RF-MI-001 y RF-MI-007 - Sistema de alta transparencia para Colombia
        </p>

        {/* Progress */}
        <div className="bg-white border rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="text-xs font-semibold text-gray-500 tracking-wide">
                PROGRESO DE CONFIGURACIÓN
              </p>
              <p className="text-xs text-red-500 font-semibold mt-0.5">
                Paso 1 de 3: Información Básica y Modalidad
              </p>
            </div>
            <span className="text-lg font-bold text-gray-900">33%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full">
            <div className="h-1.5 bg-red-500 rounded-full" style={{ width: "33%" }} />
          </div>
        </div>

        {/* Section 1: Información General */}
        <div className="bg-white border rounded-xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
              1
            </div>
            <h2 className="font-semibold text-gray-900">Información General</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Nombre */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Nombre de la Elección
              </label>
              <input
                type="text"
                value={nombreEleccion}
                onChange={(e) => setNombreEleccion(e.target.value)}
                placeholder="ej. Presidenciales Colombia 2026"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-300"
              />
            </div>

            {/* País bloqueado */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                País (Bloqueado)
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
                <span className="flex-1 text-sm text-gray-700">Colombia</span>
                <Lock size={14} className="text-gray-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Tipo de Elección */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Tipo de Elección
              </label>
              <div className="relative">
                <select
                  value={tipoEleccion}
                  onChange={(e) => handleTipoEleccionChange(e.target.value)}
                  className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  <option value="" disabled>Seleccionar tipo...</option>
                  <option value="PRESIDENCIAL">Presidencial</option>
                  <option value="LEGISLATIVA">Legislativa</option>
                  <option value="TERRITORIAL">Territorial</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Estado fijo */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Estado de la Elección
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
                <span className="flex-1 text-sm text-gray-700">Borrador</span>
                <Lock size={14} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Configuración de Fecha y Hora */}
        <div className="bg-white border rounded-xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
              2
            </div>
            <h2 className="font-semibold text-gray-900">Configuración de Fecha y Hora</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Fecha y Hora de Inicio
              </label>
              <input
                type="datetime-local"
                value={fechaInicio}
                min={today}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Fecha y Hora de Cierre
              </label>
              <input
                type="datetime-local"
                value={fechaCierre}
                min={fechaInicio || today}
                onChange={(e) => setFechaCierre(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300"
              />
            </div>
          </div>

          {/* Jornada Extendida toggle */}
          <div className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Configuración de Jornada Extendida
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Habilitar restricciones de horario y continuos durante los días específicos en
                </p>
              </div>
              {/* Toggle */}
              <button
                type="button"
                onClick={() => setJornadaExtendida(!jornadaExtendida)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  jornadaExtendida ? "bg-red-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    jornadaExtendida ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Horas apertura/cierre */}
          {jornadaExtendida && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 tracking-wider mb-1">
                  HORA DE APERTURA DIARIA
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={horaApertura}
                    onChange={(e) => setHoraApertura(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                  />
                  <Clock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 tracking-wider mb-1">
                  HORA DE CIERRE DIARIO
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={horaCierre}
                    onChange={(e) => setHoraCierre(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                  />
                  <Clock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Modalidades Habilitadas */}
        <div className="bg-white border rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
              3
            </div>
            <h2 className="font-semibold text-gray-900">Modalidades Habilitadas</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Votación Presencial */}
            <div
              className={`border rounded-xl p-4 cursor-pointer transition ${
                votacionPresencial
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setVotacionPresencial(!votacionPresencial)}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">VP</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-800">Votación Presencial</p>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                        votacionPresencial
                          ? "bg-red-500 border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Urnas tradicionales y puestos de votación físicos en todo el territorio nacional.
                  </p>
                </div>
              </div>
            </div>

            {/* Votación Remota */}
            <div
              className={`border rounded-xl p-4 cursor-pointer transition ${
                votacionRemota
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setVotacionRemota(!votacionRemota)}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">VR</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-800">Votación Remota</p>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                        votacionRemota
                          ? "bg-red-500 border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Plataforma digital segura para circunscripciones específicas o diáspora a través de portal seguro.
                  </p>
                </div>
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
            {errorGuardado || "Avance guardado localmente. Se enviará al final."}
          </div>
        )}

        {/* Bottom actions */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleGuardarBorrador}
            disabled={guardando}
            className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {guardando ? "Guardando..." : "Guardar Borrador"}
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-5 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleContinuar}
              disabled={guardando}
              className="px-5 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition flex items-center gap-1 disabled:cursor-not-allowed disabled:bg-red-300"
            >
              {guardando ? "Enviando..." : "Continuar al Paso 2"}
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-3 px-8 text-center text-xs text-gray-400">
        Configuración del Sistema RF-MI-001 / RF-MI-007 | Guardar Sello Legítimo
      </footer>

    </div>
  )
}
