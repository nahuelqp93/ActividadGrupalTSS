import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { BoxMullerGenerator } from '../../methods/boxMuller';

export default function NormalDistribution() {
  const [mean, setMean] = useState(0);
  const [stdDev, setStdDev] = useState(1);
  const [n, setN] = useState(1000);
  const [seed, setSeed] = useState(12345);
  const [samples, setSamples] = useState<number[]>([]);
  const [stats, setStats] = useState({ mean: 0, variance: 0, stdDev: 0 });

  const handleGenerate = () => {
    const generator = new BoxMullerGenerator(seed);
    const newSamples: number[] = [];
    
    for (let i = 0; i < n; i++) {
      newSamples.push(generator.next(mean, stdDev));
    }
    
    // Calcular estadísticas empíricas
    const empiricalMean = newSamples.reduce((sum, x) => sum + x, 0) / n;
    const empiricalVariance = newSamples.reduce((sum, x) => sum + Math.pow(x - empiricalMean, 2), 0) / (n - 1);
    const empiricalStdDev = Math.sqrt(empiricalVariance);
    
    setSamples(newSamples);
    setStats({ mean: empiricalMean, variance: empiricalVariance, stdDev: empiricalStdDev });
  };

  // Preparar datos para PDF teórica
  const pdfData = [];
  for (let x = mean - 4 * stdDev; x <= mean + 4 * stdDev; x += stdDev / 10) {
    const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * 
              Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
    pdfData.push({ x: x.toFixed(2), pdf: y });
  }

  // Preparar histograma empírico
  const histogramData = samples.length > 0 ? (() => {
    const min = Math.min(...samples);
    const max = Math.max(...samples);
    const binCount = 30;
    const binWidth = (max - min) / binCount;
    const bins = Array(binCount).fill(0);
    
    samples.forEach(sample => {
      const binIndex = Math.min(Math.floor((sample - min) / binWidth), binCount - 1);
      bins[binIndex]++;
    });
    
    return bins.map((count, i) => ({
      x: (min + (i + 0.5) * binWidth).toFixed(2),
      frequency: count / samples.length / binWidth,
      count
    }));
  })() : [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Distribución Normal (Gaussiana)</h1>
          <p className="text-gray-600">
            Generación mediante el método Box-Muller y análisis de propiedades
          </p>
        </div>

        {/* Teoría */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Fundamentos Teóricos</h2>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <h3 className="font-bold text-lg mb-2">Función de Densidad de Probabilidad (PDF)</h3>
              <div className="bg-white p-3 rounded font-mono text-sm">
                f(x) = (1/√(2πσ²)) · exp(-(x-μ)²/(2σ²))
              </div>
              <p className="mt-2 text-sm text-gray-700">
                Donde <strong>μ</strong> es la media y <strong>σ²</strong> es la varianza
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <h4 className="font-bold mb-2">Propiedades Clave</h4>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• Simétrica alrededor de μ</li>
                  <li>• Forma de campana característica</li>
                  <li>• E[X] = μ, Var(X) = σ²</li>
                  <li>• Asíntota en ambos extremos</li>
                </ul>
              </div>
              
              <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
                <h4 className="font-bold mb-2">Regla Empírica (68-95-99.7)</h4>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• 68% dentro de μ ± σ</li>
                  <li>• 95% dentro de μ ± 2σ</li>
                  <li>• 99.7% dentro de μ ± 3σ</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <h4 className="font-bold mb-2">Método Box-Muller</h4>
              <p className="text-sm text-gray-700 mb-2">
                Transforma dos variables uniformes U₁, U₂ ~ U(0,1) en dos normales Z₀, Z₁ ~ N(0,1):
              </p>
              <div className="bg-white p-3 rounded font-mono text-sm space-y-1">
                <div>Z₀ = √(-2·ln(U₁)) · cos(2πU₂)</div>
                <div>Z₁ = √(-2·ln(U₁)) · sin(2πU₂)</div>
              </div>
              <p className="text-sm text-gray-700 mt-2">
                Luego: X = μ + σ·Z₀
              </p>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Parámetros de Simulación</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Media (μ)
              </label>
              <input
                type="number"
                value={mean}
                onChange={(e) => setMean(Number(e.target.value))}
                step="0.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Desviación Estándar (σ)
              </label>
              <input
                type="number"
                value={stdDev}
                onChange={(e) => setStdDev(Math.max(0.1, Number(e.target.value)))}
                step="0.1"
                min="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tamaño de muestra (n)
              </label>
              <input
                type="number"
                value={n}
                onChange={(e) => setN(Math.max(100, Number(e.target.value)))}
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
            Generar Muestras
          </button>
        </div>

        {/* Estadísticas */}
        {samples.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Estadísticas Empíricas vs Teóricas</h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-linear-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                <div className="text-sm font-semibold text-gray-600 mb-1">Media</div>
                <div className="text-2xl font-bold text-blue-700">
                  {stats.mean.toFixed(4)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Teórica: {mean.toFixed(4)}
                </div>
              </div>
              
              <div className="bg-linear-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                <div className="text-sm font-semibold text-gray-600 mb-1">Varianza</div>
                <div className="text-2xl font-bold text-green-700">
                  {stats.variance.toFixed(4)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Teórica: {(stdDev * stdDev).toFixed(4)}
                </div>
              </div>
              
              <div className="bg-linear-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                <div className="text-sm font-semibold text-gray-600 mb-1">Desviación Estándar</div>
                <div className="text-2xl font-bold text-purple-700">
                  {stats.stdDev.toFixed(4)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Teórica: {stdDev.toFixed(4)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gráficos */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* PDF Teórica */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Función de Densidad Teórica</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={pdfData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" />
                <YAxis />
                <Tooltip />
                <Legend />
                <ReferenceLine x={mean.toFixed(2)} stroke="red" strokeDasharray="3 3" label="μ" />
                <ReferenceLine x={(mean + stdDev).toFixed(2)} stroke="orange" strokeDasharray="3 3" label="μ+σ" />
                <ReferenceLine x={(mean - stdDev).toFixed(2)} stroke="orange" strokeDasharray="3 3" label="μ-σ" />
                <Line type="monotone" dataKey="pdf" stroke="#3b82f6" strokeWidth={2} dot={false} name="f(x)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Histograma Empírico */}
          {samples.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Histograma Empírico</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={histogramData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="frequency" fill="#10b981" name="Densidad" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Aplicaciones */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Aplicaciones Prácticas</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-bold text-lg mb-2">Fenómenos Naturales</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Altura de personas</li>
                <li>• Errores de medición</li>
                <li>• Temperaturas diarias</li>
                <li>• Presión arterial</li>
              </ul>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-bold text-lg mb-2">Ingeniería</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Control de calidad</li>
                <li>• Tolerancias de fabricación</li>
                <li>• Ruido en señales</li>
                <li>• Modelos financieros</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
