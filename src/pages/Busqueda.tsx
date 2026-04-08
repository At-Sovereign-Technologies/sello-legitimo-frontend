import { useState } from "react"
import { Search } from "lucide-react"
import Header from "../components/LoginHeader"
import Footer from "../components/Footer"

export default function Consulta() {
  const [cedula, setCedula] = useState("")
  const [result, setResult] = useState<string | null>(null)

  const handleSearch = () => {
    if (!cedula.trim()) return
    setResult("No has votado")
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f6f7]">

      <Header />

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-sm border p-10 w-full max-w-xl">

          <h2 className="text-2xl font-bold mb-2 text-center">
            Consulta de Votación
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            Ingrese su número de cédula para verificar su estado de votación
          </p>

          {/* INPUT */}
          <div className="mb-4">
            <label className="text-xs text-gray-500">NÚMERO DE CÉDULA</label>
            <div className="flex items-center border rounded-lg px-3 py-3 mt-1 bg-white">
              <Search size={16} className="text-gray-400 mr-2" />
              <input
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                className="w-full outline-none"
                placeholder="Ingrese su número de identificación"
              />
            </div>
          </div>

          {/* BOTÓN */}
          <button
            onClick={handleSearch}
            className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition"
          >
            Consultar
          </button>

          {/* RESULTADO */}
          {result && (
            <div className="mt-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700 text-center font-semibold">
              {result}!
            </div>
          )}

        </div>
      </main>

      <Footer />

    </div>
  )
}
