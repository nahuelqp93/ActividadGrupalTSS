
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, Calculator, Clock, AlertCircle } from 'lucide-react';
import { categorias } from './utils/dataEjercicios'; // <--- AJUSTA ESTA RUTA

export default function InicioEjercicios() {
  const getThemeStyles = (theme: 'blue' | 'emerald') => {
    if (theme === 'blue') {
      return {
        headerGradient: 'from-blue-900 to-blue-800',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-700',
        cardBorder: 'hover:border-blue-400',
        badge: 'bg-blue-50 text-blue-700 border-blue-100',
        button: 'bg-blue-600 hover:bg-blue-700'
      };
    }
    return {
      headerGradient: 'from-emerald-900 to-emerald-800',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-700',
      cardBorder: 'hover:border-emerald-400',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      button: 'bg-emerald-600 hover:bg-emerald-700'
    };
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 font-sans text-slate-900 relative">
      
      {/* Patrón de fondo */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none"
        style={{ 
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }}
      />

      <div className="max-w-5xl mx-auto space-y-10 relative z-10">
        
        {/* Botón de navegación */}
        <div className="print:hidden">
            {/* <BotonVolver /> */}
        </div>

        {/* --- HERO HEADER --- */}
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
             {/* Decoración */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
             
             <div className="flex items-center gap-6 relative z-10">
                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                  <BookOpen size={48} className="text-blue-200" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight mb-2">
                    Ejercicios Prácticos Resueltos
                  </h1>
                  <p className="text-slate-300 text-lg font-light">
                    Guía paso a paso basada en la metodología del curso.
                  </p>
                </div>
             </div>
          </div>
          
          {/* Barra de Metodología */}
          <div className="bg-blue-50/50 p-4 border-b border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
             <div className="flex items-center gap-2 justify-center md:justify-start">
                <Calculator size={16} className="text-blue-600" />
                <span>Cálculos matemáticos detallados</span>
             </div>
             <div className="flex items-center gap-2 justify-center md:justify-start">
                <Clock size={16} className="text-blue-600" />
                <span>Tablas de iteración paso a paso</span>
             </div>
             <div className="flex items-center gap-2 justify-center md:justify-start">
                <AlertCircle size={16} className="text-blue-600" />
                <span>Interpretación de resultados</span>
             </div>
          </div>
        </div>

        {/* --- SECCIONES DE CONTENIDO --- */}
        <div className="space-y-12">
          {categorias.map((categoria) => {
            const styles = getThemeStyles(categoria.theme);
            const Icon = categoria.icon;
            
            return (
              <section key={categoria.id} className="scroll-mt-8">
                
                {/* Título de Categoría */}
                <div className="flex items-center gap-4 mb-6 border-b-2 border-slate-200 pb-2">
                  <div className={`p-3 rounded-lg ${styles.iconBg} ${styles.iconColor}`}>
                    <Icon size={28} strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-slate-800">
                      {categoria.id}. {categoria.titulo}
                    </h2>
                    <p className="text-slate-500 text-sm">
                      {categoria.descripcion}
                    </p>
                  </div>
                </div>

                {/* Grid de Ejercicios */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {categoria.ejercicios.map((ejercicio, idx) => (
                    <Link
                      key={idx}
                      to={ejercicio.ruta}
                      className={`
                        group relative flex flex-col bg-white rounded-xl 
                        border border-slate-200 shadow-sm
                        transition-all duration-300 ease-out
                        hover:-translate-y-1 hover:shadow-lg ${styles.cardBorder}
                        overflow-hidden
                      `}
                    >
                      {/* Borde superior de color */}
                      <div className={`h-1.5 w-full bg-linear-to-r ${styles.headerGradient}`}></div>

                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <span className="font-mono text-xs text-slate-400 font-bold tracking-wider">
                            EJERCICIO {categoria.id}.{idx + 1}
                          </span>
                          <ArrowRight 
                            size={18} 
                            className={`opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 ${styles.iconColor}`} 
                          />
                        </div>

                        <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-blue-900 transition-colors">
                          {ejercicio.nombre}
                        </h3>
                        
                        <p className="text-sm text-slate-600 mb-6 flex-1 leading-relaxed">
                          {ejercicio.descripcion}
                        </p>

                        {/* Tags / Metadata dinámicos */}
                        <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-100">
                          {Object.entries(ejercicio).map(([key, value]) => {
                            if (['nombre', 'descripcion', 'ruta'].includes(key)) return null;
                            return (
                              <span 
                                key={key}
                                className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${styles.badge}`}
                              >
                                {value}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <div className="text-center pt-8 pb-4 text-slate-400 text-sm font-sans">
          &copy; {new Date().getFullYear()} Material Didáctico de Simulación &bull; Ingeniería de Sistemas
        </div>

      </div>
    </div>
  );
}