import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function TeoriaColas() {
  const [lambda, setLambda] = useState(5); // Tasa de llegada (clientes/hora)
  const [mu, setMu] = useState(8); // Tasa de servicio (clientes/hora)
  const [c, setC] = useState(1); // Número de servidores

  const rho = lambda / (c * mu); // Intensidad de tráfico
  const isStable = rho < 1;

  // Modelo M/M/1
  const calculateMM1 = () => {
    if (!isStable) return null;
    
    const L = rho / (1 - rho); // Clientes promedio en el sistema
    const Lq = (rho * rho) / (1 - rho); // Clientes promedio en cola
    const W = L / lambda; // Tiempo promedio en sistema
    const Wq = Lq / lambda; // Tiempo promedio en cola
    const P0 = 1 - rho; // Probabilidad de sistema vacío

    return { L, Lq, W, Wq, P0, rho };
  };

  // Modelo M/M/c (aproximación)
  const calculateMMc = () => {
    if (!isStable) return null;

    const r = lambda / mu;
    
    // Calcular P0 (probabilidad sistema vacío)
    let sumTerm = 0;
    for (let n = 0; n < c; n++) {
      sumTerm += Math.pow(r, n) / factorial(n);
    }
    const lastTerm = (Math.pow(r, c) / factorial(c)) * (1 / (1 - rho));
    const P0 = 1 / (sumTerm + lastTerm);

    // Probabilidad de esperar (Fórmula C de Erlang)
    const Pc = (Math.pow(r, c) / factorial(c)) * (1 / (1 - rho)) * P0;

    // Métricas del sistema
    const Lq = Pc * rho / (1 - rho);
    const L = Lq + r;
    const Wq = Lq / lambda;
    const W = Wq + (1 / mu);

    return { L, Lq, W, Wq, P0, Pc, rho };
  };

  const factorial = (n: number): number => {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
  };

  const results = c === 1 ? calculateMM1() : calculateMMc();

  // Datos para gráfico de estado del sistema
  const stateData = results ? Array.from({ length: 15 }, (_, n) => {
    let pn;
    if (c === 1) {
      pn = results.P0 * Math.pow(rho, n);
    } else {
      const r = lambda / mu;
      if (n < c) {
        pn = (Math.pow(r, n) / factorial(n)) * results.P0;
      } else {
        pn = (Math.pow(r, n) / (factorial(c) * Math.pow(c, n - c))) * results.P0;
      }
    }
    return { n, probability: pn };
  }) : [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Teoría de Colas</h1>
          <p className="text-gray-600">
            Análisis matemático de sistemas de espera con notación de Kendall
          </p>
        </div>

        {/* Notación de Kendall */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Notación de Kendall: A/B/c/K/N/D</h2>
          
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <h4 className="font-bold mb-2">Proceso de Llegada (A)</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• <strong>M:</strong> Markoviano (Poisson)</li>
                <li>• <strong>D:</strong> Determinístico</li>
                <li>• <strong>G:</strong> General</li>
              </ul>
            </div>
            
            <div className="bg-green-50 border-l-4 border-green-500 p-4">
              <h4 className="font-bold mb-2">Proceso de Servicio (B)</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• <strong>M:</strong> Exponencial</li>
                <li>• <strong>D:</strong> Determinístico</li>
                <li>• <strong>G:</strong> General</li>
              </ul>
            </div>
            
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
              <h4 className="font-bold mb-2">Otros Parámetros</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• <strong>c:</strong> número de servidores</li>
                <li>• <strong>K:</strong> capacidad del sistema</li>
                <li>• <strong>N:</strong> población</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
            <h4 className="font-bold mb-2">Ejemplos Comunes</h4>
            <ul className="text-sm space-y-2 text-gray-700">
              <li>• <strong>M/M/1:</strong> Llegadas Poisson, servicio exponencial, 1 servidor, capacidad y población infinitas</li>
              <li>• <strong>M/M/c:</strong> Igual que M/M/1 pero con c servidores paralelos</li>
              <li>• <strong>M/M/1/K:</strong> Sistema con capacidad máxima K (rechaza clientes si está lleno)</li>
            </ul>
          </div>
        </div>

        {/* Controles */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Parámetros del Sistema</h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tasa de Llegada (λ) [clientes/hora]
              </label>
              <input
                type="number"
                value={lambda}
                onChange={(e) => setLambda(Math.max(0.1, Number(e.target.value)))}
                step="0.5"
                min="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Promedio de clientes que llegan por unidad de tiempo
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tasa de Servicio (μ) [clientes/hora]
              </label>
              <input
                type="number"
                value={mu}
                onChange={(e) => setMu(Math.max(0.1, Number(e.target.value)))}
                step="0.5"
                min="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Clientes que puede atender un servidor por unidad de tiempo
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Número de Servidores (c)
              </label>
              <input
                type="number"
                value={c}
                onChange={(e) => setC(Math.max(1, Math.min(10, Number(e.target.value))))}
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Servidores trabajando en paralelo
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-gray-700">Modelo: </span>
                <span className="text-lg font-mono font-bold text-blue-600">M/M/{c}</span>
              </div>
              <div>
                <span className="font-bold text-gray-700">Intensidad de Tráfico (ρ): </span>
                <span className={`text-lg font-bold ${isStable ? 'text-green-600' : 'text-red-600'}`}>
                  {rho.toFixed(4)}
                </span>
              </div>
              <div>
                <span className={`px-4 py-2 rounded-full font-bold ${isStable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {isStable ? '✓ SISTEMA ESTABLE' : '✗ SISTEMA INESTABLE'}
                </span>
              </div>
            </div>
          </div>

          {!isStable && (
            <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500">
              <h4 className="font-bold text-red-700 mb-2">⚠ Sistema Inestable</h4>
              <p className="text-sm text-red-600">
                La condición de estabilidad requiere ρ = λ/(c·μ) {'<'} 1. 
                Actualmente ρ = {rho.toFixed(4)} ≥ 1, lo que significa que las llegadas superan la capacidad de servicio.
                La cola crecerá indefinidamente.
              </p>
            </div>
          )}
        </div>

        {/* Fórmulas de Little */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Fórmulas de Little</h2>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <p className="text-sm text-gray-700 mb-2">
              Relaciones fundamentales que conectan el número de clientes con los tiempos de espera:
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-3">
              <div className="bg-white p-3 rounded font-mono text-sm">
                <strong>L = λ · W</strong>
                <p className="text-xs text-gray-600 mt-1 font-sans">Clientes en sistema = tasa × tiempo en sistema</p>
              </div>
              <div className="bg-white p-3 rounded font-mono text-sm">
                <strong>Lq = λ · Wq</strong>
                <p className="text-xs text-gray-600 mt-1 font-sans">Clientes en cola = tasa × tiempo en cola</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 border-l-4 border-green-500 p-4">
              <h4 className="font-bold mb-2">Métricas de Cantidad</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• <strong>L:</strong> Clientes promedio en el sistema</li>
                <li>• <strong>Lq:</strong> Clientes promedio en cola (esperando)</li>
                <li>• <strong>Ls = L - Lq:</strong> Clientes siendo atendidos</li>
              </ul>
            </div>
            
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
              <h4 className="font-bold mb-2">Métricas de Tiempo</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• <strong>W:</strong> Tiempo promedio en el sistema</li>
                <li>• <strong>Wq:</strong> Tiempo promedio en cola</li>
                <li>• <strong>Ws = W - Wq = 1/μ:</strong> Tiempo de servicio</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Resultados */}
        {isStable && results && (
          <>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Métricas de Desempeño</h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-600 mb-1">Clientes en Sistema (L)</div>
                  <div className="text-3xl font-bold text-blue-700">{results.L.toFixed(4)}</div>
                  <div className="text-xs text-gray-500 mt-1">clientes</div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-600 mb-1">Clientes en Cola (Lq)</div>
                  <div className="text-3xl font-bold text-green-700">{results.Lq.toFixed(4)}</div>
                  <div className="text-xs text-gray-500 mt-1">clientes</div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-600 mb-1">Tiempo en Sistema (W)</div>
                  <div className="text-3xl font-bold text-purple-700">{results.W.toFixed(4)}</div>
                  <div className="text-xs text-gray-500 mt-1">horas</div>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-600 mb-1">Tiempo en Cola (Wq)</div>
                  <div className="text-3xl font-bold text-yellow-700">{results.Wq.toFixed(4)}</div>
                  <div className="text-xs text-gray-500 mt-1">horas</div>
                </div>
                
                <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-600 mb-1">Sistema Vacío (P₀)</div>
                  <div className="text-3xl font-bold text-red-700">{(results.P0 * 100).toFixed(2)}%</div>
                  <div className="text-xs text-gray-500 mt-1">probabilidad</div>
                </div>
                
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-600 mb-1">Utilización (ρ)</div>
                  <div className="text-3xl font-bold text-indigo-700">{(results.rho * 100).toFixed(2)}%</div>
                  <div className="text-xs text-gray-500 mt-1">del servidor</div>
                </div>
              </div>
            </div>

            {/* Gráfico de Distribución de Estado */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Distribución de Probabilidad de Estado (n clientes en sistema)
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={stateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="n" label={{ value: 'n (clientes en sistema)', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'P(n)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="probability" stroke="#3b82f6" strokeWidth={2} name="Pₙ" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* Aplicaciones */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Aplicaciones en Ingeniería</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-bold text-lg mb-2">Sistemas de Servicio</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Bancos y cajas de supermercado</li>
                <li>• Call centers y soporte técnico</li>
                <li>• Hospitales y clínicas</li>
                <li>• Aeropuertos y aduanas</li>
              </ul>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-bold text-lg mb-2">Sistemas Tecnológicos</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Servidores web y bases de datos</li>
                <li>• Redes de telecomunicaciones</li>
                <li>• Sistemas operativos (cola de CPU)</li>
                <li>• Tráfico vehicular</li>
              </ul>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-bold text-lg mb-2">Manufactura</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Líneas de producción</li>
                <li>• Mantenimiento de máquinas</li>
                <li>• Almacenes y logística</li>
                <li>• Control de inventarios</li>
              </ul>
            </div>
            
            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="font-bold text-lg mb-2">Decisiones de Diseño</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• ¿Cuántos servidores necesito?</li>
                <li>• ¿Qué capacidad debe tener el sistema?</li>
                <li>• ¿Cómo reducir tiempos de espera?</li>
                <li>• ¿Es rentable agregar más recursos?</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Interpretación */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Interpretación de Resultados</h2>
          
          <div className="space-y-3">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <h4 className="font-bold mb-2">Alta utilización (ρ cercano a 1)</h4>
              <p className="text-sm text-gray-700">
                El servidor está muy ocupado. Pequeños aumentos en λ causarán grandes aumentos en las colas.
                Considere agregar más servidores.
              </p>
            </div>
            
            <div className="bg-green-50 border-l-4 border-green-500 p-4">
              <h4 className="font-bold mb-2">Baja utilización (ρ {'<'} 0.5)</h4>
              <p className="text-sm text-gray-700">
                El sistema tiene capacidad ociosa. Los tiempos de espera son bajos.
                Podría reducir recursos sin afectar mucho el servicio.
              </p>
            </div>
            
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
              <h4 className="font-bold mb-2">Wq muy alto</h4>
              <p className="text-sm text-gray-700">
                Los clientes esperan demasiado en cola. Esto puede causar abandono o insatisfacción.
                Aumente μ (velocidad de servicio) o agregue servidores (c).
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
