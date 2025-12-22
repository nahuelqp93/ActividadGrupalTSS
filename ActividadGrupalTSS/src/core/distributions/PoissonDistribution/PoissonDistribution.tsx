import React, { useState, useMemo } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { useLCG } from '../../random/useLCG';
import { DistributionChart } from '../utils/DistributionChart';
import { ExplicacionPoisson } from './InteractivePoisson';


interface PoissonRow {
  x: number;
  iterations: number; // Cuántos números aleatorios se usaron para generar este X
}

// Algoritmo de Multiplicación de Knuth para Poisson
function poissonSample(lambda: number, nextU: () => number): PoissonRow {
  const L = Math.exp(-lambda);
  let p = 1.0;
  let k = 0;
  
  // Multiplicamos números aleatorios hasta que el producto sea menor a e^-lambda
  do {
    k++;
    p *= nextU();
  } while (p > L && k < 1000); // Guardrail de seguridad para loops infinitos

  return { x: k - 1, iterations: k };
}

// Función de Probabilidad de Masa (PMF)
function poissonPMF(k: number, lambda: number): number {
  if (k < 0 || !Number.isInteger(k)) return 0;
  // Factorial simplificado para visualización
  const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));
  return (Math.exp(-lambda) * Math.pow(lambda, k)) / factorial(k);
}

const PoissonSimulation: React.FC = () => {
  // Estado
  const [lambda, setLambda] = useState(4);
  const [n, setN] = useState(1000);
  
  const [samples, setSamples] = useState<number[]>([]);
  const [rawData, setRawData] = useState<PoissonRow[]>([]);

  // Instancia del generador
  const rng = useLCG({
    seed: 1234,
    a: 1664525,
    c: 1013904223,
    m: 2 ** 32
  });

  const isValid = lambda > 0;

  const handleSimulate = () => {
    if (!isValid) return;
    rng.reseed(Date.now());

    const newRawData: PoissonRow[] = [];
    const newSamples: number[] = [];

    for (let i = 0; i < n; i++) {
      const sample = poissonSample(lambda, rng.next);
      newRawData.push(sample);
      newSamples.push(sample.x);
    }

    setRawData(newRawData);
    setSamples(newSamples);
  };

  // Cálculo de estadísticas
  const stats = useMemo(() => {
    if (samples.length === 0) return null;
    
    // Empíricos
    const meanEmp = samples.reduce((s, x) => s + x, 0) / samples.length;
    const varEmp = samples.reduce((s, x) => s + (x - meanEmp) ** 2, 0) / samples.length;
    
    // Teóricos (En Poisson, media = varianza = lambda)
    const meanTheo = lambda;
    const varTheo = lambda;

    return { meanEmp, varEmp, meanTheo, varTheo };
  }, [samples, lambda]);

  // Preparación de datos para el gráfico
  const chartData = useMemo(() => {
    if (samples.length === 0) return { labels: [], theoretical: [], empirical: [] };

    const maxVal = Math.max(...samples, lambda * 2); // Asegurar rango visual
    // Crear array de contadores para valores discretos 0, 1, 2... maxVal
    const counts = new Array(maxVal + 1).fill(0);
    samples.forEach(x => {
        if (x <= maxVal) counts[x]++;
    });

    const labels = counts.map((_, i) => i.toString());
    
    // Teórico: PMF * n
    const theoretical = labels.map((_, k) => poissonPMF(k, lambda) * n);

    return { labels, theoretical, empirical: counts };
  }, [samples, lambda, n]);

  return (
    <div className="max-w-6xl mx-auto p-8 font-sans text-gray-800">
      
      {/* Encabezado */}
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Distribución de Poisson</h1>
        <p className="text-sm text-gray-500 mt-1">
          Simulación de eventos discretos por unidad de tiempo mediante el algoritmo de Knuth.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: Contexto Matemático y Controles */}
        <div className="lg:col-span-1 space-y-6">
          <div className="lg:col-span-1 space-y-6">
           {/* ... Tus controles existentes ... */}
           
           {/* AGREGAR AQUÍ LA EXPLICACIÓN */}
           <ExplicacionPoisson /> 
        </div>
          
          {/* TARJETA DE CONTEXTO TEÓRICO */}
          <div className="bg-gray-50 p-5 rounded border border-gray-200 text-sm shadow-sm">
            <h3 className="text-xs font-bold uppercase text-gray-700 mb-3 tracking-wider border-b border-gray-200 pb-2">
              Algoritmo de Multiplicación
            </h3>
            
            <div className="space-y-5 text-gray-600">
              <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="flex items-center justify-center w-5 h-5 bg-gray-200 rounded-full text-[10px] font-bold text-gray-700">1</span>
                    <p className="font-semibold text-gray-800">Condición de Parada</p>
                </div>
                <p className="text-[10px] mb-2 leading-relaxed ml-7">
                  Se buscan números uniformes cuyo producto acumulado sea menor al umbral.
                </p>
                <div className="bg-white p-2 border border-gray-200 rounded overflow-x-auto ml-2">
                   <BlockMath math={`L = e^{-\\lambda}`} />
                   <BlockMath math={`\\prod_{i=0}^{k} U_i < L`} />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="flex items-center justify-center w-5 h-5 bg-gray-200 rounded-full text-[10px] font-bold text-gray-700">2</span>
                    <p className="font-semibold text-gray-800">Variable Aleatoria</p>
                </div>
                <div className="bg-white p-2 border border-gray-200 rounded overflow-x-auto ml-2 mt-1">
                  <InlineMath math="X = k - 1" />
                </div>
                <p className="text-[10px] mt-2 ml-2">
                    Donde <InlineMath math="k" /> es la cantidad de números aleatorios requeridos para romper el umbral.
                </p>
              </div>
            </div>
          </div>

          {/* TARJETA DE PARÁMETROS */}
          <div className="bg-white p-5 rounded border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase text-gray-500 mb-4 tracking-wider">
              Configuración
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                  Lambda (<InlineMath math="\lambda" />)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={lambda}
                  onChange={(e) => setLambda(+e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:border-gray-900 focus:ring-0 outline-none transition"
                  placeholder="Ej. 4"
                />
                <p className="text-[10px] text-gray-400 mt-1">Promedio de eventos esperados.</p>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                  Iteraciones (n)
                </label>
                <input
                  type="number"
                  value={n}
                  onChange={(e) => setN(+e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:border-gray-900 focus:ring-0 outline-none transition"
                />
              </div>

              {!isValid && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">
                  Error: Lambda debe ser mayor que 0.
                </div>
              )}

              <button
                onClick={handleSimulate}
                disabled={!isValid}
                className="w-full bg-gray-900 hover:bg-black text-white text-xs uppercase font-bold py-3 px-4 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 tracking-wide"
              >
                Generar Simulación
              </button>
            </div>
          </div>

          {/* ESTADÍSTICAS (KPIs) */}
          {stats && (
            <div className="bg-white p-5 rounded border border-gray-200 shadow-sm">
              <h3 className="text-xs font-bold uppercase text-gray-500 mb-4 tracking-wider border-b border-gray-100 pb-2">
                Resultados (KPIs)
              </h3>
              
              <div className="space-y-4 text-sm">
                
                {/* Media */}
                <div className="flex justify-between items-start group">
                  <div className="flex flex-col">
                    <span className="text-gray-700 font-semibold text-xs uppercase">Media Teórica</span>
                    <div className="text-gray-400 mt-1 origin-left transform scale-90">
                      <InlineMath math="\mu = \lambda" />
                    </div>
                  </div>
                  <span className="font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                    {stats.meanTheo.toFixed(4)}
                  </span>
                </div>

                <div className="flex justify-between items-center border-t border-dashed border-gray-200 pt-2">
                  <span className="text-gray-600 text-xs">Simulada (<InlineMath math="\bar{x}" />):</span>
                  <span className="font-mono font-bold text-gray-900">{stats.meanEmp.toFixed(4)}</span>
                </div>

                <div className="border-t border-gray-100 my-2"></div>

                {/* Varianza */}
                <div className="flex justify-between items-start group">
                  <div className="flex flex-col">
                    <span className="text-gray-700 font-semibold text-xs uppercase">Varianza Teórica</span>
                    <div className="text-gray-400 mt-1 origin-left transform scale-90">
                      <InlineMath math="\sigma^2 = \lambda" />
                    </div>
                  </div>
                  <span className="font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                    {stats.varTheo.toFixed(4)}
                  </span>
                </div>

                <div className="flex justify-between items-center border-t border-dashed border-gray-200 pt-2">
                  <span className="text-gray-600 text-xs">Simulada (<InlineMath math="S^2" />):</span>
                  <span className="font-mono font-bold text-gray-900">{stats.varEmp.toFixed(4)}</span>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: Gráficos y Tabla */}
        <div className="lg:col-span-2 space-y-6">
          {samples.length > 0 ? (
            <>
              <DistributionChart 
                labels={chartData.labels}
                theoreticalData={chartData.theoretical}
                empiricalData={chartData.empirical}
       
              />
              
              {/* Tabla personalizada para mostrar "Iteraciones" extra */}
              <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
                <h3 className="px-6 py-3 bg-gray-50 font-bold text-xs uppercase text-gray-500 border-b border-gray-200 tracking-wider">
                    Datos Generados
                </h3>
                <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-6 py-3">i</th>
                                <th className="px-6 py-3 text-center">Valor Generado (X)</th>
                                <th className="px-6 py-3 text-right">Nums. Aleatorios Usados</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rawData.slice(0, 100).map((row, i) => (
                                <tr key={i} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-3 font-medium text-gray-900">{i + 1}</td>
                                    <td className="px-6 py-3 text-center font-mono font-bold text-blue-600">
                                        {row.x}
                                    </td>
                                    <td className="px-6 py-3 text-right font-mono text-gray-500">
                                        {row.iterations}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="px-6 py-2 text-[10px] text-gray-400 bg-gray-50 border-t border-gray-200">
                    Mostrando los primeros 100 registros. La columna "Nums. Aleatorios Usados" indica cuántas iteraciones del generador LCG fueron necesarias para producir ese valor X.
                </p>
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-400 text-sm">
              Ingrese parámetros (λ, n) y ejecute la simulación.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PoissonSimulation;