import { useState } from 'react';
import { ArrowLeft, ArrowRight, Coins } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function VariablesDiscretas() {
  const [numMonedas, setNumMonedas] = useState(3);
  const [simulaciones, setSimulaciones] = useState<number[]>([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  const simularMonedas = () => {
    const resultados: number[] = [];
    for (let i = 0; i < 1000; i++) {
      let caras = 0;
      for (let j = 0; j < numMonedas; j++) {
        if (Math.random() < 0.5) caras++;
      }
      resultados.push(caras);
    }
    setSimulaciones(resultados);
    setMostrarResultados(true);
  };

  // Calcular frecuencias
  const frecuencias = Array(numMonedas + 1).fill(0);
  simulaciones.forEach(x => frecuencias[x]++);
  const probabilidadesEmpiricas = frecuencias.map(f => f / simulaciones.length);

  // Probabilidades teóricas (binomial)
  const calcularBinomial = (n: number, k: number, p: number) => {
    const combinatorio = (n: number, k: number): number => {
      if (k === 0 || k === n) return 1;
      let result = 1;
      for (let i = 0; i < k; i++) {
        result *= (n - i);
        result /= (i + 1);
      }
      return result;
    };
    return combinatorio(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
  };

  const probabilidadesTeoricasArray = Array(numMonedas + 1)
    .fill(0)
    .map((_, k) => calcularBinomial(numMonedas, k, 0.5));

  const chartData = {
    labels: Array(numMonedas + 1).fill(0).map((_, i) => i.toString()),
    datasets: [
      {
        label: 'Probabilidad Teórica',
        data: probabilidadesTeoricasArray,
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2
      },
      ...(mostrarResultados ? [{
        label: 'Frecuencia Empírica',
        data: probabilidadesEmpiricas,
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2
      }] : [])
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navegación */}
        <div className="flex items-center justify-between">
          <Link 
            to="/conceptos/variables-aleatorias/introduccion"
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft size={20} />
            Anterior
          </Link>
          <Link 
            to="/conceptos/variables-aleatorias/continuas"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Siguiente: Variables Continuas
            <ArrowRight size={20} />
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-200">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            1.2 Variables Aleatorias Discretas
          </h1>
          <p className="text-gray-600">
            Variables que toman valores contables o numerables
          </p>
        </div>

        {/* Definición */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Definición
          </h2>

          <div className="space-y-4">
            <p className="text-gray-700">
              Una variable aleatoria es <strong>discreta</strong> si toma un número contable (finito o infinito numerable) 
              de valores distintos.
            </p>

            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm font-semibold text-blue-900 mb-2">Características:</p>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Los valores son <strong>separados</strong> (no continuos)</li>
                <li>• Se pueden <strong>enumerar</strong> o contar: x₁, x₂, x₃, ...</li>
                <li>• Entre dos valores consecutivos no hay valores intermedios de la variable</li>
                <li>• Ejemplos: 0, 1, 2, 3, ... o {`{1, 2, 3, 4, 5, 6}`}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Función de Masa de Probabilidad (PMF) */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-green-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Función de Masa de Probabilidad (PMF)
          </h2>

          <div className="space-y-4">
            <p className="text-gray-700">
              Para describir una variable aleatoria discreta usamos la <strong>Función de Masa de Probabilidad</strong> (PMF):
            </p>

            <div className="bg-gray-50 p-4 rounded-lg">
              <BlockMath math="p(x) = P(X = x)" />
              <p className="text-sm text-gray-600 text-center mt-2">
                Probabilidad de que X tome exactamente el valor x
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <p className="text-sm font-semibold text-green-900 mb-3">Propiedades de la PMF:</p>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-700 mb-1"><strong>1. No negatividad:</strong></p>
                  <BlockMath math="p(x) \geq 0 \quad \text{para todo } x" />
                </div>
                <div>
                  <p className="text-sm text-gray-700 mb-1"><strong>2. Suma total igual a 1:</strong></p>
                  <BlockMath math="\sum_{\text{todos los } x} p(x) = 1" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ejemplos Clásicos */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ejemplos Clásicos
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="font-bold text-purple-900 mb-2">Lanzamiento de Dado</h3>
              <p className="text-sm text-gray-700 mb-2">
                <InlineMath math="X \in \{1, 2, 3, 4, 5, 6\}" />
              </p>
              <BlockMath math="P(X = k) = \frac{1}{6} \quad \text{para } k = 1,2,3,4,5,6" />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-2">Número de Clientes</h3>
              <p className="text-sm text-gray-700 mb-2">
                <InlineMath math="N \in \{0, 1, 2, 3, \ldots\}" />
              </p>
              <p className="text-sm text-gray-600">
                Puede seguir distribución Poisson
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-bold text-green-900 mb-2">Productos Defectuosos</h3>
              <p className="text-sm text-gray-700 mb-2">
                <InlineMath math="D \in \{0, 1, 2, \ldots, n\}" />
              </p>
              <p className="text-sm text-gray-600">
                En una muestra de n productos
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-bold text-yellow-900 mb-2">Caras en Monedas</h3>
              <p className="text-sm text-gray-700 mb-2">
                <InlineMath math="Y \in \{0, 1, 2, \ldots, n\}" />
              </p>
              <p className="text-sm text-gray-600">
                Al lanzar n monedas
              </p>
            </div>
          </div>
        </div>

        {/* Simulación Interactiva */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-purple-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Simulación Interactiva: Lanzamiento de Monedas
          </h2>

          <div className="space-y-4">
            <p className="text-gray-700">
              Definimos <InlineMath math="X" /> = "número de caras al lanzar {numMonedas} monedas"
            </p>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-4 flex-wrap">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Número de monedas (n):
                  </label>
                  <input
                    type="number"
                    value={numMonedas}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val >= 1 && val <= 10) {
                        setNumMonedas(val);
                        setMostrarResultados(false);
                      }
                    }}
                    min="1"
                    max="10"
                    className="p-2 border border-gray-300 rounded-md w-24"
                  />
                </div>

                <button
                  onClick={simularMonedas}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Coins size={20} />
                  Simular 1000 Lanzamientos
                </button>
              </div>
            </div>

            {mostrarResultados && (
              <>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Valores posibles: <InlineMath math={`X \\in \\{0, 1, 2, \\ldots, ${numMonedas}\\}`} />
                  </p>
                  <div className="h-64">
                    <Bar 
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Probabilidad'
                            }
                          },
                          x: {
                            title: {
                              display: true,
                              text: 'Número de caras (X)'
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 border-b">k (caras)</th>
                        <th className="px-4 py-2 border-b">P(X = k) Teórica</th>
                        <th className="px-4 py-2 border-b">Frecuencia Empírica</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array(numMonedas + 1).fill(0).map((_, k) => (
                        <tr key={k} className={k % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 text-center border-b font-semibold">{k}</td>
                          <td className="px-4 py-2 text-center border-b font-mono">
                            {probabilidadesTeoricasArray[k].toFixed(4)}
                          </td>
                          <td className="px-4 py-2 text-center border-b font-mono text-green-700">
                            {probabilidadesEmpiricas[k].toFixed(4)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-100 font-semibold">
                      <tr>
                        <td className="px-4 py-2 text-center">SUMA</td>
                        <td className="px-4 py-2 text-center font-mono">
                          {probabilidadesTeoricasArray.reduce((a, b) => a + b, 0).toFixed(4)}
                        </td>
                        <td className="px-4 py-2 text-center font-mono text-green-700">
                          {probabilidadesEmpiricas.reduce((a, b) => a + b, 0).toFixed(4)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Cálculo de Probabilidades */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Cálculo de Probabilidades
          </h2>

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-semibold text-blue-900 mb-2">Probabilidad puntual:</p>
              <BlockMath math="P(X = 3)" />
              <p className="text-sm text-gray-600">
                Probabilidad de que X tome exactamente el valor 3
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <p className="font-semibold text-green-900 mb-2">Probabilidad acumulada:</p>
              <BlockMath math="P(X \leq 3) = P(X=0) + P(X=1) + P(X=2) + P(X=3)" />
              <p className="text-sm text-gray-600">
                Suma de probabilidades hasta el valor 3
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="font-semibold text-purple-900 mb-2">Probabilidad en intervalo:</p>
              <BlockMath math="P(2 \leq X \leq 5) = P(X=2) + P(X=3) + P(X=4) + P(X=5)" />
              <p className="text-sm text-gray-600">
                Suma de probabilidades en el rango
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
                <strong>Valores contables:</strong> Se pueden enumerar (finitos o infinitos)
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-600 font-bold text-xl">•</span>
              <div>
                <strong>PMF:</strong> Función de masa de probabilidad <InlineMath math="p(x) = P(X=x)" />
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-600 font-bold text-xl">•</span>
              <div>
                <strong>Suma = 1:</strong> La suma de todas las probabilidades es 1
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-600 font-bold text-xl">•</span>
              <div>
                <strong>P(X=x) &gt; 0:</strong> Tiene sentido calcular la probabilidad de un valor específico
              </div>
            </li>
          </ul>
        </div>

        {/* Navegación inferior */}
        <div className="flex items-center justify-between">
          <Link 
            to="/conceptos/variables-aleatorias/introduccion"
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft size={20} />
            Anterior
          </Link>
          <Link 
            to="/conceptos/variables-aleatorias/continuas"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Siguiente: Variables Continuas
            <ArrowRight size={20} />
          </Link>
        </div>

      </div>
    </div>
  );
}