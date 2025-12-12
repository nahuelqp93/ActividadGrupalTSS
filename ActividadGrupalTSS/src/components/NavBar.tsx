import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, BarChart3, PlayCircle, HelpCircle } from "lucide-react";

export default function NavBar() {
  const location = useLocation();

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 bg-slate-800 text-white shadow-2xl flex flex-col">
      
      {/* Logo/Header */}
      <div className="px-6 py-8 border-b border-slate-700">
        <h1 className="text-lg font-bold leading-tight tracking-wide">
          TALLER DE<br/>
          SIMULACIÓN DE<br/>
          SISTEMAS
        </h1>
      </div>

      {/* Navigation Links */}
      <ul className="flex-1 px-4 py-6 space-y-2">
        <li>
          <Link
            to="/"
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${
              location.pathname === "/"
                ? "bg-yellow-500 text-slate-900 font-semibold shadow-lg"
                : "hover:bg-slate-700 hover:text-yellow-300"
            }`}
          >
            <Home size={22} />
            <span className="text-base">Inicio</span>
          </Link>
        </li>

        <li>
          <Link
            to="/conceptos"
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${
              location.pathname === "/conceptos"
                ? "bg-yellow-500 text-slate-900 font-semibold shadow-lg"
                : "hover:bg-slate-700 hover:text-yellow-300"
            }`}
          >
            <BookOpen size={22} />
            <span className="text-base">Conceptos</span>
          </Link>
        </li>

        <li>
          <Link
            to="/distribuciones"
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${
              location.pathname === "/distribuciones"
                ? "bg-yellow-500 text-slate-900 font-semibold shadow-lg"
                : "hover:bg-slate-700 hover:text-yellow-300"
            }`}
          >
            <BarChart3 size={22} />
            <span className="text-base">Distribuciones</span>
          </Link>
        </li>

        <li>
          <Link
            to="/simulacion"
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${
              location.pathname === "/simulacion"
                ? "bg-yellow-500 text-slate-900 font-semibold shadow-lg"
                : "hover:bg-slate-700 hover:text-yellow-300"
            }`}
          >
            <PlayCircle size={22} />
            <span className="text-base">Simulación</span>
          </Link>
        </li>

        <li>
          <Link
            to="/ayuda"
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${
              location.pathname === "/ayuda"
                ? "bg-yellow-500 text-slate-900 font-semibold shadow-lg"
                : "hover:bg-slate-700 hover:text-yellow-300"
            }`}
          >
            <HelpCircle size={22} />
            <span className="text-base">Ayuda</span>
          </Link>
        </li>
      </ul>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-700 text-sm text-slate-400">
        <p>Actividad Final</p>
        <p className="text-xs mt-1">Universidad Mayor de San Simón</p>
      </div>
      
    </nav>
  );
}