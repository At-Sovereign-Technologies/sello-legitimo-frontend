import { useNavigate } from "react-router-dom"
import { ArrowRight } from "lucide-react"

export default function NavBar() {
  const navigate = useNavigate()

  const navItems = [
    { label: "Consulta Ciudadana", path: "/consulta-ciudadano" },
    { label: "Resultados Electorales", path: "/resultados" },
    { label: "Elecciones Activas", path: "/elecciones" },
    { label: "Transparencia Electoral", path: "/transparencia" },
  ]

  return (
    <nav className="flex justify-between items-center px-10 py-6 border-b bg-white">
      {/* Logo / Sello Legítimo → navega a la landing */}
      <button
        onClick={() => navigate("/landing")}
        className="flex flex-col leading-tight text-left"
      >
        <span className="font-bold text-lg">Sello Legítimo</span>
        <span className="text-red-500 text-xs font-semibold tracking-wide">
          SISTEMA ELECTORAL COLOMBIANO
        </span>
      </button>

      {/* Opciones del menú */}
      <div className="hidden md:flex gap-6 text-sm">
        {navItems.map(({ label, path }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="hover:text-gray-900 text-gray-600 transition"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Votación Remota → reemplaza "Ingresar al Sistema" */}
      <button
        onClick={() => navigate("/login")}
        className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition flex items-center gap-2"
      >
        Votación Remota
        <ArrowRight size={16} />
      </button>
    </nav>
  )
}