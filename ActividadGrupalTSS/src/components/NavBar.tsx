import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, BookOpen, BarChart3, PlayCircle, HelpCircle, 
  ChevronDown, Activity, TrendingUp, FlaskConical, BookCheck, Dice6, GamepadDirectional
} from "lucide-react";


export default function NavBar() {
  const location = useLocation();
  
  // Definir las condiciones de "activo" primero
  const isParentActive = location.pathname.includes("/distribuciones");
  const isSimParentActive = location.pathname.includes("/simulacion");
  const isConceptosActive = location.pathname.includes("/conceptos");
  
  const [isDistOpen, setIsDistOpen] = useState(isParentActive);
  const [isSimOpen, setIsSimOpen] = useState(isSimParentActive);
  const [isConceptosOpen, setIsConceptosOpen] = useState(isConceptosActive);

  const isActive = (path: string) => location.pathname === path;
  
  // Mantener los menús abiertos cuando estamos en sus rutas
  useEffect(() => {
    if (isConceptosActive && !isConceptosOpen) {
      setIsConceptosOpen(true);
    }
    if (isParentActive && !isDistOpen) {
      setIsDistOpen(true);
    }
    if (isSimParentActive && !isSimOpen) {
      setIsSimOpen(true);
    }
  }, [location.pathname]);

  return (
    <nav className="fixed left-0 top-0 h-screen w-80 bg-slate-800 text-white shadow-2xl flex flex-col overflow-y-auto z-50 sidebar-scroll">
      {/* Header */}
      <div className="px-6 py-8 border-b border-slate-700 bg-slate-900">
        <h1 className="text-lg font-bold leading-tight tracking-wide text-yellow-500">
          SIMULACIÓN DE<br/> SISTEMAS
        </h1>
        <p className="text-xs text-slate-400 mt-1">UMSS - Ingeniería</p>
      </div>

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
          <button 
            onClick={() => setIsConceptosOpen(!isConceptosOpen)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${isConceptosActive ? "bg-slate-700 text-yellow-300" : "hover:bg-slate-700"}`}
          >
            <div className="flex items-center gap-4">
              <BookOpen size={20} />
              <span>Conceptos</span>
            </div>
            <ChevronDown size={16} className={`transition-transform duration-300 ${isConceptosOpen ? "rotate-180" : "rotate-0"}`} />
          </button>

          <div className={`grid transition-all duration-300 ease-in-out ${isConceptosOpen ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0"}`}>
            <ul className="overflow-hidden ml-4 space-y-1 border-l-2 border-slate-600 pl-2">
              <li>
                <Link to="/conceptos/variables-aleatorias" className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm transition-all ${location.pathname.includes("/conceptos/variables-aleatorias") ? "bg-yellow-500/20 text-yellow-300" : "text-slate-300 hover:text-white hover:bg-slate-700"}`}>
                  <Dice6 size={16} /> Variables Aleatorias
                </Link>
              </li>
              <li>
                <Link to="/conceptos/ejercicios-interactivos" className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm transition-all ${location.pathname.includes("/conceptos/ejercicios") ? "bg-yellow-500/20 text-yellow-300" : "text-slate-300 hover:text-white hover:bg-slate-700"}`}>
                  <GamepadDirectional size={16} /> Ejercicios Interactivos
                </Link>
              </li>
            </ul>
          </div>
        </li>

        {/* --- SECCIÓN: DISTRIBUCIONES --- */}
        <li>
          <button 
            onClick={() => setIsDistOpen(!isDistOpen)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${isParentActive ? "bg-slate-700 text-yellow-300" : "hover:bg-slate-700"}`}
          >
            <div className="flex items-center gap-4">
              <BarChart3 size={20} />
              <span>Distribuciones</span>
            </div>
            <ChevronDown size={16} className={`transition-transform duration-300 ${isDistOpen ? "rotate-180" : "rotate-0"}`} />
          </button>

          <div className={`grid transition-all duration-300 ease-in-out ${isDistOpen ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0"}`}>
            <ul className="overflow-hidden ml-4 space-y-1 border-l-2 border-slate-600 pl-2">
              <li><p className="px-4 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider mt-2">Continuas</p></li>
              <li>
                <Link to="/distribuciones/continuas/triangular" className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm transition-all ${isActive("/distribuciones/continuas/triangular") ? "bg-yellow-500/20 text-yellow-300" : "text-slate-300 hover:text-white hover:bg-slate-700"}`}>
                  <TrendingUp size={16} /> Triangular
                </Link>
              </li>
              <li>
                <Link to="/distribuciones/continuas/uniforme" className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm transition-all ${isActive("/distribuciones/continuas/uniforme") ? "bg-yellow-500/20 text-yellow-300" : "text-slate-300 hover:text-white hover:bg-slate-700"}`}>
                  <TrendingUp size={16} /> Uniforme
                </Link>
              </li>
              <li>
                <Link to="/distribuciones/continuas/exponencial" className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm transition-all ${isActive("/distribuciones/continuas/exponencial") ? "bg-yellow-500/20 text-yellow-300" : "text-slate-300 hover:text-white hover:bg-slate-700"}`}>
                  <TrendingUp size={16} />
                  Exponencial
                </Link>
              </li>

              <li><p className="px-4 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider mt-2">Discretas</p></li>
              <li>
                <Link to="/distribuciones/discretas/poisson" className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm transition-all ${isActive("/distribuciones/discretas/poisson") ? "bg-yellow-500/20 text-yellow-300" : "text-slate-300 hover:text-white hover:bg-slate-700"}`}>
                  <Activity size={16} /> Poisson
                </Link>
              </li>
              <li>
                <Link to="/distribuciones/discretas/bernoulli" className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm transition-all ${isActive("/distribuciones/discretas/bernoulli") ? "bg-yellow-500/20 text-yellow-300" : "text-slate-300 hover:text-white hover:bg-slate-700"}`}>
                  <Activity size={16} />
                  Bernoulli
                </Link>
              </li>
            </ul>
          </div>
        </li>

        {/* --- SECCIÓN: SIMULACIÓN --- */}
        <li>
          <button 
            onClick={() => setIsSimOpen(!isSimOpen)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${isSimParentActive ? "bg-slate-700 text-yellow-300" : "hover:bg-slate-700"}`}
          >
            <div className="flex items-center gap-4">
              <PlayCircle size={20} />
              <span>Simulación</span>
            </div>
            <ChevronDown size={16} className={`transition-transform duration-300 ${isSimOpen ? "rotate-180" : "rotate-0"}`} />
          </button>

          <div className={`grid transition-all duration-300 ease-in-out ${isSimOpen ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0"}`}>
            <ul className="overflow-hidden ml-4 space-y-1 border-l-2 border-slate-600 pl-2">
              <li>
                <Link to="/simulacion/aplicacion" className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm transition-all ${isActive("/simulacion/aplicacion") ? "bg-yellow-500/20 text-yellow-300" : "text-slate-300 hover:text-white hover:bg-slate-700"}`}>
                  <FlaskConical size={16} /> Ejercicios Aplicación
                </Link>
              </li>
              <li>
                <Link to="/simulacion/teoricos" className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm transition-all ${isActive("/simulacion/teoricos") ? "bg-yellow-500/20 text-yellow-300" : "text-slate-300 hover:text-white hover:bg-slate-700"}`}>
                  <BookCheck size={16} /> Ejercicios Teóricos
                </Link>
              </li>
            </ul>
          </div>
        </li>

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