import { useState } from 'react';
import { 
  Dices, 
  ArrowRight, 
  Thermometer, 
  Clock, 
  Users, 
  HelpCircle,
  Calculator,
  Binary
} from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { BotonVolver } from './components/BotonVolver';
export default function IntroduccionVA() {
  const [dadoResultado, setDadoResultado] = useState<number | null>(null);
  const [lanzamientos, setLanzamientos] = useState<number[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const lanzarDado = () => {
    setIsAnimating(true);
    // Pequeño efecto de "cargando" para dar sensación de aleatoriedad
    setTimeout(() => {
      const resultado = Math.floor(Math.random() * 6) + 1;
      setDadoResultado(resultado);
      setLanzamientos(prev => [resultado, ...prev].slice(0, 8)); // Guardamos los últimos 8 al principio
      setIsAnimating(false);
    }, 400);
  };

  const ejemplos = [
    {
      icon: Dices,
      situacion: 'Lanzamiento de un dado',
      variable: 'X = Puntos obtenidos',
      valores: '{1, 2, 3, 4, 5, 6}',
      tipo: 'Discreta',
      color: 'blue'
    },
    {
      icon: Users,
      situacion: 'Clientes en una fila',
      variable: 'N = Cantidad de personas',
      valores: '{0, 1, 2, 3, ...}',
      tipo: 'Discreta',
      color: 'blue'
    },
    {
      icon: Clock,
      situacion: 'Tiempo de espera',
      variable: 'T = Tiempo en minutos',
      valores: '[0, ∞)',
      tipo: 'Continua',
      color: 'emerald'
    },
    {
      icon: Thermometer,
      situacion: 'Temperatura ambiente',
      variable: 'Y = Grados Celsius',
      valores: '(-∞, ∞)',
      tipo: 'Continua',
      color: 'emerald'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
        <div className="print:hidden"> 
           <BotonVolver />
        </div>
      <div className="max-w-5xl mx-auto space-y-10">

        {/* --- HEADER --- */}
        <header className="text-center space-y-4 py-6">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full text-blue-700 mb-2">
            <Binary size={32} />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Introducción a Variables Aleatorias
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            El puente matemático entre la incertidumbre del mundo real y los números que podemos calcular.
          </p>
        </header>

        {/* --- SECCIÓN 1: DEFINICIÓN VISUAL --- */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 p-6 text-white flex items-center gap-3">
            <HelpCircle className="text-yellow-400" />
            <h2 className="text-xl font-bold">¿Qué es realmente?</h2>
          </div>
          
          <div className="p-8 grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <p className="text-lg text-slate-700 leading-relaxed">
                Imagina que una Variable Aleatoria (V.A.) es una <strong>máquina traductora</strong>.
              </p>
              <p className="text-slate-600">
                Toma un evento del mundo real (caótico, incierto) y lo convierte en un número ordenado con el que podemos hacer matemáticas.
              </p>
              
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-4">
                <p className="text-sm font-bold text-blue-900 uppercase tracking-wide mb-1">Definición Formal</p>
                <div className="text-slate-800">
                  Una V.A. <InlineMath math="X" /> es una función que mapea el espacio muestral <InlineMath math="\Omega" /> a los números reales <InlineMath math="\mathbb{R}" />.
                  <div className="mt-2 py-2 px-4 bg-white rounded shadow-inner text-center">
                     <BlockMath math="X: \Omega \rightarrow \mathbb{R}" />
                  </div>
                </div>
              </div>
            </div>

            {/* DIAGRAMA DE MAPEO (Visualización del Concepto) */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 flex flex-col items-center text-center">
              
              <p className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-wider">Concepto Visual</p>
              <div className="flex items-center gap-2 w-full justify-between">
                
                {/* Mundo Real */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 bg-white border-2 border-slate-300 rounded-lg flex items-center justify-center shadow-sm">
                    <Dices className="text-slate-600" size={32} />
                  </div>
                  <span className="text-xs font-semibold text-slate-500">Mundo Real<br/>(Espacio Muestral Ω)</span>
                </div>

                {/* La Función */}
                <div className="flex flex-col items-center relative flex-1 px-4">
                  <div className="absolute -top-6 text-blue-600 font-bold font-mono">X(ω)</div>
                  <ArrowRight className="text-blue-500 w-full" size={32} />
                  <span className="text-xs text-blue-600 font-medium">La Variable Aleatoria<br/>actúa aquí</span>
                </div>

                {/* Mundo Matemático */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 bg-white border-2 border-slate-300 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-2xl font-bold text-slate-700">#</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">Números Reales<br/>(Rango de X)</span>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* --- SECCIÓN 2: LABORATORIO INTERACTIVO --- */}
        <section className="grid md:grid-cols-5 gap-6">
          {/* Panel Izquierdo: Control */}
          <div className="md:col-span-2 bg-indigo-900 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between relative overflow-hidden">
            {/* Decoración de fondo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2">Laboratorio</h3>
              <p className="text-indigo-200 text-sm mb-6">
                Lanza el dado para ver cómo el evento físico se convierte en un número.
              </p>

              <div className="flex flex-col items-center justify-center py-8">
                {dadoResultado ? (
                  <div className={`transform transition-all duration-300 ${isAnimating ? 'scale-50 opacity-50 rotate-180' : 'scale-100 opacity-100 rotate-0'}`}>
                    <div className="w-24 h-24 bg-white text-indigo-900 rounded-2xl flex items-center justify-center shadow-2xl border-4 border-indigo-400">
                      <span className="text-6xl font-black">{dadoResultado}</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-24 h-24 border-2 border-dashed border-indigo-400 rounded-2xl flex items-center justify-center opacity-50">
                    <HelpCircle size={32} />
                  </div>
                )}
                
                <div className="mt-4 font-mono text-indigo-300">
                  {dadoResultado ? <InlineMath math={`X(\\text{dado}) = ${dadoResultado}`} /> : 'Esperando...'}
                </div>
              </div>
            </div>

            <button
              onClick={lanzarDado}
              disabled={isAnimating}
              className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative z-10"
            >
              <Dices size={20} />
              {isAnimating ? 'Lanzando...' : 'Generar Variable Aleatoria'}
            </button>
          </div>

          {/* Panel Derecho: Historial / Datos */}
          <div className="md:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Calculator size={18} className="text-indigo-500"/>
              Registro de Realizaciones (x)
            </h3>
            
            {lanzamientos.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 min-h-50">
                <p>Aún no hay datos.</p>
                <p className="text-sm">Presiona el botón para comenzar el experimento.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-500">
                  Cada vez que lanzas, obtienes una <strong>realización</strong> específica <InlineMath math="x" /> de la variable aleatoria <InlineMath math="X" />.
                </p>
                
                <div className="flex flex-wrap gap-3">
                  {lanzamientos.map((val, idx) => (
                    <div key={idx} className={`
                      flex flex-col items-center p-3 rounded-lg border w-16 transition-all
                      ${idx === 0 ? 'bg-indigo-50 border-indigo-200 scale-110 shadow-md' : 'bg-slate-50 border-slate-100 opacity-70'}
                    `}>
                      <span className={`text-xl font-bold ${idx === 0 ? 'text-indigo-700' : 'text-slate-600'}`}>
                        {val}
                      </span>
                      <span className="text-[10px] text-slate-400">#{lanzamientos.length - idx}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-yellow-50 p-3 rounded text-xs text-yellow-800 mt-4">
                  <strong>Nota:</strong> El conjunto de todos estos posibles valores {`{1,2,3,4,5,6}`} se llama <em>Rango</em> o <em>Soporte</em>.
                </div>
              </div>
            )}
          </div>
        </section>

        {/* --- SECCIÓN 3: EJEMPLOS REALES (GRID DE TARJETAS) --- */}
        <section>
          <div className="flex items-center gap-3 mb-6">
             <h2 className="text-2xl font-bold text-slate-800">Tipos y Ejemplos</h2>
             <span className="h-px flex-1 bg-slate-200"></span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ejemplos.map((item, idx) => {
              const Icon = item.icon;
              const isDiscrete = item.tipo === 'Discreta';
              
              return (
                <div key={idx} className="group bg-white rounded-xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${isDiscrete ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      <Icon size={24} />
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${isDiscrete ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {item.tipo}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{item.situacion}</h3>
                  <p className="text-sm font-mono text-slate-500 mb-3 bg-slate-50 inline-block px-2 py-1 rounded">
                    {item.variable}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-slate-500 border-t border-slate-100 pt-3 mt-1">
                    <span>Valores posibles:</span>
                    <strong className="text-slate-700 font-mono">{item.valores}</strong>
                  </div>
                </div>
              )
            })}
          </div>
          
        </section>

        {/* --- SECCIÓN 4: GLOSARIO VISUAL (BENTO GRID) --- */}
        <section className="bg-slate-100 rounded-2xl p-8">
           <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">Notación Matemática Esencial</h2>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <div className="bg-white p-4 rounded-xl text-center shadow-sm">
                <div className="text-2xl font-bold text-blue-600 mb-2"><InlineMath math="X, Y" /></div>
                <div className="text-xs font-bold text-slate-400 uppercase">La Función</div>
                <p className="text-xs text-slate-600 mt-1">Letras mayúsculas representan la Variable Aleatoria.</p>
              </div>

              <div className="bg-white p-4 rounded-xl text-center shadow-sm">
                <div className="text-2xl font-bold text-emerald-600 mb-2"><InlineMath math="x, y" /></div>
                <div className="text-xs font-bold text-slate-400 uppercase">El Valor</div>
                <p className="text-xs text-slate-600 mt-1">Letras minúsculas son un resultado específico (un número).</p>
              </div>

              <div className="bg-white p-4 rounded-xl text-center shadow-sm">
                <div className="text-lg font-bold text-purple-600 mb-2 py-1"><InlineMath math="P(X=x)" /></div>
                <div className="text-xs font-bold text-slate-400 uppercase">Probabilidad Puntual</div>
                <p className="text-xs text-slate-600 mt-1">"La probabilidad de que la variable X tome el valor x".</p>
              </div>

              <div className="bg-white p-4 rounded-xl text-center shadow-sm">
                <div className="text-lg font-bold text-orange-600 mb-2 py-1"><InlineMath math="F(x)" /></div>
                <div className="text-xs font-bold text-slate-400 uppercase">Acumulada</div>
                <p className="text-xs text-slate-600 mt-1">Probabilidad de que sea menor o igual a x (CDF).</p>
              </div>

           </div>
        </section>

      </div>
    </div>
  );
}