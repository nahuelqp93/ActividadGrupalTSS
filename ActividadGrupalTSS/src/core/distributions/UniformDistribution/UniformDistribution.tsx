import React, { useState, useMemo } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { useLCG } from '../../random/useLCG'; // Tu hook existente
import { DistributionChart } from '../utils/DistributionChart';
import { SimulationTable } from '../utils/SimulationTable';

interface UniformRow {
  u: number;
  x: number;
}

// Lógica de transformación
function uniformSample(a: number, b: number, nextU: () => number): UniformRow {
  const u = nextU();
  // Aplicación de la fórmula de la Transformada Inversa
  const x = a + (b - a) * u;
  return { u, x };
}

const UniformSimulation: React.FC = () => {
  // Estado
  const [a, setA] = useState(0);
  const [b, setB] = useState(10);
  const [n, setN] = useState(1000);
  const [samples, setSamples] = useState<number[]>([]);
  const [rawData, setRawData] = useState<UniformRow[]>([]);

  // Instancia del generador
  const rng = useLCG({
    seed: 1234,
    a: 1664525,
    c: 1013904223,
    m: 2 ** 32
  });

  const isValid = a < b;

  const handleSimulate = () => {
    if (!isValid) return;
    rng.reseed(Date.now()); 

    const newRawData: UniformRow[] = [];
    const newSamples: number[] = [];

    for (let i = 0; i < n; i++) {
      const sample = uniformSample(a, b, rng.next);
      newRawData.push(sample);
      newSamples.push(sample.x);
    }

    setRawData(newRawData);
    setSamples(newSamples);
  };

  // Cálculo de estadísticas
  const stats = useMemo(() => {
    if (samples.length === 0) return null;
    const meanEmp = samples.reduce((s, x) => s + x, 0) / samples.length;
    const varEmp = samples.reduce((s, x) => s + (x - meanEmp) ** 2, 0) / samples.length;
    const meanTheo = (a + b) / 2;
    const varTheo = (b - a) ** 2 / 12;

    return { meanEmp, varEmp, meanTheo, varTheo };
  }, [samples, a, b]);

  // Preparación de datos para el gráfico
  const chartData = useMemo(() => {
    if (samples.length === 0) return { labels: [], theoretical: [], empirical: [] };

    const bins = 30;
    const width = (b - a) / bins;
    const hist = new Array(bins).fill(0);

    samples.forEach(x => {
      const idx = Math.floor((x - a) / width);
      if (idx >= 0 && idx < bins) hist[idx]++;
    });

    const labels = hist.map((_, i) => (a + i * width + width / 2).toFixed(2));
    const theoretical = labels.map(() => (1 / (b - a)) * n * width); 

    return { labels, theoretical, empirical: hist };
  }, [samples, a, b, n]);

  return (
    <div className="max-w-6xl mx-auto p-8 font-sans text-gray-800">
      {/* Encabezado */}
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Distribución Uniforme Continua</h1>
        <p className="text-sm text-gray-500 mt-1">
          Simulación de variable aleatoria continua mediante Generador Congruencial Mixto y Transformada Inversa.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Teoría y Controles */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* NUEVA TARJETA: Contexto Matemático Completo */}
          <div className="bg-gray-50 p-5 rounded border border-gray-200 text-sm shadow-sm">
            <h3 className="text-xs font-bold uppercase text-gray-700 mb-3 tracking-wider border-b border-gray-200 pb-2">
              Fundamentos Matemáticos
            </h3>
            
            <div className="space-y-5 text-gray-600">
              {/* Sección 1: El Generador */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="flex items-center justify-center w-5 h-5 bg-gray-200 rounded-full text-[10px] font-bold text-gray-700">1</span>
                    <p className="font-semibold text-gray-800">Generador (LCG)</p>
                </div>
                <p className="text-[10px] mb-2 leading-relaxed ml-7">
                  Algoritmo recursivo para generar la base aleatoria <InlineMath math="U" />.
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
                  Proyección de <InlineMath math="U_i" /> al intervalo continuo <InlineMath math="[a, b]" />.
                </p>
                <div className="bg-white p-2 border border-gray-200 rounded overflow-x-auto ml-2">
                  <BlockMath math={`f(x) = \\frac{1}{b-a}`} />
                  <div className="text-center text-xs text-gray-400 my-1">Despeje de F(x) = U</div>
                  <BlockMath math={`X = a + (b-a)U_i`} />
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de Parámetros */}
          <div className="bg-white p-5 rounded border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase text-gray-500 mb-4 tracking-wider">Configuración</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Límite Inf. (a)</label>
                  <input
                    type="number"
                    value={a}
                    onChange={(e) => setA(+e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded focus:border-gray-900 focus:ring-0 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Límite Sup. (b)</label>
                  <input
                    type="number"
                    value={b}
                    onChange={(e) => setB(+e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded focus:border-gray-900 focus:ring-0 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Iteraciones (n)</label>
                <input
                  type="number"
                  value={n}
                  onChange={(e) => setN(+e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:border-gray-900 focus:ring-0 outline-none transition"
                />
              </div>

              {!isValid && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">
                  Error: El límite 'a' debe ser menor que 'b'.
                </div>
              )}

              <button
                onClick={handleSimulate}
                disabled={!isValid}
                className="w-full bg-gray-900 hover:bg-black text-white text-xs uppercase font-bold py-3 px-4 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 tracking-wide"
              >
                Ejecutar Simulación
              </button>
            </div>
          </div>

          {/* Estadísticas */}
          {stats && (
            <div className="bg-white p-5 rounded border border-gray-200 shadow-sm">
              <h3 className="text-xs font-bold uppercase text-gray-500 mb-4 tracking-wider border-b border-gray-100 pb-2">
                Resultados Estadísticos
              </h3>
              
              <div className="space-y-4 text-sm">
                
                {/* Media Teórica */}
                <div className="flex justify-between items-start group">
                  <div className="flex flex-col">
                    <span className="text-gray-700 font-bold text-xs uppercase">Media Teórica</span>
                    <div className="text-gray-400 text-2xl mt-1 origin-left transform scale-90">
                      <InlineMath math="\mu = \frac{a+b}{2}" />
                    </div>
                  </div>
                  <span className="font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                    {stats.meanTheo.toFixed(4)}
                  </span>
                </div>

                {/* Media Simulada */}
                <div className="flex justify-between items-center border-t border-dashed border-gray-200 pt-2">
                  <span className="text-gray-600 text-xs">
                    Simulada (<InlineMath math="\bar{x}" />):
                  </span>
                  <span className="font-mono font-bold text-gray-900">
                    {stats.meanEmp.toFixed(4)}
                  </span>
                </div>

                {/* Separador visual */}
                <div className="border-t border-gray-100 my-2"></div>

                {/* Varianza Teórica */}
                <div className="flex justify-between items-start group">
                  <div className="flex flex-col">
                    <span className="text-gray-700 font-semibold text-xs uppercase">Varianza Teórica</span>
                    <div className="text-gray-400 text-2xl mt-1 origin-left transform scale-90">
                      <InlineMath math="\sigma^2 = \frac{(b-a)^2}{12}" />
                    </div>
                  </div>
                  <span className="font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                    {stats.varTheo.toFixed(4)}
                  </span>
                </div>

                {/* Varianza Simulada */}
                <div className="flex justify-between items-center border-t border-dashed border-gray-200 pt-2">
                  <span className="text-gray-600 text-xs">
                    Simulada (<InlineMath math="S^2" />):
                  </span>
                  <span className="font-mono font-bold text-gray-900">
                    {stats.varEmp.toFixed(4)}
                  </span>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Columna Derecha: Gráficos y Tabla */}
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
              Ingrese parámetros y ejecute la simulación para ver resultados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UniformSimulation;