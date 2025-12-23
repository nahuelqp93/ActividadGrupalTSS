import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Sugerencia: usa lucide-react para iconos

const ejercicios = [
  '/simulacion/aplicacion/ejercicio-1',
  '/simulacion/aplicacion/ejercicio-2',
  '/simulacion/aplicacion/ejercicio-3',
  '/simulacion/aplicacion/ejercicio-4',
  '/simulacion/aplicacion/ejercicio-5',
  '/simulacion/aplicacion/ejercicio-6',
  '/simulacion/aplicacion/ejercicio-7',
  '/simulacion/aplicacion/ejercicio-8',
  '/simulacion/aplicacion/ejercicio-9',
];

export function LayoutAplicacion({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  const indexActual = ejercicios.indexOf(location.pathname);
  // Calculamos el porcentaje para una barra de progreso visual
  const progreso = ((indexActual + 1) / ejercicios.length) * 100;

  const irAnterior = () => indexActual > 0 && navigate(ejercicios[indexActual - 1]);
  const irSiguiente = () => indexActual < ejercicios.length - 1 && navigate(ejercicios[indexActual + 1]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      {/* Navbar Superior */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            
            {/* Botón Anterior */}
            <button
              onClick={irAnterior}
              disabled={indexActual <= 0}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </button>

            {/* Indicador de Progreso Central */}
            <div className="flex flex-col items-center gap-1.5 min-w-50">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Ejercicio {indexActual + 1} de {ejercicios.length}
              </span>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div 
                  className="h-full bg-slate-900 transition-all duration-300 ease-out"
                  style={{ width: `${progreso}%` }}
                />
              </div>
            </div>

            {/* Botón Siguiente */}
            <button
              onClick={irSiguiente}
              disabled={indexActual >= ejercicios.length - 1}
              className="flex items-center gap-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="mx-auto max-w-350 p-8">
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          {children}
        </div>
      </main>
    </div>
  );
}