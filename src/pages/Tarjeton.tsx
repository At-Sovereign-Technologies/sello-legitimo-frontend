import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  CheckSquare,
  Play,
  ZoomIn,
  LogOut,
  User,
  ChevronRight,
  AlertCircle,
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

function SelectionMark({ selected }: { selected: boolean }) {
  return (
    <div
      className={`absolute top-3 right-3 w-9 h-9 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
        selected ? "bg-red-500 border-red-500" : "bg-white border-gray-300"
      }`}
    >
      {selected && (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </div>
  )
}

function CandidateCard({
  candidate,
  selected,
  onSelect,
}: {
  candidate: Candidate
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`relative text-left w-full rounded-2xl border-2 overflow-hidden transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400 ${
        selected
          ? "border-red-500 shadow-lg shadow-red-100 bg-white"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
      }`}
    >
      <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden">
        {candidate.image ? (
          <img
            src={candidate.image}
            alt={candidate.name}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User size={64} className="text-gray-300" />
          </div>
        )}
        {selected && (
          <div className="absolute inset-0 bg-red-500/10 pointer-events-none" />
        )}
      </div>
      <SelectionMark selected={selected} />
      <div className="p-4">
        <p className="font-bold text-sm leading-tight text-gray-900 uppercase tracking-tight">
          {candidate.name}
        </p>
        <p className="text-xs font-bold text-red-500 uppercase tracking-wider mt-1">
          Candidato Presidencial
        </p>
        <p className="text-[10px] text-gray-400 uppercase font-semibold mt-3">
          {candidate.viceLabel}
        </p>
        <p className="text-sm text-gray-700 font-medium mt-0.5">{candidate.vice}</p>
        <p className="text-xs text-gray-400 italic mt-1">{candidate.party}</p>
      </div>
    </button>
  )
}

function BlankVoteCard({
  selected,
  onSelect,
}: {
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`relative text-left w-full rounded-2xl border-2 border-dashed overflow-hidden transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400 flex flex-col items-center justify-center min-h-[340px] gap-4 ${
        selected
          ? "border-red-400 bg-red-50"
          : "border-gray-300 bg-white hover:border-gray-400 hover:shadow-md"
      }`}
    >
      <SelectionMark selected={selected} />
      <div
        className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-colors ${
          selected ? "border-red-400 text-red-400" : "border-gray-300 text-gray-300"
        }`}
      >
        <CheckSquare size={28} />
      </div>
      <div className="text-center px-4">
        <p className="font-extrabold text-sm uppercase tracking-wider text-gray-800">
          Voto en Blanco
        </p>
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
  const navigate = useNavigate()

  const selectedCandidate =
    selected === "blank"
      ? null
      : CANDIDATES.find((c) => c.id === selected) ?? null

  const selectionLabel =
    selected === "blank"
      ? "Voto en Blanco"
      : selectedCandidate
      ? selectedCandidate.name
      : null

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f6f7] font-sans">

      <header className="w-full border-b bg-white px-8 py-3 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M12 2L3 6v6c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V6L12 2z" />
              <path d="M10 14.5l-2.5-2.5-1 1 3.5 3.5 6-6-1-1L10 14.5z" fill="#fff" opacity=".3" />
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
          <button onClick={() => navigate("/")} className="hover:text-gray-900 transition-colors">
            Inicio
          </button>
          <button onClick={() => setShowToast(true)} className="hover:text-gray-900 transition-colors">
            Instrucciones
          </button>
          <button onClick={() => setShowToast(true)} className="hover:text-gray-900 transition-colors">
            Ayuda
          </button>
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
        <span className="text-red-500 font-semibold hover:underline cursor-pointer">
          Elecciones Presidenciales
        </span>
        <span className="text-gray-400">/</span>
        <span className="text-gray-500">Módulo M4 · Tarjeta Electoral Digital</span>
      </div>

      <main className="flex-1 px-8 pb-16 max-w-6xl mx-auto w-full">

        <div className="bg-white rounded-2xl border px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
              Elección Presidencial{" "}
              <span className="text-red-500">(ME-02)</span>
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Marque sobre la casilla del candidato de su preferencia para el periodo{" "}
              <strong>2022-2026</strong>.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowToast(true)}
              className="flex items-center gap-2 border rounded-xl px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              <Play size={15} className="text-gray-500" />
              Ver instructivo
            </button>
            <button
              onClick={() => setShowToast(true)}
              className="flex items-center gap-2 border rounded-xl px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              <ZoomIn size={15} className="text-gray-500" />
              Aumentar Tamaño
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {CANDIDATES.map((c) => (
            <CandidateCard
              key={c.id}
              candidate={c}
              selected={selected === c.id}
              onSelect={() => setSelected(c.id)}
            />
          ))}
          <BlankVoteCard
            selected={selected === "blank"}
            onSelect={() => setSelected("blank")}
          />
        </div>

        <div className="bg-white border rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertCircle size={16} className="text-red-500" />
            </div>
            <div>
              {selectionLabel ? (
                <>
                  <p className="font-bold text-gray-800 text-sm">
                    Ha seleccionado:{" "}
                    <span className="text-red-500">{selectionLabel}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Presione "Revisar mi voto" para confirmar su elección.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-bold text-gray-800 text-sm">
                    Su elección no ha sido registrada aún.
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Al presionar el botón se mostrará un resumen para su confirmación final.
                  </p>
                </>
              )}
            </div>
          </div>

          <button
            disabled={!selected}
            onClick={() => setShowToast(true)}
            className="shrink-0 flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white font-bold uppercase tracking-wide text-sm px-6 py-3 rounded-xl"
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