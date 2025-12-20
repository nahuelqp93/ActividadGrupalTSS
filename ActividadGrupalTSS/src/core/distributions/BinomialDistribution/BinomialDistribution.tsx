import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LCG } from '../../random/lcg';

export default function BinomialDistribution() {
  const [n, setN] = useState(10);
  const [p, setP] = useState(0.5);
  const [trials, setTrials] = useState(1000);
  const [seed, setSeed] = useState(12345);
  const [results, setResults] = useState<number[]>([]);
  const [stats, setStats] = useState({ mean: 0, variance: 0 });

  const factorial = (num: number): number => {
    if (num <= 1) return 1;
    return num * factorial(num - 1);
  };

  const binomialPMF = (k: number, n: number, p: number): number => {
    const combination = factorial(n) / (factorial(k) * factorial(n - k));
    return combination * Math.pow(p, k) * Math.pow(1 - p, n - k);
  };

  const handleGenerate = () => {
    const lcg = new LCG(seed, 1664525, 1013904223, Math.pow(2, 32));
    const newResults: number[] = [];

    // Método de Convolución: Suma de n Bernoullis
    for (let trial = 0; trial < trials; trial++) {
      let successes = 0;
      for (let i = 0; i < n; i++) {
        const u = lcg.next();
        if (u <= p) successes++;
      }
      newResults.push(successes);
    }

    // Calcular estadísticas empíricas
    const empiricalMean = newResults.reduce((sum, x) => sum + x, 0) / trials;
    const empiricalVariance = newResults.reduce((sum, x) => sum + Math.pow(x - empiricalMean, 2), 0) / (trials - 1);

    setResults(newResults);
    setStats({ mean: empiricalMean, variance: empiricalVariance });
  };

  // Preparar datos para PMF teórica
  const theoreticalData = Array.from({ length: n + 1 }, (_, k) => ({
    k,
    pmf: binomialPMF(k, n, p),
    cdf: Array.from({ length: k + 1 }, (_, i) => binomialPMF(i, n, p)).reduce((sum, val) => sum + val, 0)
  }));

  // Preparar datos empíricos
  const empiricalData = results.length > 0 ? (() => {
    const counts = Array(n + 1).fill(0);
    results.forEach(result => counts[result]++);
    return counts.map((count, k) => ({
      k,
      empirical: count / trials,
      theoretical: binomialPMF(k, n, p)
    }));
  })() : [];

  const theoreticalMean = n * p;
  const theoreticalVariance = n * p * (1 - p);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Distribución Binomial</h1>
          <p className="text-gray-600">
            Generación mediante convolución de ensayos Bernoulli
          </p>
        </div>

        {/* Teoría */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Fundamentos Teóricos</h2>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <h3 className="font-bold text-lg mb-2">Función de Masa de Probabilidad (PMF)</h3>
              <div className="bg-white p-3 rounded font-mono text-sm">
                P(X = k) = C(n,k) · p^k · (1-p)^(n-k)
              </div>
              <p className="mt-2 text-sm text-gray-700">
                Donde <strong>C(n,k) = n!/(k!(n-k)!)</strong> es el coeficiente binomial
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <h4 className="font-bold mb-2">Parámetros</h4>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• <strong>n:</strong> número de ensayos independientes</li>
                  <li>• <strong>p:</strong> probabilidad de éxito en cada ensayo</li>
                  <li>• <strong>X:</strong> número de éxitos en n ensayos</li>
                  <li>• Rango: X ∈ {'{'}0, 1, 2, ..., n{'}'}</li>
                </ul>
              </div>
              
              <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
                <h4 className="font-bold mb-2">Propiedades</h4>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• E[X] = n · p</li>
                  <li>• Var(X) = n · p · (1-p)</li>
                  <li>• Es suma de n Bernoulli(p)</li>
                  <li>• Si n→∞, p→0, np→λ: Poisson(λ)</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <h4 className="font-bold mb-2">Método de Generación: Convolución</h4>
              <p className="text-sm text-gray-700 mb-2">
                Genera X ~ Binomial(n, p) sumando n variables Bernoulli(p):
              </p>
              <div className="bg-white p-3 rounded font-mono text-sm space-y-1">
                <div>1. Generar U₁, U₂, ..., Uₙ ~ U(0,1)</div>
                <div>2. Para cada i: Yᵢ = 1 si Uᵢ ≤ p, sino Yᵢ = 0</div>
                <div>3. X = Y₁ + Y₂ + ... + Yₙ</div>
              </div>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Parámetros de Simulación</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ensayos (n)
              </label>
              <input
                type="number"
                value={n}
                onChange={(e) => setN(Math.max(1, Math.min(50, Number(e.target.value))))}
                min="1"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Probabilidad (p)
              </label>
              <input
                type="number"
                value={p}
                onChange={(e) => setP(Math.max(0, Math.min(1, Number(e.target.value))))}
                step="0.05"
                min="0"
                max="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Repeticiones
              </label>
              <input
                type="number"
                value={trials}
                onChange={(e) => setTrials(Math.max(100, Number(e.target.value)))}
                step="100"
                min="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Semilla
              </label>
              <input
                type="number"
                value={seed}
                onChange={(e) => setSeed(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <button
            onClick={handleGenerate}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Generar Simulación
          </button>
        </div>

        {/* Estadísticas */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Comparación: Empírico vs Teórico</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                <div className="text-sm font-semibold text-gray-600 mb-1">Media (E[X])</div>
                <div className="text-2xl font-bold text-blue-700">
                  Empírica: {stats.mean.toFixed(4)}
                </div>
                <div className="text-lg text-gray-600 mt-1">
                  Teórica: {theoreticalMean.toFixed(4)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Fórmula: n · p = {n} · {p} = {theoreticalMean}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                <div className="text-sm font-semibold text-gray-600 mb-1">Varianza (Var[X])</div>
                <div className="text-2xl font-bold text-green-700">
                  Empírica: {stats.variance.toFixed(4)}
                </div>
                <div className="text-lg text-gray-600 mt-1">
                  Teórica: {theoreticalVariance.toFixed(4)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Fórmula: n · p · (1-p) = {n} · {p} · {(1-p).toFixed(2)} = {theoreticalVariance.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gráficos */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* PMF Teórica */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">PMF Teórica</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={theoreticalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="k" label={{ value: 'k (número de éxitos)', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'P(X=k)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="pmf" fill="#3b82f6" name="Probabilidad" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* CDF Teórica */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">CDF Teórica</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={theoreticalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="k" label={{ value: 'k', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'F(k)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="stepAfter" dataKey="cdf" stroke="#10b981" strokeWidth={2} name="P(X≤k)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Comparación Empírica vs Teórica */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Comparación: Frecuencias Empíricas vs PMF Teórica</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={empiricalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="k" label={{ value: 'k (número de éxitos)', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Probabilidad / Frecuencia', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="empirical" fill="#6366f1" name="Empírica" />
                <Bar dataKey="theoretical" fill="#10b981" name="Teórica" opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Aplicaciones */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ejemplos de Aplicación</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-bold text-lg mb-2">Control de Calidad</h4>
              <p className="text-sm text-gray-700">
                Inspeccionar n=20 productos con probabilidad p=0.05 de defecto.
                ¿Cuál es la probabilidad de encontrar exactamente 2 defectuosos?
              </p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-bold text-lg mb-2">Encuestas</h4>
              <p className="text-sm text-gray-700">
                Entrevistar n=100 personas con p=0.6 de respuesta favorable.
                ¿Cuántas respuestas favorables esperamos?
              </p>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-bold text-lg mb-2">Pruebas Médicas</h4>
              <p className="text-sm text-gray-700">
                Realizar n=10 pruebas con p=0.95 de precisión.
                ¿Cuál es la probabilidad de que todas sean correctas?
              </p>
            </div>
            
            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="font-bold text-lg mb-2">Lanzamiento de Monedas</h4>
              <p className="text-sm text-gray-700">
                Lanzar n=5 monedas justas (p=0.5).
                ¿Cuál es la distribución de caras obtenidas?
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
