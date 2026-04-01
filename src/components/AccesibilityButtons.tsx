import { Ear, Eye, Hand } from "lucide-react"

export default function AccessibilityButtons() {
  return (
    <>
      {/* Lado izquierdo */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50">

        {/* Botón oído */}
        <button className="w-12 h-12 bg-white text-black border rounded-xl flex items-center justify-center shadow-md hover:scale-105 transition">
          <Ear size={20} />
        </button>

        {/* Botón ojo */}
        <button className="w-12 h-12 bg-white text-black border rounded-xl flex items-center justify-center shadow-md hover:scale-105 transition">
          <Eye size={20} />
        </button>

      </div>

      {/* Lado derecho */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50">
        <button className="w-14 h-14 bg-white text-black border rounded-2xl flex items-center justify-center shadow-md hover:scale-105 transition">
          <Hand size={22} />
        </button>
      </div>
    </>
  )
}