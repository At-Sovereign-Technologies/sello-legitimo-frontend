import type {
  ConfiguracionSenado,
  ConfiguracionCamaraDepto,
  ConfiguracionCamaraEspecial,
} from "./electionConfigRules"

const DRAFT_KEY = "sello_legitimo_configuracion_draft"

export interface ConfiguracionPaso1Draft {
  nombreEleccion: string
  tipoEleccion: string
  estadoEleccion: string
  fechaInicio: string
  fechaCierre: string
  jornadaExtendida: boolean
  horaApertura: string
  horaCierre: string
  votacionPresencial: boolean
  votacionRemota: boolean
}

export interface ConfiguracionPaso2Draft {
  metodoSeleccionado: string
  umbralElectoral: string
  metodoCurules: string
  numeroCurules: string
  modelosCandidatura: string[]
  votoBlancoHabilitado: boolean
  idiomaTargeton: string
  configuracionSenado?: ConfiguracionSenado
  configuracionCamara?: ConfiguracionCamaraDepto[]
  configuracionCamaraEspeciales?: ConfiguracionCamaraEspecial[]
}

export interface ConfiguracionPaso3Draft {
  circunscripcionActiva: string
  edadDesde: string
  edadHasta: string
  excencionesSeleccionadas: string[]
}

export interface ConfiguracionCompletaDraft
  extends Partial<ConfiguracionPaso1Draft>,
    Partial<ConfiguracionPaso2Draft>,
    Partial<ConfiguracionPaso3Draft> {}

interface DraftStorage {
  paso1?: ConfiguracionPaso1Draft
  paso2?: ConfiguracionPaso2Draft
  paso3?: ConfiguracionPaso3Draft
}

function readDraftStorage(): DraftStorage {
  const raw = localStorage.getItem(DRAFT_KEY)
  if (!raw) return {}

  try {
    return JSON.parse(raw) as DraftStorage
  } catch {
    return {}
  }
}

function writeDraftStorage(storage: DraftStorage): void {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(storage))
}

export function loadConfiguracionPaso1Draft(): Partial<ConfiguracionPaso1Draft> {
  return readDraftStorage().paso1 ?? {}
}

export function loadConfiguracionPaso2Draft(): Partial<ConfiguracionPaso2Draft> {
  return readDraftStorage().paso2 ?? {}
}

export function loadConfiguracionPaso3Draft(): Partial<ConfiguracionPaso3Draft> {
  return readDraftStorage().paso3 ?? {}
}

export function saveConfiguracionPaso1Draft(data: ConfiguracionPaso1Draft): void {
  const storage = readDraftStorage()
  storage.paso1 = data
  writeDraftStorage(storage)
}

export function saveConfiguracionPaso2Draft(data: ConfiguracionPaso2Draft): void {
  const storage = readDraftStorage()
  storage.paso2 = data
  writeDraftStorage(storage)
}

export function saveConfiguracionPaso3Draft(data: ConfiguracionPaso3Draft): void {
  const storage = readDraftStorage()
  storage.paso3 = data
  writeDraftStorage(storage)
}

export function buildConfiguracionCompletaDraft(): ConfiguracionCompletaDraft {
  const storage = readDraftStorage()
  return {
    ...storage.paso1,
    ...storage.paso2,
    ...storage.paso3,
  }
}

export function clearConfiguracionDraft(): void {
  localStorage.removeItem(DRAFT_KEY)
}
