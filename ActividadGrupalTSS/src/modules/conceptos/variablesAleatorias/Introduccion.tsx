import { useState } from 'react';
import { ArrowLeft, ArrowRight, Dices } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export default function IntroduccionVA() {
  const [dadoResultado, setDadoResultado] = useState<number | null>(null);
  const [lanzamientos, setLanzamientos] = useState<number[]>([]);

  const lanzarDado = () => {
    const resultado = Math.floor(Math.random() * 6) + 1;
    setDadoResultado(resultado);
    setLanzamientos(prev => [...prev, resultado].slice(-10)); // Últimos 10
  };

  const ejemplos = [
    {
      situacion: 'Lanzamiento de un dado',
      variable: 'X = resultado del dado',
      valores: '{1, 2, 3, 4, 5, 6}',
      tipo: 'Discreta'
    },
    {
      situacion: 'Tiempo de espera en un banco',
      variable: 'T = tiempo en minutos',
      valores: '[0, ∞)',
      tipo: 'Continua'
    },
    {
      situacion: 'Número de clientes por hora',
      variable: 'N = cantidad de clientes',
      valores: '{0, 1, 2, 3, ...}',
      tipo: 'Discreta'
    },
    {
      situacion: 'Temperatura del día',
      variable: 'Y = temperatura en °C',
      valores: '(-∞, ∞)',
      tipo: 'Continua'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navegación */}
        <div className="flex items-center justify-between">
          <Link 
            to="/conceptos"
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft size={20} />
            Volver a Conceptos
          </Link>
          <Link 
            to="/conceptos/variables-aleatorias/discretas"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Siguiente: Variables Discretas
            <ArrowRight size={20} />
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-200">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            1.1 Introducción a Variables Aleatorias
          </h1>
          <p className="text-gray-600">
            Conceptos fundamentales sobre variables aleatorias y su representación matemática
          </p>
        </div>

        {/* ¿Qué es una Variable Aleatoria? */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¿Qué es una Variable Aleatoria?
          </h2>

          <div className="space-y-4">
            <p className="text-gray-700">
              Una <strong>variable aleatoria</strong> es una función que asigna un valor numérico 
              a cada resultado de un experimento aleatorio.
            </p>

            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm font-semibold text-blue-900 mb-2">Definición Formal:</p>
              <p className="text-sm text-gray-700">
                Una variable aleatoria <InlineMath math="X" /> es una función que mapea los resultados 
                del espacio muestral <InlineMath math="\Omega" /> al conjunto de números reales <InlineMath math="\mathbb{R}" />:
              </p>
              <BlockMath math="X: \Omega \rightarrow \mathbb{R}" />
            </div>

            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <p className="text-sm font-semibold text-green-900 mb-2">Definición Intuitiva:</p>
              <p className="text-sm text-gray-700">
                Es simplemente un <strong>número que depende del azar</strong>. No sabemos su valor exacto 
                hasta que ocurre el experimento, pero sí conocemos sus posibles valores y sus probabilidades.
              </p>
            </div>
          </div>
        </div>

        {/* Ejemplo Interactivo: Dado */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-purple-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ejemplo Interactivo: Lanzamiento de un Dado
          </h2>

          <div className="space-y-4">
            <p className="text-gray-700">
              Definimos la variable aleatoria <InlineMath math="X" /> = "resultado del dado"
            </p>

            <div className="flex items-center justify-center gap-6 p-6 bg-purple-50 rounded-lg">
              <button
                onClick={lanzarDado}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Dices size={24} />
                Lanzar Dado
              </button>

              {dadoResultado && (
                <div className="text-center">
                  <div className="w-24 h-24 bg-white border-4 border-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-5xl font-bold text-purple-900">{dadoResultado}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    <InlineMath math={`X = ${dadoResultado}`} />
                  </p>
                </div>
              )}
            </div>

            {lanzamientos.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Últimos {lanzamientos.length} lanzamientos:
                </p>
                <div className="flex gap-2 flex-wrap">
                  {lanzamientos.map((valor, idx) => (
                    <span key={idx} className="inline-block px-3 py-1 bg-purple-100 text-purple-900 rounded font-mono">
                      {valor}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Cada valor es una <strong>realización</strong> de la variable aleatoria X
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Ejemplos del Mundo Real */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ejemplos del Mundo Real
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Situación</th>
                  <th className="px-4 py-3 text-left font-semibold">Variable Aleatoria</th>
                  <th className="px-4 py-3 text-left font-semibold">Valores Posibles</th>
                  <th className="px-4 py-3 text-left font-semibold">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {ejemplos.map((ejemplo, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 border-t">{ejemplo.situacion}</td>
                    <td className="px-4 py-3 border-t font-mono text-blue-700">{ejemplo.variable}</td>
                    <td className="px-4 py-3 border-t font-mono">{ejemplo.valores}</td>
                    <td className="px-4 py-3 border-t">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        ejemplo.tipo === 'Discreta' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {ejemplo.tipo}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notación Matemática */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Notación Matemática
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-semibold text-blue-900 mb-2">Variable Aleatoria</p>
                <BlockMath math="X, Y, Z, \ldots" />
                <p className="text-xs text-gray-600 mt-2">Letras mayúsculas</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <p className="font-semibold text-green-900 mb-2">Valor Específico</p>
                <BlockMath math="x, y, z, \ldots" />
                <p className="text-xs text-gray-600 mt-2">Letras minúsculas</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="font-semibold text-purple-900 mb-2">Probabilidad</p>
                <BlockMath math="P(X = x)" />
                <p className="text-xs text-gray-600 mt-2">Probabilidad de que X tome el valor x</p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="font-semibold text-yellow-900 mb-2">Probabilidad de Intervalo</p>
                <BlockMath math="P(a \leq X \leq b)" />
                <p className="text-xs text-gray-600 mt-2">Probabilidad de que X esté entre a y b</p>
              </div>
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
                <strong>Variable aleatoria:</strong> Función que asigna números a resultados aleatorios
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-600 font-bold text-xl">•</span>
              <div>
                <strong>Espacio muestral (Ω):</strong> Conjunto de todos los resultados posibles
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-600 font-bold text-xl">•</span>
              <div>
                <strong>Realización:</strong> Un valor específico que toma la variable aleatoria
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-600 font-bold text-xl">•</span>
              <div>
                <strong>Tipos principales:</strong> Discretas (valores contables) y Continuas (valores en intervalos)
              </div>
            </li>
          </ul>
        </div>

        {/* Navegación inferior */}
        <div className="flex items-center justify-between">
          <Link 
            to="/conceptos"
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft size={20} />
            Volver a Conceptos
          </Link>
          <Link 
            to="/conceptos/variables-aleatorias/discretas"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Siguiente: Variables Discretas
            <ArrowRight size={20} />
          </Link>
        </div>

      </div>
    </div>
  );
}