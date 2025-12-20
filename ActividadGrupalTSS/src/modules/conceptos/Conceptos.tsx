import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, GraduationCap, Lightbulb } from 'lucide-react';
// Importamos los datos del archivo que creamos arriba
import { sections } from './data/conceptos.data.ts';

export default function Conceptos() {

  // Objeto de configuración de estilos según el color
  const themeStyles: any = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      text: 'text-blue-900',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      button: 'hover:bg-blue-600 hover:text-white border-blue-200 text-blue-700',
      accent: 'bg-blue-500'
    },
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      text: 'text-emerald-900',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      button: 'hover:bg-emerald-600 hover:text-white border-emerald-200 text-emerald-700',
      accent: 'bg-emerald-500'
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* --- HEADER AMIGABLE --- */}
        <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-10">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold uppercase tracking-wider mb-4">
              <GraduationCap size={16} />
              Módulo Teórico
            </div>
            <h1 className="text-4xl font-extrabold text-slate-800 mb-4">
              Conceptos Fundamentales
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
              Antes de empezar a simular, necesitamos entender el "idioma" de la probabilidad. 
              Aquí aprenderás las bases para modelar el comportamiento aleatorio de un sistema.
            </p>
          </div>
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-yellow-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        </div>

        {/* --- SECCIONES DE APRENDIZAJE --- */}
        <div className="grid gap-8">
          {sections.map((section) => {
            const theme = themeStyles[section.color] || themeStyles.blue;
            const Icon = section.icon;
            
            return (
              <section key={section.id} className="relative">
                
                {/* Título de la Sección */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-xl ${theme.iconBg} ${theme.iconColor} shadow-sm`}>
                    <Icon size={28} strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">{section.title}</h2>
                    <p className="text-slate-500 text-sm">{section.description}</p>
                  </div>
                </div>

                {/* Grid de Temas (Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {section.topics.map((topic, idx) => (
                    <Link
                      key={idx}
                      to={topic.path}
                      className="group relative flex flex-col bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                    >
                      {/* Borde superior de color */}
                      <div className={`absolute top-0 left-0 w-full h-1 ${theme.accent} opacity-0 group-hover:opacity-100 transition-opacity`}></div>

                      <div className="flex justify-between items-start mb-3">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500 group-hover:bg-slate-800 group-hover:text-yellow-400 transition-colors`}>
                          {topic.badge}
                        </span>
                        <div className="text-slate-300 group-hover:text-slate-600 transition-colors">
                          <BookOpen size={18} />
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition-colors">
                        {topic.name}
                      </h3>
                      
                      <p className="text-sm text-slate-500 mb-6 grow leading-relaxed">
                        {topic.description}
                      </p>

                      <div className={`mt-auto flex items-center justify-between text-sm font-semibold border-t border-slate-100 pt-4 ${theme.text}`}>
                        <span>Explorar tema</span>
                        <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* --- AYUDA CONTEXTUAL --- */}
        <div className="bg-indigo-900 rounded-2xl p-6 md:p-8 text-white flex flex-col md:flex-row gap-6 items-center shadow-lg">
          <div className="p-4 bg-indigo-800/50 rounded-full">
            <Lightbulb size={32} className="text-yellow-400" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="text-lg font-bold mb-1">¿Por qué aprender esto?</h4>
            <p className="text-indigo-200 text-sm leading-relaxed">
              Las simulaciones por computadora se basan en generar números aleatorios que siguen estas reglas. Si no entiendes la diferencia entre una <strong>PDF</strong> y una <strong>CDF</strong>, será difícil crear simuladores precisos más adelante.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}