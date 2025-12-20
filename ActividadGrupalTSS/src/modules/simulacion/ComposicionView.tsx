import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import * as math from "mathjs";

interface Segment {
  id: string;
  xmin: number;
  xmax: number;
  formula: string;
}

interface AnalysisResult {
  segments: Segment[];
  areas: number[];
  totalArea: number;
  normalizationFactor: number;
  cumulativeProbs: number[];
}

interface SimulationResult {
  r1: number;
  r2: number;
  segmentIndex: number;
  x: number;
  description: string;
}

// Integración numérica usando la regla del trapecio
const numericalIntegration = (formula: string, xmin: number, xmax: number, steps: number = 1000) => {
  const h = (xmax - xmin) / steps;
  let sum = 0;

  try {
    for (let i = 0; i <= steps; i++) {
      const x = xmin + i * h;
      const y = math.evaluate(formula, { x }) as number;

      if (i === 0 || i === steps) {
        sum += y * 0.5;
      } else {
        sum += y;
      }
    }
    return Math.abs(sum * h);
  } catch {
    return 0;
  }
};

// Método de bisección para resolver f(x) = target
const bisectionMethod = (
  cdf: (x: number) => number,
  target: number,
  xmin: number,
  xmax: number,
  tolerance: number = 1e-6,
  maxIterations: number = 100
): number => {
  let left = xmin;
  let right = xmax;

  for (let i = 0; i < maxIterations; i++) {
    const mid = (left + right) / 2;
    const fMid = cdf(mid);

    if (Math.abs(fMid - target) < tolerance) {
      return mid;
    }

    if (fMid < target) {
      left = mid;
    } else {
      right = mid;
    }
  }

  return (left + right) / 2;
};

export default function ComposicionView() {
  // Estado de entrada
  const [segments, setSegments] = useState<Segment[]>([
    { id: "1", xmin: 0, xmax: 1, formula: "2*x" },
    { id: "2", xmin: 1, xmax: 2, formula: "2*(2-x)" },
  ]);

  // Estado del análisis
  const [analyzed, setAnalyzed] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Input de X personalizado
  const [customX, setCustomX] = useState<string>("");
  const [customXResult, setCustomXResult] = useState<{
    x: number;
    segmentIndex: number;
    description: string;
  } | null>(null);

  // Simulación
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [simulationHistory, setSimulationHistory] = useState<SimulationResult[]>([]);

  // Agregar segmento
  const addSegment = () => {
    const newId = (Math.max(...segments.map((s) => parseInt(s.id)), 0) + 1).toString();
    setSegments([...segments, { id: newId, xmin: 0, xmax: 1, formula: "1" }]);
  };

  // Remover segmento
  const removeSegment = (id: string) => {
    if (segments.length > 1) {
      setSegments(segments.filter((s) => s.id !== id));
    }
  };

  // Actualizar segmento
  const updateSegment = (id: string, field: keyof Segment, value: string | number) => {
    setSegments(segments.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  // Analizar función
  const handleAnalyze = () => {
    setError(null);

    // Validar segmentos
    for (const seg of segments) {
      if (seg.xmin >= seg.xmax) {
        setError(`Error: xmin debe ser menor que xmax para el segmento ${seg.id}`);
        return;
      }
      try {
        math.evaluate(seg.formula, { x: (seg.xmin + seg.xmax) / 2 });
      } catch {
        setError(`Error: Fórmula inválida en segmento ${seg.id}`);
        return;
      }
    }

    // Calcular áreas
    const areas = segments.map((seg) => numericalIntegration(seg.formula, seg.xmin, seg.xmax));
    const totalArea = areas.reduce((a, b) => a + b, 0);

    if (totalArea === 0) {
      setError("Error: El área total es cero");
      return;
    }

    // Factor de normalización
    const normalizationFactor = 1 / totalArea;

    // Probabilidades acumuladas
    const normalizedAreas = areas.map((a) => a * normalizationFactor);
    const cumulativeProbs = [];
    let cumsum = 0;
    for (const area of normalizedAreas) {
      cumsum += area;
      cumulativeProbs.push(cumsum);
    }

    const result: AnalysisResult = {
      segments,
      areas: normalizedAreas,
      totalArea,
      normalizationFactor,
      cumulativeProbs,
    };

    setAnalysis(result);
    setAnalyzed(true);
  };

  // Generar gráfica de la función
  const generateFunctionData = () => {
    if (!analysis) return [];

    const data = [];
    const allXmin = Math.min(...analysis.segments.map((s) => s.xmin));
    const allXmax = Math.max(...analysis.segments.map((s) => s.xmax));
    const step = (allXmax - allXmin) / 200;

    for (let x = allXmin; x <= allXmax; x += step) {
      const segment = analysis.segments.find((s) => s.xmin <= x && x <= s.xmax);
      if (segment) {
        try {
          const yRaw = math.evaluate(segment.formula, { x }) as number;
          const y = yRaw * analysis.normalizationFactor;
          data.push({ x: parseFloat(x.toFixed(4)), y: Math.max(0, y) });
        } catch {
          // Skip invalid points
        }
      }
    }

    return data;
  };

  // Validar X ingresado
  const handleValidateCustomX = () => {
    if (!customX || isNaN(parseFloat(customX))) {
      setError("Por favor ingresa un valor numérico válido");
      return;
    }

    if (!analysis) {
      setError("Primero debes analizar la función");
      return;
    }

    const xValue = parseFloat(customX);
    const allXmin = Math.min(...analysis.segments.map((s) => s.xmin));
    const allXmax = Math.max(...analysis.segments.map((s) => s.xmax));

    if (xValue < allXmin || xValue > allXmax) {
      setError(`X debe estar entre ${allXmin} y ${allXmax}`);
      return;
    }

    const segmentIndex = analysis.segments.findIndex((s) => s.xmin <= xValue && xValue <= s.xmax);

    if (segmentIndex === -1) {
      setError("X no está en ningún segmento");
      return;
    }

    setCustomXResult({
      x: xValue,
      segmentIndex,
      description: `X está en el segmento ${segmentIndex + 1}: [${analysis.segments[segmentIndex].xmin}, ${analysis.segments[segmentIndex].xmax}]`,
    });
    setError(null);
  };

  // Simular con método de la composición
  const handleSimulate = () => {
    if (!analysis) {
      setError("Primero debes analizar la función");
      return;
    }

    const r1 = Math.random();
    let segmentIndex = 0;

    // Seleccionar segmento basado en R1 y probabilidades acumuladas
    for (let i = 0; i < analysis.cumulativeProbs.length; i++) {
      if (r1 <= analysis.cumulativeProbs[i]) {
        segmentIndex = i;
        break;
      }
    }

    const r2 = Math.random();
    const segment = analysis.segments[segmentIndex];

    // Construir CDF del segmento
    const cdfSegment = (x: number): number => {
      const integral = numericalIntegration(
        segment.formula,
        segment.xmin,
        x,
        500
      );
      return integral * analysis.normalizationFactor;
    };

    // Resolver numéricamente
    const targetCDF = r2 * (analysis.areas[segmentIndex] || 0.1);
    const x = bisectionMethod(cdfSegment, targetCDF, segment.xmin, segment.xmax);

    const result: SimulationResult = {
      r1,
      r2,
      segmentIndex,
      x,
      description: `Segmento ${segmentIndex + 1}: [${segment.xmin}, ${segment.xmax}], fórmula: ${segment.formula}`,
    };

    setSimulation(result);
    setSimulationHistory([...simulationHistory, result]);
  };

 

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="border-b-2 border-gray-300 pb-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Método de Composición - Función Definida a Trozos</h1>
        <p className="text-gray-600 text-base mt-2">Generación de variables aleatorias con funciones arbitrarias</p>
      </div>

      {/* FASE 1: Configuración de Segmentos */}
      {!analyzed && (
        <div className="bg-white border border-gray-300 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Configuración de Segmentos</h2>

          <div className="space-y-4 mb-6">
            {segments.map((segment, idx) => (
              <div key={segment.id} className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Segmento {idx + 1}</label>
                    <div className="text-gray-600 text-sm">ID: {segment.id}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Xmín</label>
                    <input
                      type="number"
                      step="0.1"
                      value={segment.xmin}
                      onChange={(e) => updateSegment(segment.id, "xmin", parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Xmáx</label>
                    <input
                      type="number"
                      step="0.1"
                      value={segment.xmax}
                      onChange={(e) => updateSegment(segment.id, "xmax", parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Fórmula</label>
                    <input
                      type="text"
                      value={segment.formula}
                      onChange={(e) => updateSegment(segment.id, "formula", e.target.value)}
                      placeholder="ej: 2*x, x^2, 5, etc."
                      className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:border-blue-500 font-mono text-sm"
                    />
                  </div>
                </div>
                {segments.length > 1 && (
                  <button
                    onClick={() => removeSegment(segment.id)}
                    className="mt-3 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm transition"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={addSegment}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded font-semibold transition"
            >
              Agregar Segmento
            </button>
            <button
              onClick={handleAnalyze}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-semibold transition"
            >
              Graficar y Analizar
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-400 p-3 rounded">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* FASE 2: Análisis y Solución */}
      {analyzed && analysis && (
        <>
          {/* Gráfica de la Función */}
          <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Gráfica de la Función de Densidad f(x)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={generateFunctionData()} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="y"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={true}
                  name="f(x)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* PASOS 1-6 */}
          <div className="space-y-4">
            {/* PASO 1: Dividir en Subáreas */}
            <div className="bg-white border-l-4 border-red-500 border border-gray-300 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Paso 1: Dividir f(x) en Subáreas</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                {analysis.areas.map((area, idx) => (
                  <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-300">
                    <p className="font-semibold text-gray-800">Área A{idx + 1}</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">{area.toFixed(4)}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      [{analysis.segments[idx].xmin}, {analysis.segments[idx].xmax}]
                    </p>
                  </div>
                ))}
              </div>
              <div className="bg-yellow-50 p-4 rounded border-l-4 border-yellow-600">
                <p className="text-sm font-semibold text-gray-800 mb-2">Información:</p>
                <p className="text-sm text-gray-700">Área Total (antes de normalizar): {analysis.totalArea.toFixed(4)}</p>
                <p className="text-sm text-gray-700">Factor de Normalización: {analysis.normalizationFactor.toFixed(4)}</p>
                <p className="text-sm text-green-700 font-semibold mt-2">
                  ✓ Suma de áreas normalizadas = {analysis.areas.reduce((a, b) => a + b, 0).toFixed(4)}
                </p>
              </div>
            </div>

            {/* PASO 2: Determinar Subfunciones */}
            <div className="bg-white border-l-4 border-orange-500 border border-gray-300 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Paso 2: Determinar las Subfunciones fᵢ(x)</h3>
              <div className="space-y-3">
                {analysis.segments.map((seg, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded border-l-4 border-gray-400">
                    <p className="font-semibold text-gray-800">f{idx + 1}(x) para x ∈ [{seg.xmin}, {seg.xmax}]</p>
                    <p className="text-sm text-gray-700 mt-1 font-mono">
                      f{idx + 1}(x) = {analysis.normalizationFactor.toFixed(4)} * ({seg.formula})
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* PASO 3: Expresión Total */}
            <div className="bg-white border-l-4 border-green-600 border border-gray-300 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Paso 3: Expresar la Función Original</h3>
              <div className="bg-gray-50 p-6 rounded border border-gray-300">
                <p className="font-semibold text-gray-800 text-base mb-3">
                  f(x) = {analysis.areas.map((_, i) => `p${i + 1}·f${i + 1}(x)`).join(" + ")}
                </p>
                <div className="text-sm text-gray-800 space-y-1 font-mono">
                  {analysis.areas.map((area, idx) => (
                    <p key={idx}>
                      • p{idx + 1} = A{idx + 1} = {area.toFixed(4)}
                    </p>
                  ))}
                  <p className="font-semibold text-green-700 mt-2">
                    ✓ Suma = {analysis.areas.reduce((a, b) => a + b, 0).toFixed(4)}
                  </p>
                </div>
              </div>
            </div>

            {/* PASO 4: Probabilidades Acumuladas */}
            <div className="bg-white border-l-4 border-blue-600 border border-gray-300 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Paso 4: Relación Gráfica - Probabilidades Acumuladas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-gray-800 mb-3">Distribución de Probabilidades</p>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                      data={analysis.areas.map((area, idx) => ({
                        name: `f${idx + 1}`,
                        value: area,
                        fill: "#3b82f6",
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {analysis.areas.map((_, index) => (
                          <Cell key={`cell-${index}`} fill="#3b82f6" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-3">Probabilidades Acumuladas</p>
                  <div className="space-y-2">
                    {analysis.cumulativeProbs.map((prob, idx) => (
                      <div key={idx} className="flex items-center">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-700">F{idx + 1}</p>
                          <div className="w-full bg-gray-200 h-5 rounded mt-1 overflow-hidden">
                            <div
                              className="bg-blue-600 h-full flex items-center justify-end pr-2"
                              style={{ width: `${prob * 100}%` }}
                            >
                              <span className="text-xs font-bold text-white">{(prob * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        </div>
                        <span className="ml-2 font-mono text-sm text-gray-700">{prob.toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* PASO 5: Generación de Números Aleatorios */}
            <div className="bg-white border-l-4 border-pink-600 border border-gray-300 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Paso 5: Generar R1 y R2</h3>
              <div className="bg-gray-50 p-4 rounded border border-gray-300">
                <p className="font-mono text-sm text-gray-800 space-y-1">
                  <div>R1 &lt; GeneradorCongruencialMixto()</div>
                  <div>R2 &lt; GeneradorCongruencialMixto()</div>
                </p>
              </div>
              <button
                onClick={handleSimulate}
                className="mt-4 w-full bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded font-semibold transition"
              >
                Simular Iteración
              </button>
            </div>

            {/* PASO 6: Seleccionar Función y Calcular X */}
            <div className="bg-white border-l-4 border-purple-600 border border-gray-300 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Paso 6: Seleccionar Función y Calcular X</h3>
              <div className="bg-gray-50 p-4 rounded border border-gray-300 text-sm font-mono text-gray-800 mb-4">
                <p>Basado en R1:</p>
                {analysis.cumulativeProbs.map((prob, idx) => (
                  <p key={idx} className="pl-4">
                    Si R1 ≤ {prob.toFixed(4)} usar segmento {idx + 1}
                  </p>
                ))}
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
                    placeholder="Valor de X"
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
                  <p className="text-sm text-gray-700">Segmento: {customXResult.segmentIndex + 1}</p>
                  <p className="text-sm text-gray-700 mt-2">{customXResult.description}</p>
                </div>
              )}
            </div>

            {/* Resultado de Simulación */}
            {simulation && (
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Resultado de la Simulación</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white p-3 rounded border border-gray-300 border-t-4 border-t-pink-600">
                    <p className="text-xs font-semibold text-gray-700">R1 (Seleccionar segmento)</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{simulation.r1.toFixed(4)}</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-300 border-t-4 border-t-blue-600">
                    <p className="text-xs font-semibold text-gray-700">R2 (Dentro del segmento)</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{simulation.r2.toFixed(4)}</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-300 border-t-4 border-t-green-600">
                    <p className="text-xs font-semibold text-gray-700">X (Resultado)</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{simulation.x.toFixed(4)}</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded border border-gray-300 border-l-4 border-l-gray-600 mb-3">
                  <p className="font-semibold text-gray-800 mb-1">
                    Segmento seleccionado: <span className="text-gray-900">{simulation.segmentIndex + 1}</span>
                  </p>
                  <p className="text-xs text-gray-600 font-mono mt-2">{simulation.description}</p>
                </div>

                {simulationHistory.length > 1 && (
                  <div className="bg-white p-4 rounded border border-gray-300">
                    <p className="font-semibold text-gray-800 mb-2">Historial ({simulationHistory.length})</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {simulationHistory.map((sim, idx) => (
                        <div key={idx} className="bg-gray-50 p-2 rounded text-xs text-gray-700 font-mono">
                          Iter. {idx + 1}: R1={sim.r1.toFixed(4)}, R2={sim.r2.toFixed(4)}, Seg={sim.segmentIndex + 1}, X={sim.x.toFixed(4)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Botón reiniciar */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => {
                setAnalyzed(false);
                setAnalysis(null);
                setSimulation(null);
                setSimulationHistory([]);
                setCustomX("");
                setCustomXResult(null);
                setError(null);
              }}
              className="bg-gray-700 hover:bg-gray-800 text-white py-2 px-6 rounded font-semibold transition"
            >
              Reiniciar
            </button>
          </div>
        </>
      )}

      {error && analyzed && (
        <div className="fixed bottom-6 right-6 bg-red-50 border border-red-400 p-4 rounded max-w-sm">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
