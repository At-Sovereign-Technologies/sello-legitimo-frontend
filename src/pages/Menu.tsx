import { useNavigate } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import Header from "../components/MenuHeader"
import Footer from "../components/Footer"

export default function Menu() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f6f7]">

      <Header />

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-sm border p-10 w-full max-w-xl text-center">

          <h2 className="text-2xl font-bold mb-2">Portal Ciudadano</h2>
          <p className="text-gray-600 mb-8">
            Seleccione una opción para continuar
          </p>

          <div className="space-y-4">

            {/* VOTACIÓN REMOTA */}
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-red-500 text-white py-4 rounded-xl font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2"
            >
              Votación Remota
              <ArrowRight size={18} />
            </button>

            {/* CONSULTA */}
            <button
              onClick={() => navigate("/consulta-ciudadano")}
              className="w-full border border-gray-300 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-100 transition"
            >
              Consulta Ciudadana
            </button>

            {/* RESULTADOS */}
            <button
              onClick={() => navigate("/resultados")}
              className="w-full border border-gray-300 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-100 transition"
            >
              Resultados Electorales
            </button>

            {/* ELECCIONES */}
            <button
              onClick={() => navigate("/elecciones")}
              className="w-full border border-gray-300 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-100 transition"
            >
              Elecciones Activas
            </button>

            {/* TRANSPARENCIA */}
            <button
              onClick={() => navigate("/transparencia")}
              className="w-full border border-gray-300 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-100 transition"
            >
              Transparencia Electoral
            </button>

            {/* SELLO LEGÍTIMO */}
            <button
              onClick={() => navigate("/landing")}
              className="w-full border border-gray-300 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-100 transition"
            >
              Sello Legítimo
            </button>

          </div>
        </div>
      </main>

      <Footer />

    </div>
  )
}

