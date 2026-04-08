import { useNavigate } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import Header from "../components/LoginHeader"
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
              onClick={() => navigate("/tarjeton")}
              className="w-full bg-red-500 text-white py-4 rounded-xl font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2"
            >
              Votación Remota
              <ArrowRight size={18} />
            </button>

            {/* CONSULTA */}
            <button
              onClick={() => alert("Funcionalidad no implementada")}
              className="w-full border border-gray-300 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-100 transition"
            >
              Consulta de Votación
            </button>

          </div>
        </div>
      </main>

      <Footer />

    </div>
  )
}
