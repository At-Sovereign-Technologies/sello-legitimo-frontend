import { useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  CheckSquare, Play, ZoomIn, LogOut, User,
  ChevronRight, AlertCircle, AlertTriangle, X, ListOrdered, RotateCcw,
} from "lucide-react"
import AccessibilityButtons from "../components/AccesibilityButtons"
import Footer from "../components/Footer"
import ComingSoonToast from "../components/ComingSoonToast"

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

// Diálogo cuando el votante avanza sin marcar (clasificación E-14 "no marcado").
function DialogoNoMarcado({
  onConfirmar,
  onCancelar,
}: {
  onConfirmar: () => void
  onCancelar: () => void
}) {
  return (
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
            <h3 id="dialogo-titulo" className="font-bold text-gray-900 text-base">
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

// US-SE-M3-06: aviso de ranking incompleto (posible voto agotado).
function DialogoRankingIncompleto({
  marcados,
  total,
  onConfirmar,
  onCancelar,
}: {
  marcados: number
  total: number
  onConfirmar: () => void
  onCancelar: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-amber-500" />
          </div>
          <h3 className="font-bold text-gray-900 text-base">
            Ranking incompleto — posible voto agotado
          </h3>
        </div>

        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          Solo asignó preferencia a <strong>{marcados} de {total}</strong> candidatos. En el método
          de Voto Alternativo (ME-04), si todos sus elegidos son eliminados en
          rondas anteriores, su voto se considerará <strong>agotado</strong> y no
          contribuirá al cómputo final.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCancelar}
            className="flex-1 border border-gray-300 rounded-xl py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Completar ranking
          </button>
          <button
            onClick={onConfirmar}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-2.5 text-sm font-bold transition"
          >
            Continuar igualmente
          </button>
        </div>
      </div>
    </div>
  )
}

function SelectionMark({ selected, rank }: { selected: boolean; rank?: number }) {
  return (
    <div
      className={`absolute top-3 right-3 w-9 h-9 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
        selected ? "bg-red-500 border-red-500 text-white" : "bg-white border-gray-300"
      }`}
    >
      {selected && rank ? (
        <span className="text-sm font-extrabold">{rank}</span>
      ) : selected ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"
          strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : null}
    </div>
  )
}

function CandidateCard({
  candidate,
  selected,
  rank,
  onSelect,
}: {
  candidate: Candidate
  selected: boolean
  rank?: number
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`Seleccionar ${candidate.name}, ${candidate.party}${rank ? `, preferencia ${rank}` : ""}`}
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
      <SelectionMark selected={selected} rank={rank} />
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
  // Modo simple: 1 candidato O voto en blanco.
  const [selected, setSelected] = useState<CandidateId | null>(null)
  // Modo alternativo (ME-04): mapa { candidatoId -> preferencia (1..N) }.
  // Voto en blanco no participa en ranking.
  const [modoAlternativo, setModoAlternativo] = useState(false)
  const [ranking, setRanking] = useState<Record<string, number>>({})

  const [showToast, setShowToast] = useState(false)
  const [showDialogoNoMarcado, setShowDialogoNoMarcado] = useState(false)
  const [showDialogoRanking, setShowDialogoRanking] = useState(false)

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const canal = useMemo<"Presencial" | "Remoto">(() => {
    return searchParams.get("canal")?.toLowerCase() === "remoto"
      ? "Remoto"
      : "Presencial"
  }, [searchParams])

  const circunscripcionId =
    searchParams.get("circunscripcion") ?? "PRESIDENCIAL-NACIONAL"
  const votanteId = searchParams.get("votanteId") ?? "anonimo"
  const handshakeId = searchParams.get("handshakeId")
  const emailParam = searchParams.get("email") ?? undefined
  // SE-M3-05: token de sesion asistida emitido por el jurado.
  const tokenAsistencia = searchParams.get("tokenAsistencia") ?? undefined

  const selectedCandidate = selected === "blank"
    ? null : CANDIDATES.find((c) => c.id === selected) ?? null

  const selectionLabel = selected === "blank"
    ? "Voto en Blanco"
    : selectedCandidate ? selectedCandidate.name : "Sin selección"

  // ─── Lógica modo alternativo (ME-04) ────────────────────────────────────
  const candidatosRankeados = Object.keys(ranking).length

  const toggleRanking = (candidatoId: string) => {
    setRanking((prev) => {
      // Si ya estaba, lo quito y reajusto preferencias.
      if (prev[candidatoId]) {
        const eliminado = prev[candidatoId]
        const nuevo: Record<string, number> = {}
        for (const [k, v] of Object.entries(prev)) {
          if (k === candidatoId) continue
          nuevo[k] = v > eliminado ? v - 1 : v
        }
        return nuevo
      }
      // Si no estaba, le asigno el siguiente número.
      const siguiente = Object.keys(prev).length + 1
      return { ...prev, [candidatoId]: siguiente }
    })
  }

  const limpiarRanking = () => setRanking({})

  const cambiarModo = (alternativo: boolean) => {
    setModoAlternativo(alternativo)
    setSelected(null)
    setRanking({})
  }

  // ─── Acción del botón "Revisar mi voto" ─────────────────────────────────
  const irAConfirmacion = (rankingIncompletoConfirmado = false) => {
    // Construir payload de preferencias según el modo.
    let preferencias: Record<string, number> = {}
    let enBlanco = false
    let seleccion: { id: string; nombre: string; partido?: string } | null = null

    if (modoAlternativo) {
      preferencias = ranking
      // En modo alternativo, voto en blanco no aplica.
    } else {
      if (selected === "blank") {
        enBlanco = true
      } else if (selectedCandidate) {
        preferencias = { [selectedCandidate.id]: 1 }
        seleccion = {
          id: selectedCandidate.id,
          nombre: selectedCandidate.name,
          partido: selectedCandidate.party,
        }
      }
    }

    navigate("/confirmacion-voto", {
      state: {
        seleccion,
        enBlanco,
        canal,
        circunscripcionId,
        votanteId,
        handshakeId,
        emailDestino: emailParam,
        preferencias,
        modoAlternativo,
        rankingIncompleto: modoAlternativo && candidatosRankeados < CANDIDATES.length,
        rankingIncompletoConfirmado,
        tokenAsistencia,
      },
    })
  }

  const handleRevisar = () => {
    if (modoAlternativo) {
      if (candidatosRankeados === 0) {
        setShowDialogoNoMarcado(true)
        return
      }
      if (candidatosRankeados < CANDIDATES.length) {
        setShowDialogoRanking(true)
        return
      }
      irAConfirmacion()
      return
    }
    if (!selected) {
      setShowDialogoNoMarcado(true)
      return
    }
    irAConfirmacion()
  }

  const handleConfirmarNoMarcado = () => {
    setShowDialogoNoMarcado(false)
    irAConfirmacion()
  }

  const handleConfirmarRankingIncompleto = () => {
    setShowDialogoRanking(false)
    irAConfirmacion(true)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f6f7] font-sans">

      {showDialogoNoMarcado && (
        <DialogoNoMarcado
          onConfirmar={handleConfirmarNoMarcado}
          onCancelar={() => setShowDialogoNoMarcado(false)}
        />
      )}

      {showDialogoRanking && (
        <DialogoRankingIncompleto
          marcados={candidatosRankeados}
          total={CANDIDATES.length}
          onConfirmar={handleConfirmarRankingIncompleto}
          onCancelar={() => setShowDialogoRanking(false)}
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
        <div className="bg-white rounded-2xl border px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
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

        {/* US-SE-M3-06: toggle de modo voto alternativo (ME-04) */}
        <div className="bg-white border rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <ListOrdered size={16} className="text-red-500" />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm">
                {modoAlternativo ? "Voto Alternativo activo (ME-04)" : "Voto único"}
              </p>
              <p className="text-xs text-gray-500 leading-snug">
                {modoAlternativo
                  ? "Toque a los candidatos en orden de preferencia (1°, 2°, 3°...). No repita números. Puede dejarlo incompleto, pero se le advertirá del riesgo de voto agotado."
                  : "Seleccione un único candidato o el voto en blanco. Cambie a Voto Alternativo para ordenar candidatos por preferencia."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {modoAlternativo && candidatosRankeados > 0 && (
              <button
                onClick={limpiarRanking}
                className="flex items-center gap-1 border rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                <RotateCcw size={12} /> Limpiar
              </button>
            )}
            <button
              onClick={() => cambiarModo(!modoAlternativo)}
              className={`text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-lg transition ${
                modoAlternativo
                  ? "bg-gray-800 text-white hover:bg-gray-900"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              {modoAlternativo ? "Volver a voto único" : "Activar voto alternativo"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {CANDIDATES.map((c) => {
            const rank = modoAlternativo ? ranking[c.id] : undefined
            const isSel = modoAlternativo ? !!rank : selected === c.id
            return (
              <CandidateCard
                key={c.id}
                candidate={c}
                selected={isSel}
                rank={rank}
                onSelect={() =>
                  modoAlternativo ? toggleRanking(c.id) : setSelected(c.id)
                }
              />
            )
          })}
          {!modoAlternativo && (
            <BlankVoteCard
              selected={selected === "blank"}
              onSelect={() => setSelected("blank")}
            />
          )}
        </div>

        <div className="bg-white border rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertCircle size={16} className="text-red-500" />
            </div>
            <div>
              {modoAlternativo ? (
                candidatosRankeados > 0 ? (
                  <>
                    <p className="font-bold text-gray-800 text-sm">
                      Preferencias: <span className="text-red-500">{candidatosRankeados}/{CANDIDATES.length}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {Object.entries(ranking)
                        .sort((a, b) => a[1] - b[1])
                        .map(([id, n]) => {
                          const cand = CANDIDATES.find((c) => c.id === id)
                          return `${n}° ${cand?.name ?? id}`
                        })
                        .join(" · ")}
                    </p>
                  </>
                ) : (
                  <p className="font-bold text-gray-800 text-sm">
                    Toque a los candidatos en orden de preferencia para activar el ranking.
                  </p>
                )
              ) : selected ? (
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
