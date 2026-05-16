import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import AccessibilityButtons from "./components/AccesibilityButtons";
import Tarjeton from "./pages/Tarjeton";
import ConfirmacionVoto from "./pages/ConfirmacionVoto";
import ComprobanteVoto from "./pages/ComprobanteVoto";
import EmisionRemotaSetup from "./pages/EmisionRemotaSetup";
import AsistenciaJurado from "./pages/AsistenciaJurado";
import Busqueda from "./pages/Busqueda";
import ConsultaCiudadano from "./pages/ConsultaCiudadano";
import Resultados from "./pages/Resultados";
import Elecciones from "./pages/Elecciones";
import Transparencia from "./pages/Transparencia";
import MockLogin from "./pages/MockLogin";
import Dashboard from "./pages/Dashboard";
import ParticipacionEnVivoPage from "./pages/publicacion/ParticipacionEnVivoPage";
import ResultadosParcialPage from "./pages/publicacion/ResultadosParcialPage";
import GestionCenso from "./pages/gestion-preelectoral/GestionCenso";
import GestionCandidaturas from "./pages/gestion-preelectoral/GestionCandidaturas";
import Callback from "./pages/gestion-preelectoral/Callback";
import GestionExcusas from "./pages/gestion-preelectoral/GestionExcusas";
import SorteoJurados from "./pages/gestion-preelectoral/SorteoJurados";
import ControlAsistencia from "./pages/gestion-preelectoral/ControlAsistencia";
import AperturaMesa from "./pages/gestion-preelectoral/AperturaMesa";
import ProtectedRoute from "./components/ProtectedRoute";
import ParametrosBase from "./pages/configuracion-elecciones/ParametrosBase";
import MetodoElectoralReglas from "./pages/configuracion-elecciones/MetodoElectoralReglas";
import CircunscripcionesElegibilidad from "./pages/configuracion-elecciones/CircunscripcionesElegibilidad";
import Auditoria from "./pages/auditoria/Auditoria";
import ActaCicloVida from "./pages/auditoria/ActaCicloVida";
import ProfilePage from "./pages/ProfilePage";

const preelectoralRoutes = [
    { path: "/censo/gestion", element: <GestionCenso /> },
    { path: "/candidaturas/gestion", element: <GestionCandidaturas /> },
    { path: "/jurados/sorteo", element: <SorteoJurados /> },
];

const legacyPreelectoralRoutes = [
    { path: "/gestion-censo", element: <GestionCenso /> },
    { path: "/gestion-candidaturas", element: <GestionCandidaturas /> },
    { path: "/gestion-excusas", element: <GestionExcusas /> },
    { path: "/sorteo-jurados", element: <SorteoJurados /> },
    { path: "/control-asistencia", element: <ControlAsistencia /> },
];

function App() {
    return (
        <BrowserRouter>
            {/* Botones de accesibilidad (globales) */}
            <AccessibilityButtons />

            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/callback" element={<Callback />} />
                <Route path="/mock-login" element={<MockLogin />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tarjeton" element={<Tarjeton />} />
                <Route path="/jurado/asistencia" element={<AsistenciaJurado />} />
                <Route path="/confirmacion-voto" element={<ConfirmacionVoto />} />
                <Route path="/comprobante-voto/:numero" element={<ComprobanteVoto />} />
                <Route path="/landing" element={<Landing />} />
                <Route path="/busqueda" element={<Busqueda />} />
                <Route
                    path="/consulta-ciudadano"
                    element={<ConsultaCiudadano />}
                />
                <Route path="/resultados" element={<Resultados />} />
                <Route path="/elecciones" element={<Elecciones />} />
                <Route path="/transparencia" element={<Transparencia />} />
                <Route path="/auditoria" element={<Auditoria />} />
                <Route path="/acta-ciclo-vida" element={<ActaCicloVida />} />
                <Route element={<ProtectedRoute />}>
                    {preelectoralRoutes.map((route) => (
                        <Route
                            key={route.path}
                            path={route.path}
                            element={route.element}
                        />
                    ))}
                    {legacyPreelectoralRoutes.map((route) => (
                        <Route
                            key={route.path}
                            path={route.path}
                            element={route.element}
                        />
                    ))}
                    <Route
                        path="/parametros-base"
                        element={<ParametrosBase />}
                    />
                    <Route
                        path="/metodo-electoral"
                        element={<MetodoElectoralReglas />}
                    />
                    <Route
                        path="/circunscripciones"
                        element={<CircunscripcionesElegibilidad />}
                    />
                    <Route
                        path="/gestion-preelectoral/mesa/:mesaId/apertura"
                        element={<AperturaMesa />}
                    />
                    <Route path="/perfil" element={<ProfilePage />} />
                    {/* SE-M3-02: solo accesible para usuarios autenticados.
                        Si no hay sesión, ProtectedRoute redirige a /login. */}
                    <Route path="/votar-remoto" element={<EmisionRemotaSetup />} />
                </Route>
                <Route path="/publicacion/participacion" element={<ParticipacionEnVivoPage />} />
                <Route path="/publicacion/resultados" element={<ResultadosParcialPage />} />
            </Routes >
        </BrowserRouter >
    );
}

export default App;
