import { useState } from "react"; // Importante importar useState
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  BookOpen, 
  BarChart3, 
  PlayCircle, 
  HelpCircle, 
  ChevronDown, 
  ChevronRight,
  Activity,     // Icono para discretas
  TrendingUp,   // Icono para continuas
  Layers,       // Icono para composición
  RefreshCw,    // Icono para transformada inversa
  Target        // Icono para rechazo
} from "lucide-react";

export default function NavBar() {
  const location = useLocation();
  
  // Estado para saber si el menú de distribuciones está abierto
  // Truco: Si la URL actual incluye "distribuciones", lo iniciamos abierto
  const [isDistOpen, setIsDistOpen] = useState(location.pathname.includes("distribuciones"));
  
  // Estado para el menú de simulación
  const [isSimOpen, setIsSimOpen] = useState(location.pathname.includes("simulacion"));

  const isActive = (path: string) => location.pathname === path;
  const isParentActive = location.pathname.includes("/distribuciones");

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 bg-slate-800 text-white shadow-2xl flex flex-col overflow-y-auto z-50">
      
      {/* Header */}
      <div className="px-6 py-8 border-b border-slate-700 bg-slate-900">
        <h1 className="text-lg font-bold leading-tight tracking-wide text-yellow-500">
          SIMULACIÓN DE<br/> SISTEMAS
        </h1>
        <p className="text-xs text-slate-400 mt-1">UMSS - Ingeniería</p>
      </div>

      {/* Links */}
      <ul className="flex-1 px-4 py-6 space-y-2">
        
        {/* INICIO */}
        <li>
          <Link to="/" className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${isActive("/") ? "bg-yellow-500 text-slate-900 font-bold" : "hover:bg-slate-700"}`}>
            <Home size={20} />
            <span>Inicio</span>
          </Link>
        </li>

        {/* CONCEPTOS */}
        <li>
          <Link to="/conceptos" className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${isActive("/conceptos") ? "bg-yellow-500 text-slate-900 font-bold" : "hover:bg-slate-700"}`}>
            <BookOpen size={20} />
            <span>Conceptos</span>
          </Link>
        </li>

        {/* --- SECCIÓN DESPLEGABLE: DISTRIBUCIONES --- */}
        <li>
          <button 
            onClick={() => setIsDistOpen(!isDistOpen)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${isParentActive ? "bg-slate-700 text-yellow-300" : "hover:bg-slate-700"}`}
          >
            <div className="flex items-center gap-4">
              <BarChart3 size={20} />
              <span>Distribuciones</span>
            </div>
            {isDistOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {/* Sub-menú */}
          {isDistOpen && (
            <ul className="mt-2 ml-4 space-y-1 border-l-2 border-slate-600 pl-2">
              {/* Continuas */}
              <li>
                <p className="px-4 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider mt-2">Continuas</p>
              </li>
              <li>
                <Link to="/distribuciones/continuas/triangular" className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm transition-all ${isActive("/distribuciones/continuas/triangular") ? "bg-yellow-500/20 text-yellow-300" : "text-slate-300 hover:text-white hover:bg-slate-700"}`}>
                  <TrendingUp size={16} />
                  Triangular
                </Link>
              </li>
              <li>
                <Link to="/distribuciones/continuas/uniforme" className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm transition-all ${isActive("/distribuciones/continuas/uniforme-lcg") ? "bg-yellow-500/20 text-yellow-300" : "text-slate-300 hover:text-white hover:bg-slate-700"}`}>
                  <TrendingUp size={16} />
                  Uniforme
                </Link>
              </li>
              <li>
                <Link to="/distribuciones/continuas/exponencial" className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm transition-all ${isActive("/distribuciones/continuas/exponencial") ? "bg-yellow-500/20 text-yellow-300" : "text-slate-300 hover:text-white hover:bg-slate-700"}`}>
                  <TrendingUp size={16} />
                  Exponencial
                </Link>
              </li>

              {/* Discretas */}
              <li>
                <p className="px-4 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider mt-2">Discretas</p>
              </li>
              <li>
                <Link to="/distribuciones/discretas/poisson" className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm transition-all ${isActive("/distribuciones/discretas/poisson") ? "bg-yellow-500/20 text-yellow-300" : "text-slate-300 hover:text-white hover:bg-slate-700"}`}>
                  <Activity size={16} />
                  Poisson
                </Link>
              </li>
              <li>
                <Link to="/distribuciones/discretas/bernoulli" className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm transition-all ${isActive("/distribuciones/discretas/bernoulli") ? "bg-yellow-500/20 text-yellow-300" : "text-slate-300 hover:text-white hover:bg-slate-700"}`}>
                  <Activity size={16} />
                  Bernoulli
                </Link>
              </li>
            </ul>
          )}
        </li>
        {/* ------------------------------------------- */}

        {/* --- SECCIÓN DESPLEGABLE: SIMULACIÓN --- */}
        <li>
          <button 
            onClick={() => setIsSimOpen(!isSimOpen)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${location.pathname.includes("/simulacion") ? "bg-slate-700 text-yellow-300" : "hover:bg-slate-700"}`}
          >
            <div className="flex items-center gap-4">
              <PlayCircle size={20} />
              <span>Simulación</span>
            </div>
            {isSimOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {/* Sub-menú */}
          {isSimOpen && (
            <ul className="mt-2 ml-4 space-y-1 border-l-2 border-slate-600 pl-2">
              <li>
                <Link to="/simulacion/composicion" className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm transition-all ${isActive("/simulacion/composicion") ? "bg-yellow-500/20 text-yellow-300" : "text-slate-300 hover:text-white hover:bg-slate-700"}`}>
                  <Layers size={16} />
                  MÉTODO DE COMPOSICIÓN
                </Link>
              </li>
            </ul>
          )}
        </li>
        {/* ------------------------------------------- */}

        {/* AYUDA */}
        <li>
          <Link to="/ayuda" className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${isActive("/ayuda") ? "bg-yellow-500 text-slate-900 font-bold" : "hover:bg-slate-700"}`}>
            <HelpCircle size={20} />
            <span>Ayuda</span>
          </Link>
        </li>

      </ul>
    </nav>
  );
}