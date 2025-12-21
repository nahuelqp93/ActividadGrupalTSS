import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  BarChart3, 
  PlayCircle, 
  ArrowRight, 
  Cpu, 
  Zap,
  GraduationCap
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 relative overflow-hidden font-sans">
      
      {/* --- FONDO ANIMADO SUTIL --- */}
      {/* Círculos de luz decorativos de fondo */}
      <div className="absolute top-0 left-0 w-125 h-125 bg-blue-600/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-125 h-125 bg-yellow-600/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-10 pt-10">

        {/* --- HERO SECTION --- */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium text-yellow-400 mb-2">
            <Zap size={14} />
            <span>Sistema de Aprendizaje Interactivo</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white">
            Domina la <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-yellow-600">
              Simulación de Sistemas
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
            Una plataforma integral para aprender probabilidad, modelar distribuciones y ejecutar simulaciones estocásticas complejas. Desde la teoría hasta la práctica.
          </p>
        </div>

        {/* --- BENTO GRID (ACCESOS RÁPIDOS) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">
          
          {/* TARJETA 1: CONCEPTOS (Larga vertical en móvil, normal en desktop) */}
          <Link 
            to="/conceptos/variables-aleatorias" 
            className="group relative bg-slate-800 rounded-3xl p-8 border border-slate-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/20 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
              <BookOpen size={120} />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="p-3 bg-blue-500/20 w-fit rounded-xl text-blue-400 mb-4">
                <BookOpen size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Conceptos Teóricos</h3>
                <p className="text-slate-400 text-sm">
                  Fundamentos de variables aleatorias, PDF, CDF y probabilidad.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-blue-400 font-bold text-sm group-hover:translate-x-2 transition-transform">
                Comenzar a leer <ArrowRight size={16} />
              </div>
            </div>
          </Link>

          {/* TARJETA 2: DISTRIBUCIONES */}
          <Link 
            to="/distribuciones/continuas/triangular" 
            className="group relative bg-slate-800 rounded-3xl p-8 border border-slate-700 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/20 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
              <BarChart3 size={120} />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="p-3 bg-emerald-500/20 w-fit rounded-xl text-emerald-400 mb-4">
                <BarChart3 size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Distribuciones</h3>
                <p className="text-slate-400 text-sm">
                  Visualiza gráficas de distribuciones discretas y continuas.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-emerald-400 font-bold text-sm group-hover:translate-x-2 transition-transform">
                Explorar gráficas <ArrowRight size={16} />
              </div>
            </div>
          </Link>

          {/* TARJETA 3: SIMULACIÓN (Destacada) */}
          <Link 
            to="/simulacion/aplicacion/ejercicio-1" 
            className="md:col-span-1 md:row-span-2 group relative bg-linear-to-br from-yellow-500/10 to-slate-800 rounded-3xl p-8 border border-yellow-500/30 hover:border-yellow-400 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-900/20 overflow-hidden flex flex-col"
          >
            <div className="absolute -bottom-10 -right-10 p-8 opacity-20 group-hover:opacity-30 group-hover:rotate-12 transition-all duration-500">
              <PlayCircle size={200} />
            </div>
            
            <div className="relative z-10">
              <div className="p-3 bg-yellow-500/20 w-fit rounded-xl text-yellow-400 mb-6">
                <Cpu size={32} />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Laboratorio de Simulación</h3>
              <p className="text-slate-300 mb-6 leading-relaxed">
                El núcleo del sistema. Ejecuta algoritmos de Montecarlo, generación de variables aleatorias y modelos de colas.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-400 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                  Método de Transformada Inversa
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-400 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                  Simulación de Colas
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-400 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                  Método de Composición
                </div>
              </div>
            </div>

            <div className="mt-auto pt-8">
              <button className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                Ir al Laboratorio <PlayCircle size={20} />
              </button>
            </div>
          </Link>

          {/* TARJETA 4: AYUDA / INFO (Más pequeña) */}
          <Link 
            to="/ayuda" 
            className="md:col-span-2 group bg-slate-800 rounded-3xl p-8 border border-slate-700 hover:bg-slate-750 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-6">
              <div className="p-4 bg-slate-700 rounded-full text-slate-300 group-hover:text-white transition-colors">
                <GraduationCap size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">¿Eres nuevo aquí?</h3>
                <p className="text-slate-400 text-sm">Revisa la guía de usuario y la metodología.</p>
              </div>
            </div>
            <ArrowRight className="text-slate-500 group-hover:text-white group-hover:translate-x-2 transition-all" />
          </Link>

        </div>

        {/* --- FOOTER DEL DASHBOARD --- */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
          <p>© 2024 UMSS - Ingeniería de Sistemas</p>
          <p>Desarrollado para la materia de Simulación de Sistemas</p>
        </div>

      </div>
    </div>
  );
}