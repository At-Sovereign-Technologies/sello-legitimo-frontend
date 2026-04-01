import { useState } from "react"

export default function Login() {
  const [cedula, setCedula] = useState("")
  const [password, setPassword] = useState("")

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f6f3] px-6">

      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border">

        {/* título */}
        <h2 className="text-2xl font-bold mb-6 text-center">
          Ingreso al Sistema
        </h2>

        {/* input cédula */}
        <div className="mb-4">
          <label className="text-sm text-gray-600">
            Número de cédula
          </label>
          <input
            type="text"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            className="w-full mt-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Ingrese su cédula"
          />
        </div>

        {/* input contraseña */}
        <div className="mb-6">
          <label className="text-sm text-gray-600">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Ingrese su contraseña"
          />
        </div>

        {/* botón */}
        <button className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition">
          Ingresar
        </button>

        {/* texto extra */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          Sistema protegido con autenticación multifactor (MFA)
        </p>

      </div>

    </div>
  )
}