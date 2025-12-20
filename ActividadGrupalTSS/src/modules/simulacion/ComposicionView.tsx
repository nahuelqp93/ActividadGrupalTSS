import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

interface SimulationState {
  r1: number;
  r2: number;
  selectedFunction: 1 | 2 | 3;
  x: number;
  formula: string;
}

export default function ComposicionView() {
  // Estado de entrada
  const [a, setA] = useState(1);
  const [b, setB] = useState(3);
  const [c, setC] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [analyzed, setAnalyzed] = useState(false);

  // Valores calculados
  const [h, setH] = useState(0);
  const [areas, setAreas] = useState({ A1: 0, A2: 0, A3: 0 });
  const [cumulativeProbs, setCumulativeProbs] = useState({ p1: 0, p2: 0, p3: 0 });

  // Simulación
  const [simulation, setSimulation] = useState<SimulationState | null>(null);
  const [simulationHistory, setSimulationHistory] = useState<SimulationState[]>([]);

  // Input de X personalizado
  const [customX, setCustomX] = useState<string>("");
  const [customXResult, setCustomXResult] = useState<{ x: number; area: number; description: string } | null>(null);

  // Validar y analizar
  const handleAnalyze = () => {
    setError(null);

    if (a >= b || b >= c || a < 0) {
      setError("⚠️ Error: Debe cumplirse que 0 ≤ a < b < c");
      return;
    }

    // Calcular h (altura del rectángulo)
    const heightValue = 2 / (c + b - a);
    setH(heightValue);

    // Calcular áreas
    const A1 = a / (c + b - a);
    const A2 = (2 * (b - a)) / (c + b - a);
    const A3 = (c - b) / (c + b - a);
    setAreas({ A1, A2, A3 });

    // Probabilidades acumuladas
    setCumulativeProbs({
      p1: A1,
      p2: A1 + A2,
      p3: 1,
    });

    setAnalyzed(true);
  };

  // Generar puntos para la gráfica del trapecio
  const generateTrapezoidData = () => {
    return [
      { x: 0, y: 0 },
      { x: a, y: h },
      { x: b, y: h },
      { x: c, y: 0 },
    ];
  };

  // Generar datos para la probabilidad acumulada
  const generateCumulativeData = () => {
    return [
      { name: "f₁(x)", value: areas.A1, fill: "#EF4444" },
      { name: "f₂(x)", value: areas.A2, fill: "#3B82F6" },
      { name: "f₃(x)", value: areas.A3, fill: "#06B6D4" },
    ];
  };

  // Validar X ingresado por el usuario
  const handleValidateCustomX = () => {
    if (!customX || isNaN(parseFloat(customX))) {
      setError("Por favor ingresa un valor numérico válido");
      return;
    }

    const xValue = parseFloat(customX);
    let area = 0;
    let description = "";

    if (xValue < 0 || xValue > c) {
      setError(`X debe estar entre 0 y ${c}`);
      return;
    }

    if (xValue >= 0 && xValue <= a) {
      area = 1;
      description = `X está en el área A₁ [0, ${a}]`;
    } else if (xValue > a && xValue <= b) {
      area = 2;
      description = `X está en el área A₂ [${a}, ${b}]`;
    } else {
      area = 3;
      description = `X está en el área A₃ [${b}, ${c}]`;
    }

    setCustomXResult({ x: xValue, area, description });
    setError(null);
  };

 

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="border-b-2 border-gray-300 pb-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Método de Composición</h1>
        <p className="text-gray-600 text-base mt-2">
          Generación de variables aleatorias con distribución trapezoidal
        </p>
      </div>

      {/* FASE 1: Entrada de Parámetros */}
      {!analyzed && (
        <div className="bg-white border border-gray-300 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Configuración de Parámetros</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Parámetro a
              </label>
              <input
                type="number"
                value={a}
                onChange={(e) => setA(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-600 mt-1">Condición: 0 ≤ a</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Parámetro b
              </label>
              <input
                type="number"
                value={b}
                onChange={(e) => setB(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-600 mt-1">Condición: a &lt; b</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Parámetro c
              </label>
              <input
                type="number"
                value={c}
                onChange={(e) => setC(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-600 mt-1">Condición: b &lt; c</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-400 p-3 rounded mb-6">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-semibold transition"
          >
            Graficar y Analizar
          </button>
        </div>
      )}

      {/* FASE 2: Visualización y Desarrollo */}
      {analyzed && (
        <>
          {/* Gráfica del Trapecio */}
          <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Gráfica de la Función de Densidad f(x)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={generateTrapezoidData()}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="linear"
                  dataKey="y"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ fill: "#2563eb", r: 5 }}
                  isAnimationActive={true}
                  name="f(x)"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-3 text-sm text-gray-700">
              <p>
                Trapecio con vértices: (0,0), ({a},{h.toFixed(4)}), ({b},{h.toFixed(4)}), ({c},0)
              </p>
            </div>
          </div>

          {/* PASOS 1-6 */}
          <div className="space-y-4">
            {/* PASO 1 */}
            <div className="bg-white border-l-4 border-red-500 border border-gray-300 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Paso 1: Dividir f(x) en Subáreas</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 p-4 rounded border border-gray-300">
                  <p className="font-semibold text-gray-800">Área A₁</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{areas.A1.toFixed(4)}</p>
                  <p className="text-xs text-gray-600 mt-1">Triángulo izquierdo</p>
                </div>
                <div className="bg-gray-50 p-4 rounded border border-gray-300">
                  <p className="font-semibold text-gray-800">Área A₂</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{areas.A2.toFixed(4)}</p>
                  <p className="text-xs text-gray-600 mt-1">Rectángulo central</p>
                </div>
                <div className="bg-gray-50 p-4 rounded border border-gray-300">
                  <p className="font-semibold text-gray-800">Área A₃</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{areas.A3.toFixed(4)}</p>
                  <p className="text-xs text-gray-600 mt-1">Triángulo derecho</p>
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded border-l-4 border-yellow-600">
                <p className="text-sm font-semibold text-gray-800 mb-2">Fórmulas:</p>
                <p className="text-sm text-gray-700">h = 2 / (c + b - a) = {h.toFixed(4)}</p>
                <p className="text-sm text-gray-700">A₁ = a / (c + b - a) = {areas.A1.toFixed(4)}</p>
                <p className="text-sm text-gray-700">A₂ = 2(b - a) / (c + b - a) = {areas.A2.toFixed(4)}</p>
                <p className="text-sm text-gray-700">A₃ = (c - b) / (c + b - a) = {areas.A3.toFixed(4)}</p>
                <p className="text-sm text-green-700 font-semibold mt-2">✓ Suma = {(areas.A1 + areas.A2 + areas.A3).toFixed(4)}</p>
              </div>
            </div>

            {/* PASO 2 */}
            <div className="bg-white border-l-4 border-orange-500 border border-gray-300 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Paso 2: Determinar las Subfunciones fᵢ(x)</h3>
              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded border-l-4 border-gray-400">
                  <p className="font-semibold text-gray-800">f₁(x) para x ∈ [0, {a}]</p>
                  <p className="text-sm text-gray-700 mt-1 font-mono">f₁(x) = (2x) / (a × (c + b - a))</p>
                </div>
                <div className="bg-gray-50 p-4 rounded border-l-4 border-gray-400">
                  <p className="font-semibold text-gray-800">f₂(x) para x ∈ [{a}, {b}]</p>
                  <p className="text-sm text-gray-700 mt-1 font-mono">f₂(x) = {h.toFixed(4)} (constante)</p>
                </div>
                <div className="bg-gray-50 p-4 rounded border-l-4 border-gray-400">
                  <p className="font-semibold text-gray-800">f₃(x) para x ∈ [{b}, {c}]</p>
                  <p className="text-sm text-gray-700 mt-1 font-mono">f₃(x) = (2(c - x)) / ((c - b) × (c + b - a))</p>
                </div>
              </div>
            </div>

            {/* PASO 3 */}
            <div className="bg-white border-l-4 border-green-600 border border-gray-300 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Paso 3: Expresar la Función Original</h3>
              <div className="bg-gray-50 p-6 rounded border border-gray-300">
                <p className="font-semibold text-gray-800 text-base mb-3">f(x) = p₁·f₁(x) + p₂·f₂(x) + p₃·f₃(x)</p>
                <div className="text-sm text-gray-800 space-y-1 font-mono">
                  <p>p₁ = A₁ = {areas.A1.toFixed(4)}</p>
                  <p>p₂ = A₂ = {areas.A2.toFixed(4)}</p>
                  <p>p₃ = A₃ = {areas.A3.toFixed(4)}</p>
                  <p className="font-semibold text-green-700 mt-2">✓ p₁ + p₂ + p₃ = 1</p>
                </div>
              </div>
            </div>

            {/* PASO 4 */}
            <div className="bg-white border-l-4 border-blue-600 border border-gray-300 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Paso 4: Relación Gráfica - Probabilidades Acumuladas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-gray-800 mb-3">Distribución de Probabilidades</p>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={generateCumulativeData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {generateCumulativeData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-3">Probabilidades Acumuladas</p>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-700">F₁ = p₁</p>
                        <div className="w-full bg-gray-200 h-5 rounded mt-1 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full flex items-center justify-end pr-2"
                            style={{ width: `${cumulativeProbs.p1 * 100}%` }}
                          >
                            <span className="text-xs font-bold text-white">
                              {(cumulativeProbs.p1 * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="ml-2 font-mono text-sm text-gray-700">{cumulativeProbs.p1.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-700">F₂ = p₁ + p₂</p>
                        <div className="w-full bg-gray-200 h-5 rounded mt-1 overflow-hidden">
                          <div
                            className="bg-blue-500 h-full flex items-center justify-end pr-2"
                            style={{ width: `${cumulativeProbs.p2 * 100}%` }}
                          >
                            <span className="text-xs font-bold text-white">
                              {(cumulativeProbs.p2 * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="ml-2 font-mono text-sm text-gray-700">{cumulativeProbs.p2.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-700">F₃ = 1</p>
                        <div className="w-full bg-gray-200 h-5 rounded mt-1 overflow-hidden">
                          <div className="bg-blue-400 h-full flex items-center justify-end pr-2 w-full">
                            <span className="text-xs font-bold text-white">100%</span>
                          </div>
                        </div>
                      </div>
                      <span className="ml-2 font-mono text-sm text-gray-700">1.0000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PASO 5 */}
            <div className="bg-white border-l-4 border-pink-600 border border-gray-300 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Paso 5: Generar R1, R2 y R3</h3>
              <div className="bg-gray-50 p-4 rounded border border-gray-300">
                <p className="font-mono text-sm text-gray-800 space-y-1">
                  <div>R1 &lt; GeneradorCongruencialMixto()</div>
                  <div>R2 &lt; GeneradorCongruencialMixto()</div>
                  <div>R3 &lt; GeneradorCongruencialMixto()</div>
                </p>
              </div>
            </div>

            {/* PASO 6 */}
            <div className="bg-white border-l-4 border-purple-600 border border-gray-300 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Paso 6: Seleccionar Función y Calcular X</h3>
              <div className="bg-gray-50 p-4 rounded border border-gray-300 text-sm font-mono text-gray-800 mb-4">
                <p>Si R1 &lt; {areas.A1.toFixed(4)}</p>
                <p className="pl-4 text-green-700">Usar f₁(x)</p>
                <p>Sino si R1 &lt; {cumulativeProbs.p2.toFixed(4)}</p>
                <p className="pl-4 text-green-700">Usar f₂(x)</p>
                <p>Sino</p>
                <p className="pl-4 text-green-700">Usar f₃(x)</p>
              </div>

              {/* Ingreso de X personalizado */}
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-800 mb-2">Ingresar valor de X:</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.0001"
                    value={customX}
                    onChange={(e) => setCustomX(e.target.value)}
                    placeholder={`Valor entre 0 y ${c}`}
                    className="flex-1 px-3 py-2 border border-gray-400 rounded focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleValidateCustomX}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-semibold transition"
                  >
                    Validar
                  </button>
                </div>
              </div>

              {/* Resultado de X */}
              {customXResult && (
                <div className="mt-4 bg-blue-50 p-4 rounded border border-blue-300">
                  <p className="font-semibold text-gray-800">Resultado:</p>
                  <p className="text-sm text-gray-700 mt-2">X = {customXResult.x.toFixed(4)}</p>
                  <p className="text-sm text-gray-700">Área: <span className="font-semibold text-blue-700">A{customXResult.area}</span></p>
                  <p className="text-sm text-gray-700 mt-2">{customXResult.description}</p>
                </div>
              )}
            </div>

            {/* RESULTADO DE LA SIMULACIÓN */}
            {simulation && (
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Resultado de la Simulación</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white p-3 rounded border border-gray-300 border-t-4 border-t-pink-600">
                    <p className="text-xs font-semibold text-gray-700">R1 (Seleccionar función)</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{simulation.r1.toFixed(4)}</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-300 border-t-4 border-t-blue-600">
                    <p className="text-xs font-semibold text-gray-700">R2 (Dentro de función)</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{simulation.r2.toFixed(4)}</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-300 border-t-4 border-t-green-600">
                    <p className="text-xs font-semibold text-gray-700">X (Resultado)</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{simulation.x.toFixed(4)}</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded border border-gray-300 border-l-4 border-l-gray-600 mb-3">
                  <p className="font-semibold text-gray-800 mb-1">
                    Se seleccionó: <span className="text-gray-900">f{simulation.selectedFunction}(x)</span>
                  </p>
                  <p className="text-xs text-gray-600 font-mono mt-2">{simulation.formula}</p>
                </div>

                {simulationHistory.length > 1 && (
                  <div className="bg-white p-4 rounded border border-gray-300">
                    <p className="font-semibold text-gray-800 mb-2">Historial de Simulaciones ({simulationHistory.length})</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {simulationHistory.map((sim, idx) => (
                        <div key={idx} className="bg-gray-50 p-2 rounded text-xs text-gray-700 font-mono">
                          Iter. {idx + 1}: R1={sim.r1.toFixed(4)}, R2={sim.r2.toFixed(4)}, f{sim.selectedFunction}, X={sim.x.toFixed(4)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Botón para reiniciar */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => {
                setAnalyzed(false);
                setSimulation(null);
                setSimulationHistory([]);
              }}
              className="bg-gray-700 hover:bg-gray-800 text-white py-2 px-6 rounded font-semibold transition"
            >
              Reiniciar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
