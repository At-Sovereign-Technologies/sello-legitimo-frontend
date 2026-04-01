import { useNavigate } from "react-router-dom"

export default function NavBar() {
    const navigate = useNavigate()
  return (
    <nav className="flex justify-between items-center px-10 py-6 border-b bg-white">
        <div className="flex flex-col leading-tight">
            <span className="font-bold text-lg">
                Sello Legítimo
            </span>
            <span className="text-red-500 text-xs font-semibold tracking-wide">
                SISTEMA ELECTORAL COLOMBIANO
            </span>
        </div>

        <div className="hidden md:flex gap-8 text-sm">
            <a href="#">Inicio</a>
            <a href="#">Transparencia</a>
            <a href="#">Resultados</a>
            <a href="#">Auditoría</a>
            <a href="#">Contacto</a>
        </div>

        <button
        onClick={() => navigate("/login")}
        className="bg-red-500 text-white px-4 py-2 rounded-lg"
        >
        Ingresar al Sistema
        </button>
    </nav>
  )
}