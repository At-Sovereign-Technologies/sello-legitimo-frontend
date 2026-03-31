export default function NavBar() {
  return (
    <nav className="flex justify-between items-center px-10 py-6">
        <h1 className="font-bold text-lg">
            Sello Legitimo
        </h1>

        <div className="hidden md:flex gap-8 text-sm">
            <a href="#">Inicio</a>
            <a href="#">Transparencia</a>
            <a href="#">Resultados</a>
            <a href="#">Auditoría</a>
            <a href="#">Contacto</a>
        </div>

        <button className="bg-red-500 text-white px-4 py-2 rounded-lg">
            Ingresar al Sistema
        </button>
    </nav>
  )
}