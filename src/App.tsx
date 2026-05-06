import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import AccessibilityButtons from "./components/AccesibilityButtons";
import Tarjeton from "./pages/Tarjeton";
import Busqueda from "./pages/Busqueda";
import ConsultaCiudadano from "./pages/ConsultaCiudadano";
import Resultados from "./pages/Resultados";
import Elecciones from "./pages/Elecciones";
import Transparencia from "./pages/Transparencia";
import MockLogin from "./pages/MockLogin";
import Dashboard from "./pages/Dashboard";

function App() {
    return (
        <BrowserRouter>
            {/* Botones de accesibilidad (globales) */}
            <AccessibilityButtons />

            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/mock-login" element={<MockLogin />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tarjeton" element={<Tarjeton />} />
                <Route path="/landing" element={<Landing />} />
                <Route path="/busqueda" element={<Busqueda />} />
                <Route
                    path="/consulta-ciudadano"
                    element={<ConsultaCiudadano />}
                />
                <Route path="/resultados" element={<Resultados />} />
                <Route path="/elecciones" element={<Elecciones />} />
                <Route path="/transparencia" element={<Transparencia />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
