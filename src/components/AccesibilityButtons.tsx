import { useState } from "react"
import { Ear, Eye, Hand } from "lucide-react"
import ComingSoonToast from "./ComingSoonToast"

export default function AccessibilityButtons() {
  const [showToast, setShowToast] = useState(false)

  return (
    <>
      <div className="fixed bottom-4 right-4 flex flex-col gap-3 z-50">
        <button
          onClick={() => setShowToast(true)}
          className="w-12 h-12 bg-white text-black border rounded-xl flex items-center justify-center shadow-md hover:scale-105 transition"
        >
          <Ear size={20} />
        </button>
        <button
          onClick={() => setShowToast(true)}
          className="w-12 h-12 bg-white text-black border rounded-xl flex items-center justify-center shadow-md hover:scale-105 transition"
        >
          <Eye size={20} />
        </button>
        <button
          onClick={() => setShowToast(true)}
          className="w-12 h-12 bg-white text-black border rounded-xl flex items-center justify-center shadow-md hover:scale-105 transition"
        >
          <Hand size={20} />
        </button>
      </div>
      <ComingSoonToast isVisible={showToast} onClose={() => setShowToast(false)} />
    </>
  )
}