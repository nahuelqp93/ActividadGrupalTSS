import React, { useState, useMemo } from "react";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

import { Chart } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

// --- 1. LÓGICA DE TRANSFORMADA INVERSA (Triangular) ---
// Ahora recibe 'u' desde fuera, no lo genera dentro.
function getTriangularValue(u: number, a: number, b: number, c: number): number {
  const fc = (c - a) / (b - a); // Probabilidad acumulada en el pico
  if (u <= fc) {
    return a + Math.sqrt(u * (b - a) * (c - a));
  } else {
    return b - Math.sqrt((1 - u) * (b - a) * (b - c));
  }
}

// Función de Densidad (Para la curva teórica)
function triangularPDF(x: number, a: number, b: number, c: number): number {
  if (x < a || x > b) return 0;
  if (x === c) return 2 / (b - a);
  if (x < c) return (2 * (x - a)) / ((b - a) * (c - a));
  return (2 * (b - x)) / ((b - a) * (b - c));
}

const TriangularLCG: React.FC = () => {
  // --- 2. ESTADO DEL GENERADOR CONGRUENCIAL ---
  // Parámetros por defecto (Valores clásicos de un LCG sencillo para demo)
  const [seed, setSeed] = useState(1234); // Semilla inicial (X0)
  const [paramA, setParamA] = useState(1664525); // Multiplicador (a)
  const [paramC, setParamC] = useState(1013904223); // Incremento (c)
  const [paramM, setParamM] = useState(4294967296); // Módulo (m) - 2^32

  // --- 3. ESTADO DE LA DISTRIBUCIÓN TRIANGULAR ---
  const [a, setA] = useState(0);
  const [b, setB] = useState(20);
  const [c, setC] = useState(10);
  const [n, setN] = useState(2000);
  const [samples, setSamples] = useState<number[]>([]);

  const isValid = a < c && c < b;

  // --- 4. MOTOR DE GENERACIÓN (La parte clave) ---
  const generate = () => {
    if (!isValid) return;

    const generatedData: number[] = [];
    let currentX = seed; // Comenzamos con la semilla X0

    for (let i = 0; i < n; i++) {
      // A. Generar Pseudo-aleatorio (Congruencial Mixto)
      // X_{i+1} = (a * X_i + c) % m
      currentX = (paramA * currentX + paramC) % paramM;
      
      // B. Normalizar a [0, 1)
      const u = currentX / paramM;

      // C. Transformada Inversa
      const val = getTriangularValue(u, a, b, c);
      generatedData.push(val);
    }

    setSamples(generatedData);
  };

  // --- 5. CÁLCULOS ESTADÍSTICOS Y GRÁFICOS (Igual que antes) ---
  const stats = useMemo(() => {
    if (samples.length === 0) return null;
    const meanEmp = samples.reduce((s, x) => s + x, 0) / samples.length;
    const varEmp = samples.reduce((s, x) => s + (x - meanEmp) ** 2, 0) / samples.length;
    const meanTheo = (a + b + c) / 3;
    const varTheo = (a * a + b * b + c * c - a * b - a * c - b * c) / 18;
    return { meanEmp, varEmp, meanTheo, varTheo };
  }, [samples, a, b, c]);

  const chartData = useMemo(() => {
    if (samples.length === 0) return { labels: [], datasets: [] };
    const bins = 40;
    const width = (b - a) / bins;
    
    // Histograma
    const hist = new Array(bins).fill(0);
    samples.forEach((x) => {
      const idx = Math.floor((x - a) / width);
      if (idx >= 0 && idx < bins) hist[idx]++;
    });

    const labels = hist.map((_, i) => (a + i * width + width / 2).toFixed(2));

    // Curva Teórica
    const theoreticalCurve = labels.map((label) => {
      const x = parseFloat(label);
      return triangularPDF(x, a, b, c) * n * width;
    });

    return {
      labels,
      datasets: [
        {
          type: "line" as const,
          label: "Teórico (PDF)",
          data: theoreticalCurve,
          borderColor: "rgb(220, 38, 38)", // Rojo oscuro formal
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.2,
        },
        {
          type: "bar" as const,
          label: "Simulación LCG",
          data: hist,
          backgroundColor: "rgba(30, 58, 138, 0.6)", // Azul oscuro formal
          barPercentage: 1.0,
          categoryPercentage: 1.0,
        },
      ],
    };
  }, [samples, a, b, c, n]);

  return (
    <div className="max-w-5xl mx-auto p-8 font-sans text-gray-800">
      
      {/* Título Principal */}
      <div className="border-b-2 border-gray-800 pb-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Distribucion Triangular</h1>
        <p className="text-gray-600 mt-2">
          Generación de Variables Aleatorias mediante <span className="font-semibold text-blue-900">Generador Congruencial Mixto</span> y Transformada Inversa.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* COLUMNA IZQUIERDA: PARÁMETROS */}
        <div className="space-y-8">
          
          {/* 1. Configuración del Generador (LCG) */}
          <div className="bg-gray-50 p-5 rounded border border-gray-300 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 uppercase mb-4 border-b border-gray-200 pb-2">
              1. Generador Aleatorio
            </h3>
            
            {/* Fórmula Visible */}
            <div className="mb-4 text-xs text-gray-600 bg-white p-2 border border-gray-200 rounded">
              <BlockMath math="X_{i+1} = (aX_i + c) \mod m" />
              <BlockMath math="U_i = X_i / m" />
            </div>

            <div className="space-y-3 text-sm">
               <div className="grid grid-cols-2 gap-2">
                 <div>
                    <label className="block text-gray-500 font-semibold mb-1">Semilla (<InlineMath math="X_0"/>)</label>
                    <input type="number" value={seed} onChange={e => setSeed(+e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:border-blue-900 outline-none transition" />
                 </div>
                 <div>
                    <label className="block text-gray-500 font-semibold mb-1">Módulo (<InlineMath math="m"/>)</label>
                    <input type="number" value={paramM} onChange={e => setParamM(+e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:border-blue-900 outline-none transition" />
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-2">
                 <div>
                    <label className="block text-gray-500 font-semibold mb-1">Mult (<InlineMath math="a"/>)</label>
                    <input type="number" value={paramA} onChange={e => setParamA(+e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:border-blue-900 outline-none transition" />
                 </div>
                 <div>
                    <label className="block text-gray-500 font-semibold mb-1">Inc (<InlineMath math="c"/>)</label>
                    <input type="number" value={paramC} onChange={e => setParamC(+e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:border-blue-900 outline-none transition" />
                 </div>
               </div>
            </div>
          </div>

          {/* 2. Configuración de la Variable (Triangular) */}
          <div className="bg-gray-50 p-5 rounded border border-gray-300 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 uppercase mb-4 border-b border-gray-200 pb-2">
              2. Parámetros Distribución
            </h3>
            
            <div className="mb-4 text-xs text-gray-600 bg-white p-2 border border-gray-200 rounded text-center">
               <InlineMath math="X \sim Triangular(a, c, b)" />
            </div>

            <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-gray-500 font-semibold mb-1">Rango Mínimo (<InlineMath math="a"/>)</label>
                  <input type="number" value={a} onChange={e => setA(+e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
                </div>
                <div>
                  <label className="block text-gray-500 font-semibold mb-1">Moda / Pico (<InlineMath math="c"/>)</label>
                  <input type="number" value={c} onChange={e => setC(+e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
                </div>
                <div>
                  <label className="block text-gray-500 font-semibold mb-1">Rango Máximo (<InlineMath math="b"/>)</label>
                  <input type="number" value={b} onChange={e => setB(+e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
                </div>
                <div className="pt-2 border-t border-gray-200 mt-2">
                  <label className="block text-gray-500 font-semibold mb-1">Tamaño de Muestra (<InlineMath math="n"/>)</label>
                  <input type="number" value={n} onChange={e => setN(+e.target.value)} className="w-full p-2 border border-gray-300 rounded font-bold text-gray-800" />
                </div>
            </div>

            <div className="mt-6">
                {!isValid ? (
                    <div className="p-3 bg-red-100 text-red-800 text-xs rounded border border-red-200 font-bold text-center">
                        Error: Se requiere <InlineMath math="a < c < b" />
                    </div>
                ) : (
                    <button 
                        onClick={generate} 
                        className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded shadow-md transition-all active:scale-95 text-sm uppercase tracking-wide"
                    >
                        Generar Simulación
                    </button>
                )}
            </div>
          </div>

        </div>

        {/* COLUMNA DERECHA: RESULTADOS */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Gráfico */}
          <div className="grow bg-white p-4 rounded border border-gray-300 shadow-sm min-h-100">
             {samples.length > 0 ? (
                 <Chart type='bar' data={chartData} options={{ maintainAspectRatio: false, responsive: true }} />
             ) : (
                 <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded">
                    <p className="text-lg font-medium">Esperando datos...</p>
                    <p className="text-sm">Configure los parámetros y presione Generar</p>
                 </div>
             )}
          </div>

          {/* Tabla de Estadísticos */}
          {samples.length > 0 && (
              <div className="bg-white rounded border border-gray-300 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-xs tracking-wider">
                    <tr>
                      <th className="px-6 py-3 border-b border-gray-200">Indicador</th>
                      <th className="px-6 py-3 border-b border-gray-200">Teórico (Exacto)</th>
                      <th className="px-6 py-3 border-b border-gray-200">Simulado (LCG)</th>
                      <th className="px-6 py-3 border-b border-gray-200 text-right">Desviación Absoluta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">Media (<InlineMath math="\mu" />)</td>
                      <td className="px-6 py-4 text-gray-500">{stats?.meanTheo.toFixed(4)}</td>
                      <td className="px-6 py-4 text-blue-800 font-bold">{stats?.meanEmp.toFixed(4)}</td>
                      <td className="px-6 py-4 text-right text-gray-500 font-mono">
                        {Math.abs((stats!.meanEmp - stats!.meanTheo)).toFixed(5)}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">Varianza (<InlineMath math="\sigma^2" />)</td>
                      <td className="px-6 py-4 text-gray-500">{stats?.varTheo.toFixed(4)}</td>
                      <td className="px-6 py-4 text-blue-800 font-bold">{stats?.varEmp.toFixed(4)}</td>
                      <td className="px-6 py-4 text-right text-gray-500 font-mono">
                         {Math.abs((stats!.varEmp - stats!.varTheo)).toFixed(5)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TriangularLCG;