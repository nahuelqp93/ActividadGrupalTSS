import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { LCG } from '../../../core/random/lcg';

export default function PruebasAleatoriedad() {
  const [seed, setSeed] = useState(12345);
  const [n, setN] = useState(10000);
  const [results, setResults] = useState<any>(null);

  const runTests = () => {
    const lcg = new LCG(seed, 1664525, 1013904223, Math.pow(2, 32));
    const samples: number[] = [];
    
    for (let i = 0; i < n; i++) {
      samples.push(lcg.next());
    }

    // Prueba de Media
    const meanTest = testMean(samples);
    
    // Prueba de Frecuencias (Chi-cuadrado)
    const chiSquareTest = testChiSquare(samples);
    
    // Prueba de Corridas (Runs Test)
    const runsTest = testRuns(samples);
    
    // Prueba de Autocorrelación
    const autocorrelationTest = testAutocorrelation(samples);

    setResults({
      samples,
      meanTest,
      chiSquareTest,
      runsTest,
      autocorrelationTest
    });
  };

  const testMean = (samples: number[]) => {
    const empiricalMean = samples.reduce((sum, x) => sum + x, 0) / samples.length;
    const theoreticalMean = 0.5;
    const variance = 1 / 12; // Varianza de U(0,1)
    const stdError = Math.sqrt(variance / samples.length);
    
    // Estadístico Z
    const z = (empiricalMean - theoreticalMean) / stdError;
    const pValue = 2 * (1 - normalCDF(Math.abs(z)));
    const passed = pValue > 0.05;

    return {
      empiricalMean: empiricalMean.toFixed(6),
      theoreticalMean: theoreticalMean.toFixed(6),
      zStatistic: z.toFixed(4),
      pValue: pValue.toFixed(6),
      passed,
      alpha: 0.05
    };
  };

  const testChiSquare = (samples: number[]) => {
    const bins = 10;
    const observed = Array(bins).fill(0);
    
    samples.forEach(sample => {
      const binIndex = Math.min(Math.floor(sample * bins), bins - 1);
      observed[binIndex]++;
    });

    const expected = samples.length / bins;
    const chiSquare = observed.reduce((sum, obs) => {
      return sum + Math.pow(obs - expected, 2) / expected;
    }, 0);

    // Grados de libertad = bins - 1
    const df = bins - 1;
    const criticalValue = chiSquareCritical(df, 0.05);
    const passed = chiSquare < criticalValue;

    return {
      observed,
      expected,
      chiSquare: chiSquare.toFixed(4),
      df,
      criticalValue: criticalValue.toFixed(4),
      passed,
      bins
    };
  };

  const testRuns = (samples: number[]) => {
    const median = 0.5;
    let runs = 1;
    let n1 = 0; // Por encima de la mediana
    let n2 = 0; // Por debajo de la mediana

    for (let i = 0; i < samples.length; i++) {
      if (samples[i] > median) n1++;
      else n2++;

      if (i > 0) {
        const prev = samples[i - 1] > median;
        const curr = samples[i] > median;
        if (prev !== curr) runs++;
      }
    }

    // Estadístico de corridas
    const expectedRuns = (2 * n1 * n2) / (n1 + n2) + 1;
    const varianceRuns = (2 * n1 * n2 * (2 * n1 * n2 - n1 - n2)) / 
                         (Math.pow(n1 + n2, 2) * (n1 + n2 - 1));
    const z = (runs - expectedRuns) / Math.sqrt(varianceRuns);
    const pValue = 2 * (1 - normalCDF(Math.abs(z)));
    const passed = pValue > 0.05;

    return {
      runs,
      expectedRuns: expectedRuns.toFixed(2),
      zStatistic: z.toFixed(4),
      pValue: pValue.toFixed(6),
      passed,
      n1,
      n2
    };
  };

  const testAutocorrelation = (samples: number[]) => {
    const lag = 1;
    const mean = samples.reduce((sum, x) => sum + x, 0) / samples.length;
    
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < samples.length - lag; i++) {
      numerator += (samples[i] - mean) * (samples[i + lag] - mean);
    }

    for (let i = 0; i < samples.length; i++) {
      denominator += Math.pow(samples[i] - mean, 2);
    }

    const autocorr = numerator / denominator;
    const stdError = 1 / Math.sqrt(samples.length);
    const z = autocorr / stdError;
    const pValue = 2 * (1 - normalCDF(Math.abs(z)));
    const passed = Math.abs(autocorr) < 2 * stdError;

    return {
      autocorrelation: autocorr.toFixed(6),
      stdError: stdError.toFixed(6),
      zStatistic: z.toFixed(4),
      pValue: pValue.toFixed(6),
      passed,
      lag
    };
  };

  // Aproximación de CDF normal estándar
  const normalCDF = (z: number): number => {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    const probability = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - probability : probability;
  };

  // Aproximación de valor crítico chi-cuadrado
  const chiSquareCritical = (df: number, alpha: number): number => {
    // Aproximación simplificada para α=0.05
    const criticalValues: { [key: number]: number } = {
      1: 3.841, 2: 5.991, 3: 7.815, 4: 9.488, 5: 11.070,
      6: 12.592, 7: 14.067, 8: 15.507, 9: 16.919, 10: 18.307
    };
    return criticalValues[df] || 18.307;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Pruebas de Aleatoriedad</h1>
          <p className="text-gray-600">
            Validación estadística de generadores de números pseudoaleatorios
          </p>
        </div>

        {/* Teoría */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Fundamentos</h2>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <h3 className="font-bold text-lg mb-2">¿Por qué validar generadores?</h3>
              <p className="text-sm text-gray-700">
                Los generadores pseudoaleatorios deben producir secuencias que <strong>parezcan aleatorias</strong> aunque sean determinísticas.
                Si fallan las pruebas estadísticas, los resultados de simulación pueden ser inválidos.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <h4 className="font-bold mb-2">Propiedades Deseables</h4>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• <strong>Uniformidad:</strong> valores distribuidos uniformemente</li>
                  <li>• <strong>Independencia:</strong> valores no correlacionados</li>
                  <li>• <strong>Periodo largo:</strong> no repetir secuencias rápido</li>
                  <li>• <strong>Reproducibilidad:</strong> misma semilla = misma secuencia</li>
                </ul>
              </div>
              
              <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
                <h4 className="font-bold mb-2">Hipótesis Nula (H₀)</h4>
                <p className="text-sm text-gray-700 mb-2">
                  En todas las pruebas, H₀ es: <strong>"Los números son aleatorios"</strong>
                </p>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• Si p-value {'>'} α: No rechazamos H₀ ✅</li>
                  <li>• Si p-value ≤ α: Rechazamos H₀ ❌</li>
                  <li>• Típicamente α = 0.05 (5%)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Configuración de Pruebas</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tamaño de muestra (n)
              </label>
              <input
                type="number"
                value={n}
                onChange={(e) => setN(Math.max(1000, Number(e.target.value)))}
                step="1000"
                min="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Muestras grandes mejoran la precisión de las pruebas
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Semilla del LCG
              </label>
              <input
                type="number"
                value={seed}
                onChange={(e) => setSeed(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Diferentes semillas generan secuencias diferentes
              </p>
            </div>
          </div>
          
          <button
            onClick={runTests}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Ejecutar Todas las Pruebas
          </button>
        </div>

        {/* Resultados */}
        {results && (
          <>
            {/* Prueba de Media */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">1. Prueba de Media</h3>
                <span className={`px-4 py-2 rounded-full font-bold ${results.meanTest.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {results.meanTest.passed ? '✓ APROBADA' : '✗ RECHAZADA'}
                </span>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Objetivo:</strong> Verificar que la media empírica está cerca de 0.5 (media teórica de U(0,1))
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Criterio:</strong> Usar test Z con nivel de significancia α = {results.meanTest.alpha}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <div className="text-xs text-gray-600">Media Empírica</div>
                  <div className="text-lg font-bold text-gray-800">{results.meanTest.empiricalMean}</div>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <div className="text-xs text-gray-600">Media Teórica</div>
                  <div className="text-lg font-bold text-gray-800">{results.meanTest.theoreticalMean}</div>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <div className="text-xs text-gray-600">Estadístico Z</div>
                  <div className="text-lg font-bold text-gray-800">{results.meanTest.zStatistic}</div>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <div className="text-xs text-gray-600">p-value</div>
                  <div className="text-lg font-bold text-gray-800">{results.meanTest.pValue}</div>
                </div>
              </div>
            </div>

            {/* Prueba Chi-Cuadrado */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">2. Prueba de Frecuencias (Chi-Cuadrado)</h3>
                <span className={`px-4 py-2 rounded-full font-bold ${results.chiSquareTest.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {results.chiSquareTest.passed ? '✓ APROBADA' : '✗ RECHAZADA'}
                </span>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Objetivo:</strong> Verificar que los valores se distribuyen uniformemente en {results.chiSquareTest.bins} intervalos
                </p>
                <div className="text-sm text-gray-700">
                  <strong>Estadístico:</strong> χ² = Σ (Observado - Esperado)² / Esperado
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <div className="text-xs text-gray-600">χ² Calculado</div>
                  <div className="text-lg font-bold text-gray-800">{results.chiSquareTest.chiSquare}</div>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <div className="text-xs text-gray-600">χ² Crítico (α=0.05)</div>
                  <div className="text-lg font-bold text-gray-800">{results.chiSquareTest.criticalValue}</div>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <div className="text-xs text-gray-600">Grados de Libertad</div>
                  <div className="text-lg font-bold text-gray-800">{results.chiSquareTest.df}</div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={results.chiSquareTest.observed.map((obs: number, i: number) => ({
                  bin: `Bin ${i + 1}`,
                  observed: obs,
                  expected: results.chiSquareTest.expected
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bin" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="observed" fill="#3b82f6" name="Observado" />
                  <ReferenceLine y={results.chiSquareTest.expected} stroke="red" strokeDasharray="3 3" label="Esperado" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Prueba de Corridas */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">3. Prueba de Corridas (Runs Test)</h3>
                <span className={`px-4 py-2 rounded-full font-bold ${results.runsTest.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {results.runsTest.passed ? '✓ APROBADA' : '✗ RECHAZADA'}
                </span>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Objetivo:</strong> Detectar patrones o tendencias en la secuencia (valores por encima/debajo de la mediana)
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Criterio:</strong> Contar cuántas "corridas" (cambios de estado) hay en la secuencia
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <div className="text-xs text-gray-600">Corridas Observadas</div>
                  <div className="text-lg font-bold text-gray-800">{results.runsTest.runs}</div>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <div className="text-xs text-gray-600">Corridas Esperadas</div>
                  <div className="text-lg font-bold text-gray-800">{results.runsTest.expectedRuns}</div>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <div className="text-xs text-gray-600">Encima Mediana (n₁)</div>
                  <div className="text-lg font-bold text-gray-800">{results.runsTest.n1}</div>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <div className="text-xs text-gray-600">Debajo Mediana (n₂)</div>
                  <div className="text-lg font-bold text-gray-800">{results.runsTest.n2}</div>
                </div>
                <div className="border-l-4 border-red-500 pl-4">
                  <div className="text-xs text-gray-600">p-value</div>
                  <div className="text-lg font-bold text-gray-800">{results.runsTest.pValue}</div>
                </div>
              </div>
            </div>

            {/* Prueba de Autocorrelación */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">4. Prueba de Autocorrelación</h3>
                <span className={`px-4 py-2 rounded-full font-bold ${results.autocorrelationTest.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {results.autocorrelationTest.passed ? '✓ APROBADA' : '✗ RECHAZADA'}
                </span>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Objetivo:</strong> Verificar que valores consecutivos no están correlacionados (son independientes)
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Criterio:</strong> Calcular correlación entre Xᵢ y Xᵢ₊₁ (lag={results.autocorrelationTest.lag})
                </p>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <div className="text-xs text-gray-600">Autocorrelación</div>
                  <div className="text-lg font-bold text-gray-800">{results.autocorrelationTest.autocorrelation}</div>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <div className="text-xs text-gray-600">Error Estándar</div>
                  <div className="text-lg font-bold text-gray-800">{results.autocorrelationTest.stdError}</div>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <div className="text-xs text-gray-600">Estadístico Z</div>
                  <div className="text-lg font-bold text-gray-800">{results.autocorrelationTest.zStatistic}</div>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <div className="text-xs text-gray-600">p-value</div>
                  <div className="text-lg font-bold text-gray-800">{results.autocorrelationTest.pValue}</div>
                </div>
              </div>
            </div>

            {/* Resumen */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Resumen de Resultados</h3>
              
              <div className="space-y-3">
                {[
                  { name: 'Prueba de Media', passed: results.meanTest.passed },
                  { name: 'Prueba Chi-Cuadrado', passed: results.chiSquareTest.passed },
                  { name: 'Prueba de Corridas', passed: results.runsTest.passed },
                  { name: 'Prueba de Autocorrelación', passed: results.autocorrelationTest.passed }
                ].map((test, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-semibold text-gray-700">{test.name}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${test.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {test.passed ? '✓ APROBADA' : '✗ RECHAZADA'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500">
                <h4 className="font-bold mb-2">Interpretación</h4>
                <p className="text-sm text-gray-700">
                  El generador LCG con parámetros a=1664525, c=1013904223, m=2³² {' '}
                  {[results.meanTest.passed, results.chiSquareTest.passed, results.runsTest.passed, results.autocorrelationTest.passed].every(Boolean)
                    ? <strong className="text-green-700">APROBÓ todas las pruebas ✓</strong>
                    : <strong className="text-red-700">FALLÓ al menos una prueba ✗</strong>
                  }
                </p>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
