import { BrowserRouter, Routes, Route } from "react-router-dom"
import Landing from "./pages/Landing"
import Login from "./pages/Login"
import AccessibilityButtons from "./components/AccesibilityButtons"
import Tarjeton from "./pages/Tarjeton"
import Menu from "./pages/Menu"

function App() {
  return (
    <BrowserRouter>

      {/* Botones de accesibilidad (globales) */}
      <AccessibilityButtons />

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/tarjeton" element={<Tarjeton />}/>
        <Route path="/menu" element={<Menu />}/>
      </Routes>

    </BrowserRouter>
  )
}

export default App
