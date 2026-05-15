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
import ProtectedLayout from "./components/ProtectedLayout";
import ParametrosBase from "./pages/configuracion-elecciones/ParametrosBase";
import MetodoElectoralReglas from "./pages/configuracion-elecciones/MetodoElectoralReglas";
import CircunscripcionesElegibilidad from "./pages/configuracion-elecciones/CircunscripcionesElegibilidad";
import ProfilePage from "./pages/ProfilePage";
import GestionReglas from "./pages/GestionReglas";
import EvaluacionAntifraude from "./pages/EvaluacionAntifraude";
import BandejaAprobacion from "./pages/BandejaAprobacion";
import AlertasFraude from "./pages/fraude/AlertasPage";
import ReportarEventoFraude from "./pages/fraude/ReportarEventoPage";
import MetricasFraude from "./pages/fraude/MetricasPage";
import CatalogoTipologiasPage from "./pages/fraude/CatalogoTipologiasPage";
import GestionCasosPage from "./pages/fraude/GestionCasosPage";
import EvidenciasPage from "./pages/fraude/EvidenciasPage";

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

const juradoRoutes = [
    { path: "/jurados/excusas", element: <GestionExcusas /> },
    { path: "/jurados/asistencia", element: <ControlAsistencia /> },
];

function App() {
    return (
        <BrowserRouter>
            <AccessibilityButtons />

            <Routes>
                {/* Public routes — no auth required */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/callback" element={<Callback />} />
                <Route path="/mock-login" element={<MockLogin />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/busqueda" element={<Busqueda />} />
                <Route path="/consulta-ciudadano" element={<ConsultaCiudadano />} />
                <Route path="/resultados" element={<Resultados />} />
                <Route path="/elecciones" element={<Elecciones />} />
                <Route path="/transparencia" element={<Transparencia />} />
                <Route path="/landing" element={<Landing />} />

                {/* Protected routes — auth required + persistent layout */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<ProtectedLayout />}>
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
                        {juradoRoutes.map((route) => (
                            <Route
                                key={route.path}
                                path={route.path}
                                element={route.element}
                            />
                        )}
                        <Route path="/parametros-base" element={<ParametrosBase />} />
                        <Route path="/metodo-electoral" element={<MetodoElectoralReglas />} />
                        <Route path="/circunscripciones" element={<CircunscripcionesElegibilidad />} />
                        <Route path="/gestion-preelectoral/mesa/:mesaId/apertura" element={<AperturaMesa />} />
                        <Route path="/perfil" element={<ProfilePage />} />
                        <Route path="/tarjeton" element={<Tarjeton />} />
                        <Route path="/votar-remoto" element={<EmisionRemotaSetup />} />
                        <Route path="/jurado/asistencia" element={<AsistenciaJurado />} />
                        <Route path="/confirmacion-voto" element={<ConfirmacionVoto />} />
                        <Route path="/comprobante-voto/:numero" element={<ComprobanteVoto />} />
                        <Route path="/gestion-reglas" element={<GestionReglas />} />
                        <Route path="/evaluacion-antifraude" element={<EvaluacionAntifraude />} />
                        <Route path="/bandeja-aprobacion" element={<BandejaAprobacion />} />
                        <Route path="/fraude/alertas" element={<AlertasFraude />} />
                        <Route path="/fraude/reportar" element={<ReportarEventoFraude />} />
                        <Route path="/fraude/metricas" element={<MetricasFraude />} />
                        <Route path="/fraude/catalogo-tipologias" element={<CatalogoTipologiasPage />} />
                        <Route path="/fraude/gestion-casos" element={<GestionCasosPage />} />
                        <Route path="/fraude/evidencias" element={<EvidenciasPage />} />
                    </Route>
                </Route>

                {/* Publicacion — accessible without auth for transparency */}
                <Route path="/publicacion/participacion" element={<ParticipacionEnVivoPage />} />
                <Route path="/publicacion/resultados" element={<ResultadosParcialPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;