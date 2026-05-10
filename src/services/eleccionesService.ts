// Business logic / service layer for elections
import { guardarConfiguracionFinal } from "../api/eleccionesApi"
import type { ConfiguracionCompletaDraft } from "./configuracionDraftService"
import { isMetodoElectoral } from "./electionConfigRules"

export type { ConfiguracionCompletaDraft } from "./configuracionDraftService"

// ── Enum mappers ──────────────────────────────────────────────────────────────

function mapModalidadHabilitada(presencial: boolean, remota: boolean): string {
  if (presencial && remota) return "AMBAS"
  if (presencial) return "PRESENCIAL"
  if (remota) return "REMOTA"
  return "PRESENCIAL"
}

function mapTipoCircunscripcion(circunscripcion: string): string {
  const mapa: Record<string, string> = {
    nacional: "NACIONAL",
    territorial: "TERRITORIAL",
    especiales: "ESPECIAL",
    internacional: "INTERNACIONAL",
  }
  return mapa[circunscripcion.toLowerCase()] ?? circunscripcion.toUpperCase()
}

// ── Payload builder ───────────────────────────────────────────────────────────

// Los inputs datetime-local envían "2026-05-01T08:00" (sin segundos).
// Spring @JsonFormat("yyyy-MM-dd'T'HH:mm:ss") requiere los segundos incluidos.
// Devuelve null si la fecha está vacía para que @NotNull del backend dé un error
// de validación legible en lugar de "JSON inválido".
function normalizarFecha(fecha: string): string | null {
  if (!fecha) return null
  if (fecha.length === 16) return fecha + ":00"
  return fecha
}

function resolverDocumentoNoVotable(edadDesde: string | undefined): string {
  const edadMinima = Number.parseInt((edadDesde ?? "").trim(), 10)

  if (Number.isNaN(edadMinima) || edadMinima >= 18) {
    return "N/A"
  }

  return "TI"
}

function buildMicroservicioPayload(draft: ConfiguracionCompletaDraft): Record<string, unknown> {
  const circunscripcionActiva = draft.circunscripcionActiva ?? "nacional"
  const metodoSeleccionado = isMetodoElectoral(draft.metodoSeleccionado)
    ? draft.metodoSeleccionado
    : "ME-01"
  const codigoMetodo = metodoSeleccionado.replace(/-/g, "_")

  // Valores válidos de circunscripciones especiales en el backend:
  // INDIGENA, AFRODESCENDIENTE, EXTERIOR, PAZ
  let circunscripcionesEspeciales: string[] = []
  if (circunscripcionActiva === "especiales") {
    circunscripcionesEspeciales = ["INDIGENA", "AFRODESCENDIENTE", "PAZ"]
  } else if (circunscripcionActiva === "internacional") {
    circunscripcionesEspeciales = ["EXTERIOR"]
  }

  const payload: Record<string, unknown> = {
    // ── Paso 1: Información básica ───────────────────────────────────────────
    nombreOficial: (draft.nombreEleccion ?? "").trim().toUpperCase(),
    pais: "COLOMBIA",
    // || en vez de ?? porque "" (cadena vacía) también es inválido para los enums del backend
    tipoEleccion: draft.tipoEleccion || "PRESIDENCIAL",
    estado: draft.estadoEleccion || "BORRADOR",
    codigoMetodoElectoral: codigoMetodo,
    fechaInicioJornada: normalizarFecha(draft.fechaInicio ?? ""),
    fechaCierreJornada: normalizarFecha(draft.fechaCierre ?? ""),
    modalidadHabilitada: mapModalidadHabilitada(
      draft.votacionPresencial ?? false,
      draft.votacionRemota ?? false
    ),

    // ── Paso 3: Circunscripciones y elegibilidad ─────────────────────────────
    tipoCircunscripcion: mapTipoCircunscripcion(circunscripcionActiva),
    jerarquiaGeografica: ["PAIS", "DEPARTAMENTO", "MUNICIPIO", "PUESTO_DE_VOTACION", "MESA"],
    circunscripcionesEspeciales,

    // Exenciones: array de strings en mayúsculas. Si viene vacío se deja ["SIN_EXENCIONES"].
    excencionesHabilitadas:
      Array.isArray(draft.excencionesSeleccionadas) && draft.excencionesSeleccionadas.length > 0
        ? draft.excencionesSeleccionadas.map((e) => e.trim().toUpperCase())
        : ["SIN_EXENCIONES"],

    // ── Defaults ─────────────────────────────────────────────────────────────
    zonaHoraria: "America/Bogota",
    idioma: draft.idiomaTargeton ?? "es-CO",
    documentoNoVotable: resolverDocumentoNoVotable(draft.edadDesde),
  }

  // ── Campos específicos por método electoral ──────────────────────────────
  if (codigoMetodo === "ME_02") {
    payload.umbralPrimeraVueltaPorcentaje = 50
    payload.requiereMasUnoPrimeraVuelta = true
  }

  if (codigoMetodo === "ME_03") {
    const umbral = parseFloat(draft.umbralElectoral ?? "3.0") || 3.0
    payload.porcentajeUmbralListas = umbral
    payload.numeroCurules = parseInt(draft.numeroCurules ?? "1", 10) || 1
    payload.formulaCifraRepartidora = (draft.metodoCurules ?? "dhondt")
      .toUpperCase()
      .replace(/-/g, "_")
  }

  // Modelos de candidatura seleccionados (pueden ser varios para ME-03)
  const modelosCandidatura = (draft.modelosCandidatura ?? []).map((m) => m.toUpperCase())
  if (modelosCandidatura.length > 0) {
    payload.modelosCandidatura = modelosCandidatura
  }

  if (codigoMetodo === "ME_04") {
    payload.criterioEliminacion = "ELIMINACION_ITERATIVA"
  }

  // Configuracion especifica para elecciones legislativas (Senado + Camara)
  if ((draft.tipoEleccion ?? "").toUpperCase() === "LEGISLATIVA") {
    if (draft.configuracionSenado) {
      payload.configuracionSenado = draft.configuracionSenado
    }
    if (draft.configuracionCamara && draft.configuracionCamara.length > 0) {
      payload.configuracionCamara = draft.configuracionCamara
    }
    if (draft.configuracionCamaraEspeciales && draft.configuracionCamaraEspeciales.length > 0) {
      payload.configuracionCamaraEspeciales = draft.configuracionCamaraEspeciales
    }
  }

  return payload
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function enviarConfiguracionFinal(form: ConfiguracionCompletaDraft) {
  const payload = buildMicroservicioPayload(form)
  return guardarConfiguracionFinal(payload)
}
