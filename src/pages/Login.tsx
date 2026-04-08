import { useState } from "react"
import { Lock, User, ArrowRight, Loader2 } from "lucide-react"
import { requestOtp, verifyOtp } from "../api/auth.api"
import Header from "../components/Header"


type Step = "cedula" | "otp"

const resolveApiError = (err: unknown, fallback: string): string => {
  if (typeof err === "object" && err !== null) {
    const maybeResponse = (err as { response?: { data?: { message?: unknown } } }).response
    const message = maybeResponse?.data?.message
    if (typeof message === "string" && message.trim().length > 0) {
      return message
    }
  }
  return fallback
}

export default function Login() {
  const [step, setStep] = useState<Step>("cedula")
  const [cedula, setCedula] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1 — POST /login → show OTP field
  const handleRequestOtp = async () => {
    if (!cedula.trim()) {
      setError("Ingrese su número de cédula.")
      return
    }
    setLoading(true)
    setError(null)
    try {
      await requestOtp(cedula)
      setStep("otp")           
    } catch (err: unknown) {
      setError(resolveApiError(err, "Error al enviar OTP."))
    } finally {
      setLoading(false)
    }
  }

  // Step 2 — POST /verify → store JWT
  const handleVerify = async () => {
    if (!otp.trim()) {
      setError("Ingrese el código OTP.")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const token = await verifyOtp(cedula, otp)
      localStorage.setItem("auth_token", token)   
      window.location.href = "/tarjeton"          
    } catch (err: unknown) {
      setError(resolveApiError(err, "OTP inválido."))
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    if (step === "cedula") handleRequestOtp()
    else handleVerify()
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f6f7]">

      <Header />

      {/* MAIN */}
      <main className="flex-1 px-10 py-10">
        <div className="grid md:grid-cols-2 gap-10 max-w-7xl mx-auto">

          {/* LEFT */}
          <div>
            <h2 className="text-3xl font-bold mb-2">Autenticación Remota</h2>
            <p className="text-gray-600 mb-6">
              Inicie sesión para ejercer su derecho al voto de forma segura.
            </p>

            {/* Error banner */}
            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* CÉDULA INPUT — always visible */}
            <div className="mb-4">
              <label className="text-xs text-gray-500">NÚMERO DE CÉDULA</label>
              <div className="flex items-center border rounded-lg px-3 py-3 mt-1 bg-white">
                <User size={16} className="text-gray-400 mr-2" />
                <input
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  disabled={step === "otp"}   
                  className="w-full outline-none disabled:text-gray-400"
                  placeholder="Ingrese su número de identificación"
                />
              </div>
            </div>

            {/* OTP INPUT — only visible after step 1 */}
            {step === "otp" && (
              <div className="border rounded-xl p-4 bg-white mb-4">
                <div className="flex items-center gap-2 text-red-500 text-sm font-semibold mb-3">
                  <Lock size={16} />
                  DOBLE FACTOR DE AUTENTICACIÓN (MFA)
                </div>
                <p className="text-xs text-gray-500 mb-2">CÓDIGO OTP (ENVIADO A SU MÓVIL)</p>
                <div className="flex items-center gap-3">
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="border rounded-lg px-4 py-2 w-32 text-center tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                  />
                  {/* ✅ Reenviar re-runs step 1 */}
                  <button
                    onClick={handleRequestOtp}
                    disabled={loading}
                    className="text-red-500 text-sm disabled:opacity-50"
                  >
                    Reenviar
                  </button>
                </div>
              </div>
            )}

            {/* BIOMETRÍA */}
            <div className="border-2 border-dashed rounded-xl p-4 bg-white mb-6 flex justify-between items-center">
              <div>
                <p className="font-semibold text-sm">Escanear Rostro</p>
                <p className="text-xs text-gray-500">Inicie validación con selfie</p>
              </div>
              <ArrowRight className="text-gray-400" />
            </div>

            {/* CONTINUAR — wired up */}
            <button
              onClick={handleContinue}
              disabled={loading}
              className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading
                ? <Loader2 size={18} className="animate-spin" />
                : <>CONTINUAR <ArrowRight size={18} /></>
              }
            </button>
          </div>

          {/* RIGHT — unchanged */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border text-center">
              <div className="w-40 h-40 mx-auto border-2 border-red-300 rounded-full flex items-center justify-center mb-4">
                <User size={40} className="text-gray-300" />
              </div>
              <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full">VISTA PREVIA</span>
              <p className="mt-4 font-semibold">"Centre su rostro y parpadee"</p>
              <p className="text-sm text-gray-500 mt-2">
                Asegúrese de estar en un lugar iluminado. El parpadeo confirma la prueba de vida.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border">
              <p className="text-sm font-semibold mb-3">VERIFICACIONES DE SEGURIDAD</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✔ Verificación de Elegibilidad</li>
                <li>✔ Registro de Voto Único</li>
                <li>✔ Cifrado de Sesión Punto a Punto</li>
              </ul>
            </div>
          </div>

        </div>
      </main>

      {/* FOOTER — unchanged */}
      <footer className="w-full border-t bg-white px-10 py-4 flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <span className="bg-green-100 text-green-600 px-3 py-1 rounded-lg text-xs">● Conexión Segura</span>
          <span>Este sistema cumple con estándares internacionales de transparencia electoral.</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 rounded-lg border">Cancelar</button>
          <button className="px-4 py-2 rounded-lg bg-black text-white">Español</button>
        </div>
      </footer>

    </div>
  )
}