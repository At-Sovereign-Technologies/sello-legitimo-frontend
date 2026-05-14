import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  CheckSquare, Play, ZoomIn, LogOut, User,
  ChevronRight, AlertCircle, AlertTriangle, X,
} from "lucide-react"
import AccessibilityButtons from "../components/AccesibilityButtons"
import Footer from "../components/Footer"
import ComingSoonToast from "../components/ComingSoonToast"

// US-01: clasificación de intención de voto (equivalente E-14)
type TipoVoto = "valido" | "blanco" | "no_marcado" | "nulo"
type CandidateId = "juan_pablo" | "elena" | "ricardo" | "blank"

interface Candidate {
  id: CandidateId
  name: string
  viceLabel: string
  vice: string
  party: string
  image?: string
}

const CANDIDATES: Candidate[] = [
  {
    id: "juan_pablo",
    name: "Juan Pablo Rodríguez",
    viceLabel: "Fórmula Vicepresidencial",
    vice: "Marta Lucía Santos",
    party: "Partido Alpha",
    image: "/candidates/1.jpg",
  },
  {
    id: "elena",
    name: "Elena Gómez",
    viceLabel: "Fórmula Vicepresidencial",
    vice: "Carlos Arturo Peña",
    party: "Movimiento Beta",
    image: "/candidates/2.jpg",
  },
  {
    id: "ricardo",
    name: "Ricardo Valencia",
    viceLabel: "Fórmula Vicepresidencial",
    vice: "Diana Marcela Ortiz",
    party: "Coalición Gamma",
    image: "/candidates/3.webp",
  },
]

// US-01: determinar TipoVoto según selección
function clasificarVoto(selected: CandidateId | null): TipoVoto {
  if (selected === null) return "no_marcado"
  if (selected === "blank") return "blanco"
  return "valido"
}

// ─── Diálogo de confirmación obligatoria (US-01) ──────────────────────────────
function DialogoNoMarcado({
  onConfirmar,
  onCancelar,
}: {
  onConfirmar: () => void
  onCancelar: () => void
}) {
  return (
    // faux-viewport para que el modal contribuya altura al layout
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialogo-titulo"
      aria-describedby="dialogo-desc"
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} className="text-amber-500" />
            </div>
            <h3
              id="dialogo-titulo"
              className="font-bold text-gray-900 text-base"
            >
              No ha seleccionado ninguna opción
            </h3>
          </div>
          <button
            onClick={onCancelar}
            aria-label="Cerrar diálogo"
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={18} />
          </button>
        </div>

        <p id="dialogo-desc" className="text-sm text-gray-600 mb-6 leading-relaxed">
          Su tarjetón no tiene ninguna marca. Si continúa, su voto será registrado
          como <strong className="text-gray-900">Voto No Marcado</strong> y no
          contará para ningún candidato ni para el voto en blanco formal.
          <br />
          <br />
          ¿Desea continuar sin marcar o prefiere regresar a seleccionar una opción?
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCancelar}
            className="flex-1 border border-gray-300 rounded-xl py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Regresar y seleccionar
          </button>
          <button
            onClick={onConfirmar}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-2.5 text-sm font-bold transition"
          >
            Confirmar voto no marcado
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Diálogo de confirmación de voto (US-01) ──────────────────────────────────
function DialogoConfirmacion({
  tipoVoto,
  selectionLabel,
  onConfirmar,
  onCancelar,
}: {
  tipoVoto: TipoVoto
  selectionLabel: string
  onConfirmar: () => void
  onCancelar: () => void
}) {
  const tagColors: Record<TipoVoto, string> = {
    valido:     "bg-green-100 text-green-800",
    blanco:     "bg-blue-100 text-blue-800",
    no_marcado: "bg-amber-100 text-amber-800",
    nulo:       "bg-gray-100 text-gray-600",
  }
  const tagLabels: Record<TipoVoto, string> = {
    valido:     "Voto Válido",
    blanco:     "Voto en Blanco Formal",
    no_marcado: "Voto No Marcado",
    nulo:       "Voto Nulo",
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-titulo"
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 id="confirm-titulo" className="font-bold text-gray-900 text-base">
            Confirme su voto
          </h3>
          <button onClick={onCancelar} aria-label="Cerrar" className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 uppercase tracking-wide">Selección</span>
            <span className="font-bold text-gray-900 text-sm">{selectionLabel}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 uppercase tracking-wide">Clasificación E-14</span>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${tagColors[tipoVoto]}`}>
              {tagLabels[tipoVoto]}
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-6 leading-relaxed">
          Una vez confirmado, su voto será enviado al Motor de Urna Digital y no
          podrá ser modificado.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCancelar}
            className="flex-1 border border-gray-300 rounded-xl py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Corregir mi voto
          </button>
          <button
            onClick={onConfirmar}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2.5 text-sm font-bold transition"
          >
            Confirmar y emitir voto
          </button>
        </div>
      </div>
    </div>
  )
}

function SelectionMark({ selected }: { selected: boolean }) {
  return (
    <div
      className={`absolute top-3 right-3 w-9 h-9 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
        selected ? "bg-red-500 border-red-500" : "bg-white border-gray-300"
      }`}
    >
      {selected && (
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"
          strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </div>
  )
}

function CandidateCard({ candidate, selected, onSelect }: {
  candidate: Candidate; selected: boolean; onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`Seleccionar ${candidate.name}, ${candidate.party}`}
      className={`relative text-left w-full rounded-2xl border-2 overflow-hidden transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400 ${
        selected
          ? "border-red-500 shadow-lg shadow-red-100 bg-white"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
      }`}
    >
      <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden">
        {candidate.image ? (
          <img src={candidate.image} alt={candidate.name}
            className="w-full h-full object-cover object-top" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User size={64} className="text-gray-300" />
          </div>
        )}
        {selected && <div className="absolute inset-0 bg-red-500/10 pointer-events-none" />}
      </div>
      <SelectionMark selected={selected} />
      <div className="p-4">
        <p className="font-bold text-sm leading-tight text-gray-900 uppercase tracking-tight">
          {candidate.name}
        </p>
        <p className="text-xs font-bold text-red-500 uppercase tracking-wider mt-1">
          Candidato Presidencial
        </p>
        <p className="text-[10px] text-gray-400 uppercase font-semibold mt-3">{candidate.viceLabel}</p>
        <p className="text-sm text-gray-700 font-medium mt-0.5">{candidate.vice}</p>
        <p className="text-xs text-gray-400 italic mt-1">{candidate.party}</p>
      </div>
    </button>
  )
}

function BlankVoteCard({ selected, onSelect }: { selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      aria-label="Seleccionar voto en blanco formal"
      className={`relative text-left w-full rounded-2xl border-2 border-dashed overflow-hidden transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400 flex flex-col items-center justify-center min-h-[340px] gap-4 ${
        selected ? "border-red-400 bg-red-50" : "border-gray-300 bg-white hover:border-gray-400 hover:shadow-md"
      }`}
    >
      <SelectionMark selected={selected} />
      <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-colors ${
        selected ? "border-red-400 text-red-400" : "border-gray-300 text-gray-300"
      }`}>
        <CheckSquare size={28} />
      </div>
      <div className="text-center px-4">
        <p className="font-extrabold text-sm uppercase tracking-wider text-gray-800">Voto en Blanco</p>
        <p className="text-xs text-gray-500 mt-2 leading-snug">
          Seleccione esta opción si no desea votar por ningún candidato
        </p>
      </div>
    </button>
  )
}

export default function VotingBallot() {
  const [selected, setSelected] = useState<CandidateId | null>(null)
  const [showToast, setShowToast] = useState(false)
  // US-01: estados de diálogos
  const [showDialogoNoMarcado, setShowDialogoNoMarcado] = useState(false)
  const [showDialogoConfirm, setShowDialogoConfirm]     = useState(false)
  const [votoEmitido, setVotoEmitido]                   = useState(false)
  const [tipoVotoEmitido, setTipoVotoEmitido]           = useState<TipoVoto | null>(null)
  const navigate = useNavigate()

  const selectedCandidate = selected === "blank"
    ? null : CANDIDATES.find((c) => c.id === selected) ?? null

  const selectionLabel = selected === "blank"
    ? "Voto en Blanco"
    : selectedCandidate ? selectedCandidate.name : "Sin selección"

  // US-01: lógica del botón "Revisar mi voto"
  const handleRevisar = () => {
    if (!selected) {
      // mostrar diálogo obligatorio de no marcado
      setShowDialogoNoMarcado(true)
      return
    }
    setShowDialogoConfirm(true)
  }

  // US-01: votante confirma activamente voto no marcado
  const handleConfirmarNoMarcado = () => {
    setShowDialogoNoMarcado(false)
    setShowDialogoConfirm(true)
  }

  // US-01: emitir voto con tipo clasificado
  const handleEmitirVoto = () => {
    const tipo = clasificarVoto(selected)
    setTipoVotoEmitido(tipo)
    setVotoEmitido(true)
    setShowDialogoConfirm(false)
  }

  if (votoEmitido && tipoVotoEmitido) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f6f7] gap-6 px-4">
        <div className="bg-white rounded-2xl border p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-2">Voto emitido</h2>
          <p className="text-sm text-gray-500 mb-4">
            Su voto ha sido registrado en el Motor de Urna Digital.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-xs text-gray-400 uppercase tracking-wide">Selección</span>
              <span className="text-sm font-semibold text-gray-800">{selectionLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400 uppercase tracking-wide">Tipo E-14</span>
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-800 capitalize">
                {tipoVotoEmitido.replace("_", " ")}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl text-sm transition"
          >
            Finalizar sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f6f7] font-sans">

      {/* US-01: diálogo no marcado */}
      {showDialogoNoMarcado && (
        <DialogoNoMarcado
          onConfirmar={handleConfirmarNoMarcado}
          onCancelar={() => setShowDialogoNoMarcado(false)}
        />
      )}

      {/* US-01: diálogo confirmación final */}
      {showDialogoConfirm && (
        <DialogoConfirmacion
          tipoVoto={clasificarVoto(selected)}
          selectionLabel={selectionLabel}
          onConfirmar={handleEmitirVoto}
          onCancelar={() => setShowDialogoConfirm(false)}
        />
      )}

      <header className="w-full border-b bg-white px-8 py-3 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M12 2L3 6v6c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V6L12 2z" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-base leading-none">sello legítimo</h1>
            <p className="text-[10px] text-red-500 font-bold tracking-wider uppercase">
              Sistema Electoral Colombiano
            </p>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600 font-medium">
          <button onClick={() => navigate("/")} className="hover:text-gray-900 transition-colors">Inicio</button>
          <button onClick={() => setShowToast(true)} className="hover:text-gray-900 transition-colors">Instrucciones</button>
          <button onClick={() => setShowToast(true)} className="hover:text-gray-900 transition-colors">Ayuda</button>
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowToast(true)}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 transition-colors text-white text-sm font-semibold px-4 py-2 rounded-lg"
          >
            <LogOut size={14} />
            Cerrar Sesión
          </button>
          <div className="w-9 h-9 rounded-full bg-gray-100 border flex items-center justify-center">
            <User size={16} className="text-gray-400" />
          </div>
        </div>
      </header>

      <div className="px-8 py-3 flex items-center gap-1 text-xs">
        <span className="text-red-500 font-semibold hover:underline cursor-pointer">Elecciones Presidenciales</span>
        <span className="text-gray-400">/</span>
        <span className="text-gray-500">Módulo M4 · Tarjeta Electoral Digital</span>
      </div>

      <main className="flex-1 px-8 pb-16 max-w-6xl mx-auto w-full">
        <div className="bg-white rounded-2xl border px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
              Elección Presidencial <span className="text-red-500">(ME-02)</span>
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Marque sobre la casilla del candidato de su preferencia para el periodo <strong>2022-2026</strong>.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={() => setShowToast(true)}
              className="flex items-center gap-2 border rounded-xl px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium">
              <Play size={15} className="text-gray-500" />
              Ver instructivo
            </button>
            <button onClick={() => setShowToast(true)}
              className="flex items-center gap-2 border rounded-xl px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium">
              <ZoomIn size={15} className="text-gray-500" />
              Aumentar Tamaño
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {CANDIDATES.map((c) => (
            <CandidateCard key={c.id} candidate={c}
              selected={selected === c.id}
              onSelect={() => setSelected(c.id)} />
          ))}
          <BlankVoteCard selected={selected === "blank"} onSelect={() => setSelected("blank")} />
        </div>

        <div className="bg-white border rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertCircle size={16} className="text-red-500" />
            </div>
            <div>
              {selected ? (
                <>
                  <p className="font-bold text-gray-800 text-sm">
                    Ha seleccionado: <span className="text-red-500">{selectionLabel}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Presione "Revisar mi voto" para confirmar su elección.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-bold text-gray-800 text-sm">Su elección no ha sido registrada aún.</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Puede avanzar sin marcar — se mostrará un aviso de confirmación.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* US-01: botón siempre habilitado — el diálogo maneja el caso sin marca */}
          <button
            onClick={handleRevisar}
            className="shrink-0 flex items-center gap-2 bg-red-500 hover:bg-red-600 transition-colors text-white font-bold uppercase tracking-wide text-sm px-6 py-3 rounded-xl"
          >
            Revisar mi voto
            <ChevronRight size={16} />
          </button>
        </div>
      </main>

      <Footer />
      <AccessibilityButtons />
      <ComingSoonToast isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  )
}