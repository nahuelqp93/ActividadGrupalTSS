import React, { useState, useMemo } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { useLCG } from '../../random/useLCG';
import { DistributionChart } from '../utils/DistributionChart'; // Reutilizamos tu componente gráfico
import { SimulationTable } from '../utils/SimulationTable';   // Reutilizamos tu tabla

interface ExponentialRow {
  u: number;
  x: number;
}

// Lógica de transformación inversa para Exponencial
function exponentialSample(lambda: number, nextU: () => number): ExponentialRow {
  const u = nextU();
  // Fórmula: X = -ln(1-u) / lambda
  const x = -Math.log(1 - u) / lambda;
  return { u, x };
}

const ExponentialSimulation: React.FC = () => {
  // Estado
  const [lambda, setLambda] = useState(1); // Tasa (ej. llegadas por hora)
  const [n, setN] = useState(1000);
  
  const [samples, setSamples] = useState<number[]>([]);
  const [rawData, setRawData] = useState<ExponentialRow[]>([]);

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

    const newRawData: ExponentialRow[] = [];
    const newSamples: number[] = [];

    for (let i = 0; i < n; i++) {
      const sample = exponentialSample(lambda, rng.next);
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
    
    // Teóricos
    const meanTheo = 1 / lambda;
    const varTheo = 1 / (lambda * lambda);

    return { meanEmp, varEmp, meanTheo, varTheo };
  }, [samples, lambda]);

  // Preparación de datos para el gráfico
  const chartData = useMemo(() => {
    if (samples.length === 0) return { labels: [], theoretical: [], empirical: [] };

    const maxVal = Math.max(...samples);
    const bins = 30;
    const width = maxVal / bins; // Ancho de clase dinámico según los datos
    const hist = new Array(bins).fill(0);

    samples.forEach(x => {
      const idx = Math.floor(x / width);
      if (idx >= 0 && idx < bins) hist[idx]++;
    });

    // Etiquetas (Marcas de clase)
    const labels = hist.map((_, i) => (i * width + width / 2).toFixed(2));
    
    // Curva Teórica (PDF * n * ancho)
    // f(x) = lambda * e^(-lambda * x)
    const theoretical = labels.map(label => {
      const x = parseFloat(label);
      const pdf = lambda * Math.exp(-lambda * x);
      return pdf * n * width;
    });

    return { labels, theoretical, empirical: hist };
  }, [samples, lambda, n]);

  return (
    <div className="max-w-6xl mx-auto p-8 font-sans text-gray-800">
      {/* Encabezado */}
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Distribución Exponencial</h1>
        <p className="text-sm text-gray-500 mt-1">
          Modelo para tiempos de espera entre eventos de un proceso de Poisson.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: Contexto Matemático y Controles */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* TARJETA DE CONTEXTO TEÓRICO */}
          <div className="bg-gray-50 p-5 rounded border border-gray-200 text-sm shadow-sm">
            <h3 className="text-xs font-bold uppercase text-gray-700 mb-3 tracking-wider border-b border-gray-200 pb-2">
              Fundamentos Matemáticos
            </h3>
            
            <div className="space-y-5 text-gray-600">
              {/* Sección 1: El Generador */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="flex items-center justify-center w-5 h-5 bg-gray-200 rounded-full text-[10px] font-bold text-gray-700">1</span>
                    <p className="font-semibold text-gray-800">Generador Base</p>
                </div>
                <p className="text-[10px] mb-2 leading-relaxed ml-7">
                  Obtención de número pseudoaleatorio uniforme.
                </p>
                  <div className="bg-white p-2 border border-gray-200 rounded overflow-x-auto ml-2">
                                   <BlockMath math={`X_{i+1} = (aX_i + c) \\pmod m`} />
                                   <div className="text-center text-xs text-gray-400 my-1">Normalización a [0,1]</div>
                                   <BlockMath math={`U_i = \\frac{X_{i}}{m}`} />
                                </div>
              </div>

              {/* Sección 2: La Transformada */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="flex items-center justify-center w-5 h-5 bg-gray-200 rounded-full text-[10px] font-bold text-gray-700">2</span>
                    <p className="font-semibold text-gray-800">Transformada Inversa</p>
                </div>
                <p className="text-[10px] mb-2 leading-relaxed ml-7">
                  Despeje de <InlineMath math="x" /> a partir de la CDF <InlineMath math="F(x) = 1 - e^{-\lambda x}" />.
                </p>
                <div className="bg-white p-2 border border-gray-200 rounded overflow-x-auto ml-2">
                  <BlockMath math={`f(x) = \\lambda e^{-\lambda x}`} />
                  <div className="text-center text-xs text-gray-400 my-1">Inversión</div>
                  <BlockMath math={`X = -\\frac{1}{\\lambda}\\ln(1-U)`} />
                </div>
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
                  Parámetro Lambda (<InlineMath math="\lambda" />)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={lambda}
                  onChange={(e) => setLambda(+e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:border-gray-900 focus:ring-0 outline-none transition"
                  placeholder="Ej. 1.0"
                />
                <p className="text-[10px] text-gray-400 mt-1">Debe ser mayor a 0.</p>
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
                      <InlineMath math="\mu = \frac{1}{\lambda}" />
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
                      <InlineMath math="\sigma^2 = \frac{1}{\lambda^2}" />
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
              <SimulationTable data={rawData} />
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

export default ExponentialSimulation;