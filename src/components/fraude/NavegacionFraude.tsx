import { useLocation, useNavigate } from "react-router-dom";
import { Shield, Search, Send, BarChart3, BookOpen, Scale, FileCheck } from "lucide-react";

const tabs = [
  {
    label: "Centro de Investigación",
    path: "/fraude/alertas",
    icon: Search,
  },
  {
    label: "Gestión de Casos",
    path: "/fraude/gestion-casos",
    icon: Scale,
  },
  {
    label: "Catálogo Tipologías",
    path: "/fraude/catalogo-tipologias",
    icon: BookOpen,
  },
  {
    label: "Evidencias",
    path: "/fraude/evidencias",
    icon: FileCheck,
  },
  {
    label: "Reportar Evento",
    path: "/fraude/reportar",
    icon: Send,
  },
  {
    label: "Métricas",
    path: "/fraude/metricas",
    icon: BarChart3,
  },
];

export default function NavegacionFraude() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Shield size={20} className="text-red-600" />
        <h2 className="text-base font-bold text-slate-900">Módulo Fraude</h2>
      </div>
      <nav className="flex gap-1 rounded-xl bg-slate-100 p-1 flex-wrap">
        {tabs.map((tab) => {
          const active = pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              type="button"
              onClick={() => navigate(tab.path)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                active
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
