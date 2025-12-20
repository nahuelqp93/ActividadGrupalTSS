import React, { useState, useMemo } from "react";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BernoullyDistribution: React.FC = () => {
  // Parámetros
  const [p, setP] = useState(0.6); // Probabilidad de éxito
  const [n, setN] = useState(100); // Número de simulaciones
  
  // Resultados
  const [samples, setSamples] = useState<{ u: number; x: number }[]>([]);

  // Parámetros del Generador Congruencial (GCM)
  // Usamos valores fijos estándar para este ejemplo
  const seed = 1234;
  const a = 1664525;
  const c = 1013904223;
  const m = 2 ** 32;

  const generate = () => {
    let currentX = seed;
    const newSamples: { u: number; x: number }[] = [];

    for (let i = 0; i < n; i++) {
      // 1. Generar Pseudo-aleatorio (Fórmula GCM)
      currentX = (a * currentX + c) % m;
      const u = currentX / m;

      // 2. Transformada Bernoulli
      // Si u <= p entonces es Éxito (1), sino Fracaso (0)
      const x = u <= p ? 1 : 0;

      newSamples.push({ u, x });
    }

    setSamples(newSamples);
  };

  // Datos para el Gráfico
  const chartData = useMemo(() => {
    const successes = samples.filter((s) => s.x === 1).length;
    const failures = samples.length - successes;

    return {
      labels: ["Fracaso (0)", "Éxito (1)"],
      datasets: [
        {
          label: "Frecuencia",
          data: [failures, successes],
          backgroundColor: ["rgba(239, 68, 68, 0.6)", "rgba(34, 197, 94, 0.6)"], // Rojo suave y Verde suave
          borderWidth: 1,
        },
      ],
    };
  }, [samples]);

  // Estadísticas
  const stats = useMemo(() => {
    if (samples.length === 0) return null;
    const totalSuccess = samples.filter((s) => s.x === 1).length;
    const probEmpirica = totalSuccess / samples.length;
    return { probEmpirica };
  }, [samples]);

  return (
    <div className="max-w-4xl mx-auto p-8 font-sans text-gray-800">
      
      {/* Título */}
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Distribución Bernoulli</h1>
        <p className="text-gray-600 mt-2">Simulación de eventos binarios (Éxito/Fracaso).</p>
      </div>

       <BlockMath math="P(X=x)=p^x(1-p)^{1-x}, \quad x \in \{0,1\}" />
      {/* SECCIÓN DE FÓRMULAS (Simple y Limpia) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* 1. Fórmula del Generador */}
        <div className="bg-white p-4 border border-gray-300 rounded shadow-sm">
            <h3 className="font-bold text-gray-700 mb-2 border-b pb-1">Generador (GCM)</h3>
            <div className="text-sm text-gray-800">
                <BlockMath math="X_{i+1} = (aX_i + c) \mod m" />
                <BlockMath math="U_i = \frac{X_i}{m}" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
                Donde <InlineMath math="U_i \sim Uniforme(0, 1)" />
            </p>
        </div>

        {/* 2. Fórmula de Bernoulli */}
        <div className="bg-white p-4 border border-gray-300 rounded shadow-sm">
            <h3 className="font-bold text-gray-700 mb-2 border-b pb-1">Transformada Bernoulli</h3>
            <div className="text-sm text-gray-800">
                <BlockMath math="X_i = \begin{cases} 1 & \text{si } U_i \le p \\ 0 & \text{si } U_i > p \end{cases}" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
                <InlineMath math="1 = \text{Éxito}" />, <InlineMath math="0 = \text{Fracaso}" />
            </p>
        </div>
      </div>

      {/* CONTROLES */}
      <div className="bg-gray-50 p-6 rounded border border-gray-200 mb-8 flex items-end gap-6">
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Probabilidad Éxito (p)</label>
            <input 
                type="number" 
                step="0.01" max="1" min="0"
                value={p} 
                onChange={(e) => setP(Number(e.target.value))}
                className="p-2 border border-gray-300 rounded w-32"
            />
        </div>
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Muestras (n)</label>
            <input 
                type="number" 
                value={n} 
                onChange={(e) => setN(Number(e.target.value))}
                className="p-2 border border-gray-300 rounded w-32"
            />
        </div>
        <button 
            onClick={generate}
            className="bg-slate-800 text-white px-6 py-2 rounded font-bold hover:bg-slate-700 transition"
        >
            Simular
        </button>
      </div>

      {/* RESULTADOS */}
      {samples.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Gráfico */}
            <div className="h-64 bg-white p-2 border rounded">
                <Bar data={chartData} options={{ maintainAspectRatio: false }} />
            </div>

            {/* Datos y Tabla */}
            <div className="flex flex-col gap-4">
                <div className="bg-blue-50 p-4 rounded border border-blue-100 text-sm">
                    <p><strong>Probabilidad Teórica (p):</strong> {p}</p>
                    <p><strong>Probabilidad Obtenida:</strong> {stats?.probEmpirica.toFixed(4)}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        Diferencia: {Math.abs(p - (stats?.probEmpirica || 0)).toFixed(4)}
                    </p>
                </div>

                {/* Tabla Miniatura */}
                <div className="border rounded overflow-hidden flex-1 flex flex-col">
                    <div className="bg-gray-100 px-3 py-2 font-bold text-xs uppercase border-b">Primeras 5 Simulaciones</div>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-1">i</th>
                                <th className="px-3 py-1">Aleatorio (U)</th>
                                <th className="px-3 py-1">Resultado (X)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {samples.slice(0, 5).map((s, i) => (
                                <tr key={i} className="border-b last:border-0">
                                    <td className="px-3 py-1">{i+1}</td>
                                    <td className="px-3 py-1 font-mono text-xs">{s.u.toFixed(5)}</td>
                                    <td className="px-3 py-1 font-bold">
                                        {s.x === 1 ? <span className="text-green-600">1 (Éxito)</span> : <span className="text-red-600">0 (Fracaso)</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default BernoullyDistribution;