import React, { useState, useMemo } from "react";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Simulamos el hook useLCG aquí para que el código sea funcional completo
// En tu proyecto real, impórtalo de donde lo tengas: import { useLCG } from "../../core/random/useLCG";
const useLCG = (initialParams: any) => {
    const [seed, setSeed] = useState(initialParams.seed);
    // Un LCG simple interno para este ejemplo
    let state = seed;
    const a = 1664525;
    const c = 1013904223;
    const m = 2 ** 32;

    const next = () => {
        state = (a * state + c) % m;
        return state / m;
    };

    const reseed = (newSeed: number) => {
        state = newSeed;
        setSeed(newSeed);
    };

    return { next, reseed };
};

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Algoritmo de Knuth para Poisson
// Nota: Devuelve el último U usado para referencia en la tabla
function poissonSample(lambda: number, nextU: () => number): { lastU: number; x: number, uCount: number } {
  const L = Math.exp(-lambda);
  let p = 1.0;
  let k = 0;
  let u = 0;

  do {
    k++;
    u = nextU(); // Solicitamos un nuevo aleatorio al GCM
    p *= u;      // Multiplicamos
  } while (p > L);

  return { lastU: u, x: k - 1, uCount: k };
}

const PoissonLCG: React.FC = () => {
  const [lambda, setLambda] = useState(4);
  const [n, setN] = useState(1000);
  const [samples, setSamples] = useState<number[]>([]);
  // Guardamos datos extra para la tabla (X generado, último U usado, cuántos U se usaron)
  const [rawData, setRawData] = useState<{ lastU: number; x: number; uCount: number }[]>([]);

  const rng = useLCG({ seed: 1234 });

  const generate = () => {
    rng.reseed(1234); // Reiniciar semilla para reproducibilidad

    const data: { lastU: number; x: number; uCount: number }[] = [];
    for (let i = 0; i < n; i++) {
      data.push(poissonSample(lambda, rng.next));
    }

    setRawData(data);
    setSamples(data.map(d => d.x));
  };

  const stats = useMemo(() => {
    if (samples.length === 0) return null;
    const meanEmp = samples.reduce((s, x) => s + x, 0) / samples.length;
    return { meanEmp };
  }, [samples]);

  const chartData = useMemo(() => {
    if (samples.length === 0) return { labels: [], datasets: [] };
    const maxVal = Math.max(...samples);
    const counts = new Array(maxVal + 1).fill(0);
    samples.forEach(x => counts[x]++);

    return {
      labels: counts.map((_, i) => i.toString()),
      datasets: [
        {
          label: "Frecuencia simulada",
          data: counts,
          backgroundColor: "rgba(30, 58, 138, 0.7)", // Azul oscuro
        }
      ]
    };
  }, [samples]);

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8 font-sans text-gray-800">

      {/* 1. ENCABEZADO Y TEORÍA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-gray-200 pb-8">
        <div>
          <h1 className="text-3xl font-bold mb-4 text-blue-900">Distribución de Poisson</h1>
          <p className="text-gray-600 mb-4">
            Simulación de eventos discretos usando el <b>Algoritmo de Multiplicación (Knuth)</b> alimentado por un <b>Generador Congruencial Mixto (GCM)</b>.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
             <h3 className="font-bold text-blue-900 text-sm uppercase mb-2">1. El Generador (GCM)</h3>
             <p className="text-xs text-gray-600 mb-2">Produce la materia prima (<InlineMath math="U_i"/>) usando aritmética modular.</p>
             <div className="text-xs bg-white p-2 rounded border border-blue-200">
                <BlockMath math="X_{i+1} = (aX_i + c) \mod m" />
                <BlockMath math="U_i = X_i / m" />
             </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
            <h3 className="font-bold text-yellow-900 text-sm uppercase mb-2">2. El Algoritmo de Poisson</h3>
            <p className="text-xs text-gray-600 mb-2">Transforma los <InlineMath math="U_i"/> en eventos <InlineMath math="k"/> multiplicándolos hasta cruzar el umbral <InlineMath math="e^{-\lambda}"/>.</p>
            <div className="text-xs bg-white p-2 rounded border border-yellow-200 overflow-x-auto">
               <p className="font-mono mb-1">1. Sea <InlineMath math="L = e^{-\lambda}, p=1, k=0"/></p>
               <p className="font-mono mb-1">2. Repetir:</p>
               <p className="font-mono pl-4 mb-1">a. Obtener <InlineMath math="U" /> del GCM</p>
               <p className="font-mono pl-4 mb-1">b. <InlineMath math="p = p * U" /></p>
               <p className="font-mono pl-4 mb-1">c. <InlineMath math="k = k + 1" /></p>
               <p className="font-mono mb-1">3. Hasta que <InlineMath math="p \le L" /></p>
               <p className="font-mono">4. Retornar <InlineMath math="X = k - 1" /></p>
            </div>
        </div>
      </div>

      {/* 2. CONTROLES DE SIMULACIÓN */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm flex flex-wrap items-end gap-6">
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Media de llegadas (<InlineMath math="\lambda"/>)</label>
            <input
                type="number"
                value={lambda}
                onChange={e => setLambda(+e.target.value)}
                className="p-2 border border-gray-300 rounded w-32 focus:border-blue-500 outline-none"
            />
        </div>

        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Muestras (n)</label>
            <input
                type="number"
                value={n}
                onChange={e => setN(+e.target.value)}
                className="p-2 border border-gray-300 rounded w-32 focus:border-blue-500 outline-none"
            />
        </div>

        <button
          onClick={generate}
          className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-2 rounded shadow-md font-bold transition-transform active:scale-95"
        >
          EJECUTAR SIMULACIÓN
        </button>
      </div>

      {/* 3. RESULTADOS Y GRÁFICO */}
      {samples.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Gráfico */}
            <div className="lg:col-span-2 space-y-4">
                <div className="bg-white p-4 border border-gray-200 rounded shadow-sm">
                    <h3 className="text-center font-bold text-gray-700 mb-2">Histograma de Frecuencias</h3>
                    <div className="h-72">
                        <Bar data={chartData} options={{ maintainAspectRatio: false, responsive: true }} />
                    </div>
                </div>
                
                {/* Comparación Estadística */}
                <div className="flex justify-between bg-blue-50 p-4 rounded border border-blue-100 text-sm">
                    <div>
                        <span className="block text-gray-500">Media Teórica</span>
                        <span className="text-xl font-bold text-gray-900">{lambda.toFixed(4)}</span>
                    </div>
                    <div>
                        <span className="block text-gray-500">Media Simulada</span>
                        <span className="text-xl font-bold text-blue-700">{stats?.meanEmp.toFixed(4)}</span>
                    </div>
                    <div className="text-right">
                        <span className="block text-gray-500">Error</span>
                        <span className="text-xl font-mono text-gray-600">{Math.abs(lambda - (stats?.meanEmp || 0)).toFixed(4)}</span>
                    </div>
                </div>
            </div>

            {/* Tabla de Datos */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded border border-gray-300 shadow-sm overflow-hidden flex flex-col h-full max-h-125">
                    <h3 className="px-4 py-3 bg-gray-100 font-bold text-xs uppercase tracking-wider border-b border-gray-200">
                    Muestra de Datos ({Math.min(20, n)})
                    </h3>
                    <div className="overflow-y-auto flex-1">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-gray-50 text-gray-500 font-semibold sticky top-0">
                                <tr>
                                <th className="px-3 py-2 border-b">#</th>
                                <th className="px-3 py-2 border-b text-center">X Generado</th>
                                <th className="px-3 py-2 border-b text-right">Iteraciones (Usados)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {rawData.slice(0, 20).map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                                    <td className="px-3 py-2 text-center font-bold text-blue-800 text-sm">{row.x}</td>
                                    <td className="px-3 py-2 text-right font-mono text-gray-400">
                                        {row.uCount} <span className="text-[10px]">Nums</span>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-2 bg-gray-50 border-t border-gray-200 text-[10px] text-gray-500 text-center">
                        * "Iteraciones" indica cuántos números aleatorios <InlineMath math="U_i"/> se consumieron para generar ese único valor <InlineMath math="X"/>.
                    </div>
                </div>
            </div>

        </div>
      )}
    </div>
  );
};

export default PoissonLCG;