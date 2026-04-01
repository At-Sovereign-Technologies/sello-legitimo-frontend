import { BrowserRouter, Routes, Route } from "react-router-dom"
import Landing from "./pages/Landing"
import Login from "./pages/Login"
import AccessibilityButtons from "./components/AccesibilityButtons"

function App() {
  return (
    <BrowserRouter>

      {/* Botones de accesibilidad (globales) */}
      <AccessibilityButtons />

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
      </Routes>

    </BrowserRouter>
  )
}

export default App