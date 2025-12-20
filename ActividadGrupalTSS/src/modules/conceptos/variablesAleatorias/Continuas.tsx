import { useState } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { BotonVolver } from '../components/BotonVolver';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function VariablesContinuas() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(10);
  const [rangoA, setRangoA] = useState(3);
  const [rangoB, setRangoB] = useState(7);
  const [mostrarArea, setMostrarArea] = useState(false);

  // Generar datos para la PDF de uniforme
  const generarDatos = () => {
    const puntos = 200;
    const datos = [];
    const step = (b - a) / puntos;
    
    for (let i = 0; i <= puntos; i++) {
      const x = a + i * step;
      const y = (x >= a && x <= b) ? 1 / (b - a) : 0;
      datos.push({ x, y });
    }
    return datos;
  };

  const datos = generarDatos();
  
  // Calcular área sombreada

  const areaSombreada = mostrarArea ? (Math.min(rangoB, b) - Math.max(rangoA, a)) / (b - a) : 0;

  const chartData = {
    labels: datos.map(d => d.x.toFixed(1)),
    datasets: [
      {
        label: 'f(x) - PDF',
        data: datos.map(d => d.y),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: false,
        pointRadius: 0,
      },
      ...(mostrarArea ? [{
        label: `P(${rangoA} ≤ X ≤ ${rangoB})`,
        data: datos.map(d => (d.x >= rangoA && d.x <= rangoB) ? d.y : null),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.3)',
        borderWidth: 2,
        fill: true,
        pointRadius: 0,
      }] : [])
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">

        <div className="print:hidden"> 
           <BotonVolver />
        </div>
      <div className="max-w-4xl mx-auto space-y-6">
        
       

        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-green-200">
          <h1 className="text-3xl font-bold text-green-900 mb-2">
            1.3 Variables Aleatorias Continuas
          </h1>
          <p className="text-gray-600">
            Variables que toman valores en un intervalo continuo
          </p>
        </div>

        {/* Definición */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Definición
          </h2>

          <div className="space-y-4">
            <p className="text-gray-700">
              Una variable aleatoria es <strong>continua</strong> si puede tomar cualquier valor 
              en un intervalo de números reales.
            </p>

            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <p className="text-sm font-semibold text-green-900 mb-2">Características:</p>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Los valores forman un <strong>continuo</strong> (sin espacios entre ellos)</li>
                <li>• <strong>No se pueden enumerar</strong> todos los valores</li>
                <li>• Entre dos valores cualesquiera hay infinitos valores intermedios</li>
                <li>• Ejemplos: [0, 10], (-∞, ∞), [a, b]</li>
              </ul>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
              <p className="text-sm font-semibold text-red-900 mb-2">Diferencia Clave:</p>
              <BlockMath math="P(X = x) = 0 \quad \text{para cualquier valor específico } x" />
              <p className="text-sm text-gray-700 mt-2">
                En variables continuas, la probabilidad de un <strong>punto exacto es cero</strong>. 
                Solo tiene sentido calcular probabilidades de <strong>intervalos</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Comparación Discreta vs Continua */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Comparación: Discreta vs Continua
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Aspecto</th>
                  <th className="px-4 py-3 text-left font-semibold">Discreta</th>
                  <th className="px-4 py-3 text-left font-semibold">Continua</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="px-4 py-3 border-t font-semibold">Valores</td>
                  <td className="px-4 py-3 border-t">Contables, separados</td>
                  <td className="px-4 py-3 border-t">Intervalo continuo</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 border-t font-semibold">Función</td>
                  <td className="px-4 py-3 border-t">PMF: <InlineMath math="p(x)" /></td>
                  <td className="px-4 py-3 border-t">PDF: <InlineMath math="f(x)" /></td>
                </tr>
                <tr className="bg-white">
                  <td className="px-4 py-3 border-t font-semibold">P(X = x)</td>
                  <td className="px-4 py-3 border-t"><InlineMath math="> 0" /> (puede ser positiva)</td>
                  <td className="px-4 py-3 border-t"><InlineMath math="= 0" /> (siempre cero)</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 border-t font-semibold">Probabilidades</td>
                  <td className="px-4 py-3 border-t">Suma: <InlineMath math="\sum p(x)" /></td>
                  <td className="px-4 py-3 border-t">Integral: <InlineMath math="\int f(x)dx" /></td>
                </tr>
                <tr className="bg-white">
                  <td className="px-4 py-3 border-t font-semibold">Ejemplo</td>
                  <td className="px-4 py-3 border-t">Número de clientes: 0, 1, 2, 3, ...</td>
                  <td className="px-4 py-3 border-t">Tiempo de espera: [0, ∞)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Función de Densidad de Probabilidad */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Función de Densidad de Probabilidad (PDF)
          </h2>

          <div className="space-y-4">
            <p className="text-gray-700">
              Para describir una variable aleatoria continua usamos la <strong>Función de Densidad de Probabilidad</strong> (PDF):
            </p>

            <div className="bg-gray-50 p-4 rounded-lg">
              <BlockMath math="f(x)" />
              <p className="text-sm text-gray-600 text-center mt-2">
                Define la "densidad" de probabilidad en cada punto
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm font-semibold text-blue-900 mb-3">Propiedades de la PDF:</p>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-700 mb-1"><strong>1. No negatividad:</strong></p>
                  <BlockMath math="f(x) \geq 0 \quad \text{para todo } x" />
                </div>
                <div>
                  <p className="text-sm text-gray-700 mb-1"><strong>2. Área total igual a 1:</strong></p>
                  <BlockMath math="\int_{-\infty}^{\infty} f(x) \, dx = 1" />
                </div>
                <div>
                  <p className="text-sm text-gray-700 mb-1"><strong>3. Probabilidad de intervalo:</strong></p>
                  <BlockMath math="P(a \leq X \leq b) = \int_{a}^{b} f(x) \, dx" />
                  <p className="text-xs text-gray-600 mt-1">
                    La probabilidad es el <strong>área bajo la curva</strong> entre a y b
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visualización Interactiva */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-purple-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Visualización Interactiva: Distribución Uniforme
          </h2>

          <div className="space-y-4">
            <p className="text-gray-700">
              Ejemplo: <InlineMath math={`X \\sim \\text{Uniforme}(${a}, ${b})`} />
            </p>

            <div className="bg-purple-50 p-4 rounded-lg space-y-4">
              {/* Parámetros de la distribución */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Límite inferior (a):
                  </label>
                  <input
                    type="number"
                    value={a}
                    onChange={(e) => setA(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Límite superior (b):
                  </label>
                  <input
                    type="number"
                    value={b}
                    onChange={(e) => setB(parseFloat(e.target.value) || 10)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* Calcular probabilidad */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    checked={mostrarArea}
                    onChange={(e) => setMostrarArea(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label className="text-sm font-medium">
                    Calcular <InlineMath math={`P(${rangoA} \\leq X \\leq ${rangoB})`} />
                  </label>
                </div>

                {mostrarArea && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Desde (a):
                      </label>
                      <input
                        type="number"
                        value={rangoA}
                        onChange={(e) => setRangoA(parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Hasta (b):
                      </label>
                      <input
                        type="number"
                        value={rangoB}
                        onChange={(e) => setRangoB(parseFloat(e.target.value) || 10)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Gráfico */}
            <div className="h-64 bg-white border border-gray-300 rounded-lg p-4">
              <Line 
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'f(x) - Densidad'
                      }
                    },
                    x: {
                      title: {
                        display: true,
                        text: 'x'
                      },
                      ticks: {
                        maxTicksLimit: 10
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      display: true
                    }
                  }
                }}
              />
            </div>

            {/* Resultado */}
            {mostrarArea && (
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                <p className="text-sm font-semibold text-green-900 mb-2">Resultado:</p>
                <BlockMath math={`P(${rangoA} \\leq X \\leq ${rangoB}) = ${areaSombreada.toFixed(4)}`} />
                <p className="text-xs text-gray-600 mt-2">
                  Esta es el <strong>área bajo la curva</strong> (región sombreada en verde)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Ejemplos Clásicos */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ejemplos Clásicos
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-2">Tiempo de Espera</h3>
              <p className="text-sm text-gray-700 mb-2">
                <InlineMath math="T \in [0, \infty)" />
              </p>
              <p className="text-sm text-gray-600">
                Distribución Exponencial
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-bold text-green-900 mb-2">Duración de Servicio</h3>
              <p className="text-sm text-gray-700 mb-2">
                <InlineMath math="S \in [a, b]" />
              </p>
              <p className="text-sm text-gray-600">
                Distribución Uniforme
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="font-bold text-purple-900 mb-2">Altura de Personas</h3>
              <p className="text-sm text-gray-700 mb-2">
                <InlineMath math="H \in (-\infty, \infty)" />
              </p>
              <p className="text-sm text-gray-600">
                Distribución Normal
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-bold text-yellow-900 mb-2">Temperatura</h3>
              <p className="text-sm text-gray-700 mb-2">
                <InlineMath math="Y \in \mathbb{R}" />
              </p>
              <p className="text-sm text-gray-600">
                Puede ser Normal
              </p>
            </div>
          </div>
        </div>

        {/* Conceptos Clave */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-yellow-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Conceptos Clave
          </h2>

          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-yellow-600 font-bold text-xl">•</span>
              <div>
                <strong>Valores en intervalo:</strong> Pueden tomar cualquier valor en un rango continuo
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-600 font-bold text-xl">•</span>
              <div>
                <strong>P(X = x) = 0:</strong> La probabilidad de un punto exacto es cero
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-600 font-bold text-xl">•</span>
              <div>
                <strong>PDF:</strong> Función de densidad <InlineMath math="f(x)" /> (no es probabilidad directa)
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-600 font-bold text-xl">•</span>
              <div>
                <strong>Área = Probabilidad:</strong> <InlineMath math="P(a \leq X \leq b) = \int_a^b f(x)dx" />
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-600 font-bold text-xl">•</span>
              <div>
                <strong>Integral = 1:</strong> El área total bajo la curva es 1
              </div>
            </li>
          </ul>
        </div>

        

      </div>
    </div>
  );
}