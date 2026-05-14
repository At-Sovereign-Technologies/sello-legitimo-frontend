import { useState, useEffect, useRef } from "react"
import { Ear, Eye, Hand, X, Volume2, VolumeX } from "lucide-react"

// US-02: estado global de accesibilidad (singleton sencillo via CSS vars en :root)
type A11yState = {
  altoContraste: boolean
  textoGrande: boolean
  audioActivo: boolean
}

function aplicarAltoContraste(activo: boolean) {
  document.documentElement.classList.toggle("alto-contraste", activo)
}

function aplicarTextoGrande(activo: boolean) {
  document.documentElement.classList.toggle("texto-grande", activo)
}

// US-02: leer el tarjetón en voz alta
function leerTarjeton() {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const texto = document.querySelector("main")?.innerText ?? ""
  const utterance = new SpeechSynthesisUtterance(texto)
  utterance.lang = "es-CO"
  utterance.rate = 0.9
  window.speechSynthesis.speak(utterance)
}

function detenerAudio() {
  window.speechSynthesis?.cancel()
}

// US-02: inyectar estilos de accesibilidad en el documento
function inyectarEstilosA11y() {
  if (document.getElementById("a11y-styles")) return
  const style = document.createElement("style")
  style.id = "a11y-styles"
  style.textContent = `
    /* Alto contraste - WCAG 2.1 AA */
    .alto-contraste {
      filter: contrast(1.5) !important;
    }
    .alto-contraste * {
      background-color: #000 !important;
      color: #fff !important;
      border-color: #fff !important;
    }
    .alto-contraste img {
      filter: grayscale(100%) contrast(1.5);
    }
    .alto-contraste button, .alto-contraste a {
      outline: 2px solid #fff !important;
    }

    /* Texto grande - ampliable */
    .texto-grande {
      font-size: 120% !important;
    }
    .texto-grande p, .texto-grande span, .texto-grande label,
    .texto-grande button, .texto-grande a, .texto-grande li {
      font-size: 1.2em !important;
      line-height: 1.8 !important;
    }
  `
  document.head.appendChild(style)
}

export default function AccessibilityButtons() {
  const [open, setOpen] = useState(false)
  const [a11y, setA11y] = useState<A11yState>({
    altoContraste: false,
    textoGrande:   false,
    audioActivo:   false,
  })
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => { inyectarEstilosA11y() }, [])

  // US-02: cerrar panel al hacer clic afuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node))
        setOpen(false)
    }
    if (open) document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const toggleAltoContraste = () => {
    const nuevo = !a11y.altoContraste
    aplicarAltoContraste(nuevo)
    setA11y(prev => ({ ...prev, altoContraste: nuevo }))
  }

  const toggleTextoGrande = () => {
    const nuevo = !a11y.textoGrande
    aplicarTextoGrande(nuevo)
    setA11y(prev => ({ ...prev, textoGrande: nuevo }))
  }

  // US-02: audio del tarjetón para personas invidentes
  const toggleAudio = () => {
    if (a11y.audioActivo) {
      detenerAudio()
      setA11y(prev => ({ ...prev, audioActivo: false }))
    } else {
      leerTarjeton()
      setA11y(prev => ({ ...prev, audioActivo: true }))
      // detener automáticamente cuando termine
      if (window.speechSynthesis) {
        const check = setInterval(() => {
          if (!window.speechSynthesis.speaking) {
            setA11y(prev => ({ ...prev, audioActivo: false }))
            clearInterval(check)
          }
        }, 500)
      }
    }
  }

  const hayAlgoActivo = a11y.altoContraste || a11y.textoGrande || a11y.audioActivo

  return (
    <div
      ref={panelRef}
      className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2"
      role="region"
      aria-label="Herramientas de accesibilidad"
    >
      {/* US-02: panel expandido */}
      {open && (
        <div
          className="bg-white border rounded-2xl shadow-xl p-4 w-64 mb-1"
          role="dialog"
          aria-label="Opciones de accesibilidad"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Accesibilidad</p>
            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar panel de accesibilidad"
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          </div>

          <div className="space-y-2">
            {/* US-02: alto contraste */}
            <button
              onClick={toggleAltoContraste}
              aria-pressed={a11y.altoContraste}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm font-medium transition ${
                a11y.altoContraste
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              <Eye size={16} />
              Alto contraste
              {a11y.altoContraste && (
                <span className="ml-auto text-xs bg-white text-gray-900 px-1.5 py-0.5 rounded font-bold">ON</span>
              )}
            </button>

            {/* US-02: texto ampliable */}
            <button
              onClick={toggleTextoGrande}
              aria-pressed={a11y.textoGrande}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm font-medium transition ${
                a11y.textoGrande
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              <Hand size={16} />
              Texto grande
              {a11y.textoGrande && (
                <span className="ml-auto text-xs bg-white text-blue-600 px-1.5 py-0.5 rounded font-bold">ON</span>
              )}
            </button>

            {/* US-02: audio del tarjetón para invidentes */}
            <button
              onClick={toggleAudio}
              aria-pressed={a11y.audioActivo}
              aria-label={a11y.audioActivo ? "Detener lectura de voz" : "Activar lectura de voz del tarjetón"}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm font-medium transition ${
                a11y.audioActivo
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {a11y.audioActivo ? <VolumeX size={16} /> : <Volume2 size={16} />}
              {a11y.audioActivo ? "Detener audio" : "Leer tarjetón"}
              {a11y.audioActivo && (
                <span className="ml-auto text-xs bg-white text-green-700 px-1.5 py-0.5 rounded font-bold animate-pulse">
                  ●
                </span>
              )}
            </button>

            {/* US-02: info de teclado adaptado */}
            <div className="bg-gray-50 rounded-xl px-3 py-2 mt-1">
              <p className="text-[10px] text-gray-400 leading-relaxed">
                <span className="font-semibold text-gray-500">Teclado:</span> Tab para navegar,
                Espacio para seleccionar, Enter para confirmar.
                Compatible con lectores de pantalla (ARIA).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* US-02: botón flotante principal con indicador de activo */}
      <button
        onClick={() => setOpen(prev => !prev)}
        aria-expanded={open}
        aria-label="Abrir herramientas de accesibilidad"
        className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md transition relative ${
          hayAlgoActivo
            ? "bg-red-500 text-white"
            : "bg-white text-black border"
        }`}
      >
        <Ear size={20} />
        {hayAlgoActivo && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        )}
      </button>
    </div>
  )
}