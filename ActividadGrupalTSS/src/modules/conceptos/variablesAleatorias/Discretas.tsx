import { useState, useMemo } from 'react';
import { 
  Coins, 
  BarChart3, 
  Calculator, 
  Factory, 
  Phone, 
  ArrowDownCircle,
  Sigma,
  CheckCircle2,
  RefreshCcw
} from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { BotonVolver } from './components/BotonVolver';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function VariablesDiscretas() {
  const [numMonedas, setNumMonedas] = useState(4); // Empezamos con 4 para ver mejor la curva
  const [simulaciones, setSimulaciones] = useState<number[]>([]);
  const [totalLanzamientos, setTotalLanzamientos] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // --- LÓGICA MATEMÁTICA ---

  // 1. Calcular Binomial (Teoría)
  const calcularBinomial = (n: number, k: number, p: number) => {
    const combinatorio = (n: number, k: number): number => {
      if (k < 0 || k > n) return 0;
      if (k === 0 || k === n) return 1;
      if (k > n / 2) k = n - k;
      let res = 1;
      for (let i = 1; i <= k; i++) res = res * (n - i + 1) / i;
      return res;
    };
    return combinatorio(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
  };

  const probTeoricas = useMemo(() => 
    Array(numMonedas + 1).fill(0).map((_, k) => calcularBinomial(numMonedas, k, 0.5)),
  [numMonedas]);

  // 2. Simulación (Práctica)
  const simularLote = () => {
    setIsAnimating(true);
    setTimeout(() => {
      const nuevosResultados: number[] = [];
      const N_SIMS = 500; // Simulamos por lotes para ver la evolución
      
      for (let i = 0; i < N_SIMS; i++) {
        let caras = 0;
        for (let j = 0; j < numMonedas; j++) {
          if (Math.random() < 0.5) caras++;
        }
        nuevosResultados.push(caras);
      }
      
      setSimulaciones(prev => [...prev, ...nuevosResultados]);
      setTotalLanzamientos(prev => prev + N_SIMS);
      setIsAnimating(false);
    }, 500);
  };

  const resetear = () => {
    setSimulaciones([]);
    setTotalLanzamientos(0);
  };

  // 3. Procesar datos para la Gráfica
  const probEmpiricas = useMemo(() => {
    if (totalLanzamientos === 0) return Array(numMonedas + 1).fill(0);
    const conteos = Array(numMonedas + 1).fill(0);
    simulaciones.forEach(x => conteos[x]++);
    return conteos.map(c => c / totalLanzamientos);
  }, [simulaciones, totalLanzamientos, numMonedas]);

  const chartData = {
    labels: Array(numMonedas + 1).fill(0).map((_, i) => i.toString()),
    datasets: [
      {
        label: 'Teoría (Ideal)',
        data: probTeoricas,
        backgroundColor: 'rgba(99, 102, 241, 0.2)', // Indigo suave
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Realidad (Empírica)',
        data: probEmpiricas,
        backgroundColor: 'rgba(16, 185, 129, 0.6)', // Emerald fuerte
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 0,
        borderRadius: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${(context.raw * 100).toFixed(1)}%`
        }
      }
    },
    scales: {
      y: { 
        beginAtZero: true, 
        title: { display: true, text: 'Probabilidad' },
        grid: { color: '#f1f5f9' }
      },
      x: { 
        title: { display: true, text: 'Número de Caras (k)' },
        grid: { display: false }
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">

<div className="print:hidden"> 
           <BotonVolver />
        </div>
      <div className="max-w-6xl mx-auto space-y-10">

        {/* --- HEADER --- */}
        <header className="text-center space-y-4 py-6">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full text-indigo-700 mb-2">
            <BarChart3 size={32} />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Variables Aleatorias Discretas
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            El mundo de los "saltos". Analizamos eventos que podemos contar uno a uno, como monedas, personas o defectos.
          </p>
        </header>

        {/* --- SECCIÓN 1: DEFINICIÓN VISUAL --- */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-indigo-900 p-6 text-white flex items-center gap-3">
            <Sigma className="text-yellow-400" />
            <h2 className="text-xl font-bold">Concepto Fundamental</h2>
          </div>
          
          <div className="p-8 grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-slate-800">Lo contable vs. Lo medible</h3>
              <p className="text-slate-600 leading-relaxed">
                Una variable es <strong>discreta</strong> cuando sus valores posibles son puntos aislados. Imagina una escalera: puedes estar en el escalón 1 o en el 2, pero no en el 1.5.
              </p>
              
              <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500 mt-4">
                <p className="font-bold text-indigo-900 mb-1">Función de Masa (PMF)</p>
                <p className="text-sm text-indigo-800 mb-2">
                  Es la regla que asigna a cada valor <InlineMath math="x" /> su "peso" en probabilidad.
                </p>
                <div className="bg-white p-2 rounded border border-indigo-100 text-center">
                   <BlockMath math="p(x) = P(X = x)" />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
               <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Propiedades Clave</h4>
               <ul className="space-y-4">
                  <li className="flex gap-3 items-start">
                    <div className="mt-1 bg-green-100 text-green-700 rounded-full p-1"><CheckCircle2 size={16}/></div>
                    <div>
                      <p className="font-bold text-slate-700">Valores Enumerables</p>
                      <p className="text-sm text-slate-500">Conjunto finito o infinito contable {`{0, 1, 2, ...}`}.</p>
                    </div>
                  </li>
                  <li className="flex gap-3 items-start">
                    <div className="mt-1 bg-green-100 text-green-700 rounded-full p-1"><CheckCircle2 size={16}/></div>
                    <div>
                      <p className="font-bold text-slate-700">Suma Unitaria</p>
                      <p className="text-sm text-slate-500">La suma de todas las probabilidades es exactamente 1.</p>
                      <InlineMath math="\sum p(x) = 1" />
                    </div>
                  </li>
               </ul>
            </div>
          </div>
        </section>

        {/* --- SECCIÓN 2: LABORATORIO INTERACTIVO --- */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Calculator className="text-indigo-600"/>
              Laboratorio: Binomial (Monedas)
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* PANEL DE CONTROL */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Configuración del Experimento
                </label>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Número de monedas (n)</span>
                      <span className="font-bold text-indigo-600">{numMonedas}</span>
                    </div>
                    <input 
                      type="range" min="1" max="15" 
                      value={numMonedas} 
                      onChange={(e) => {
                        setNumMonedas(Number(e.target.value));
                        resetear();
                      }}
                      className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                  
                  {/* Visualización de monedas */}
                  <div className="flex flex-wrap gap-1 py-2 justify-center bg-slate-50 rounded-lg min-h-15 items-center">
                    {Array(numMonedas).fill(0).map((_, i) => (
                      <Coins key={i} size={20} className="text-yellow-500 drop-shadow-sm" />
                    ))}
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={simularLote}
                      disabled={isAnimating}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 flex justify-center gap-2"
                    >
                      {isAnimating ? <RefreshCcw className="animate-spin"/> : <ArrowDownCircle />}
                      Simular (+500)
                    </button>
                    
                    {totalLanzamientos > 0 && (
                      <button 
                        onClick={resetear}
                        className="px-4 py-3 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                      >
                        <RefreshCcw size={20} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Rápidos */}
              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">Total Simulaciones</p>
                <p className="text-4xl font-black text-emerald-600">{totalLanzamientos.toLocaleString()}</p>
                <p className="text-xs text-emerald-700 mt-2 leading-tight">
                  Cuantos más lances, más se parecerá la barra verde (realidad) a la línea azul (teoría).
                </p>
              </div>
            </div>

            {/* GRÁFICA */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 min-h-100">
               
               <div className="h-full w-full">
                 <Bar data={chartData} options={chartOptions as any} />
               </div>
            </div>

          </div>
        </section>

        {/* --- SECCIÓN 3: EJEMPLOS REALES --- */}
        <section>
          <div className="flex items-center gap-3 mb-6">
             <h2 className="text-2xl font-bold text-slate-800">Ejemplos del Mundo Real</h2>
             <span className="h-px flex-1 bg-slate-200"></span>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
             <div className="group bg-white p-6 rounded-xl border border-slate-200 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Factory size={24} />
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">Control de Calidad</h3>
                <p className="text-slate-500 text-sm mb-3">
                  Número de piezas defectuosas en un lote de 100 productos.
                </p>
                <div className="text-xs font-mono bg-slate-50 p-2 rounded text-slate-600">
                  X ∈ {`{0, 1, 2, ..., 100}`}
                </div>
             </div>

             <div className="group bg-white p-6 rounded-xl border border-slate-200 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Phone size={24} />
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">Call Center</h3>
                <p className="text-slate-500 text-sm mb-3">
                  Número de llamadas recibidas en una hora específica.
                </p>
                <div className="text-xs font-mono bg-slate-50 p-2 rounded text-slate-600">
                  X ∈ {`{0, 1, 2, 3, ...}`}
                </div>
             </div>

             <div className="group bg-white p-6 rounded-xl border border-slate-200 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  <Coins size={24} />
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">Juegos de Azar</h3>
                <p className="text-slate-500 text-sm mb-3">
                  Número de veces que sale "Cara" al lanzar 5 monedas.
                </p>
                <div className="text-xs font-mono bg-slate-50 p-2 rounded text-slate-600">
                   X ∼ Binomial(n=5, p=0.5)
                </div>
             </div>
          </div>
        </section>

        {/* --- SECCIÓN 4: CÁLCULOS (BENTO GRID) --- */}
        <section className="bg-slate-100 rounded-3xl p-8">
           <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">¿Qué preguntas podemos responder?</h2>
           <div className="grid md:grid-cols-3 gap-4">
              
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <div className="text-xs font-bold text-indigo-500 uppercase mb-2">Puntual</div>
                <div className="mb-2"><BlockMath math="P(X = 3)" /></div>
                <p className="text-sm text-slate-600">¿Cuál es la probabilidad de obtener <strong>exactamente</strong> 3 caras?</p>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <div className="text-xs font-bold text-emerald-500 uppercase mb-2">Acumulada</div>
                <div className="mb-2"><BlockMath math="P(X \leq 2)" /></div>
                <p className="text-sm text-slate-600">¿Probabilidad de obtener <strong>como máximo</strong> 2 caras?</p>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <div className="text-xs font-bold text-purple-500 uppercase mb-2">Intervalo</div>
                <div className="mb-2"><BlockMath math="P(2 \leq X \leq 4)" /></div>
                <p className="text-sm text-slate-600">¿Probabilidad de estar <strong>entre</strong> 2 y 4 caras?</p>
              </div>

           </div>
        </section>

      </div>
    </div>
  );
}