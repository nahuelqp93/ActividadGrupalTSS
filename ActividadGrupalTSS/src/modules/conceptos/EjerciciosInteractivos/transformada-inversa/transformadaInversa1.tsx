import { useState } from 'react';
import { RefreshCcw, BookOpen, Calculator } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export default function Ejercicio1TransformadaInversa() {
  const [simulacion, setSimulacion] = useState<any[]>([]);
  
  const generarAleatorio = () => Math.random();

  // Función inversa x = 3 + ∛(54R - 27)
  const calcularRaizCubica = (num: number): number => {
    if (num >= 0) {
      return Math.pow(num, 1/3);
    } else {
      return -Math.pow(-num, 1/3);
    }
  };

  const funcionInversa = (R: number): number => {
    const valor = 54 * R - 27;
    return 3 + calcularRaizCubica(valor);
  };

  // Simulación del método de transformada inversa
  const simularTransformadaInversa = () => {
    const resultados = [];

    for (let i = 1; i <= 10; i++) {
      const R = generarAleatorio();
      const X = funcionInversa(R);
      
      // Verificación de que X está en el rango válido [0, 6]
      const valido = R >= 0 && R <= 1 && X >= 0 && X <= 6;
      
      resultados.push({ 
        i, 
        R: parseFloat(R.toFixed(4)), 
        X: parseFloat(X.toFixed(4)),
        valido,
        pasoDetalle: `R = ${R.toFixed(4)} → X = 3 + ∛(54×${R.toFixed(4)} - 27) = ${X.toFixed(4)}`
      });
    }
    setSimulacion(resultados);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto space-y-8">

        <div className="flex items-center justify-between">
           <h1 className="text-2xl font-bold text-slate-900">Ejercicio 1.1: Método de Transformada Inversa</h1>
           <div className="text-sm text-slate-500 text-right">
             <span className="block font-bold">Parámetros:</span>
             f(x) = (x-3)²/18, dominio [0,6]
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-blue-600"/>
            Teoría del Método
          </h2>
          
          <div className="space-y-4 text-sm">
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="font-bold mb-2">1. Función de Densidad de Probabilidad (PDF)</p>
              <BlockMath math="f(x) = \frac{(x-3)^2}{18}, \quad 0 \leq x \leq 6" />
            </div>

            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <p className="font-bold mb-2">2. Función de Distribución Acumulada (CDF)</p>
              <p className="mb-2">Integrando la función de densidad:</p>
              <BlockMath math="F(x) = \int_0^x \frac{(t-3)^2}{18} \, dt = \frac{(x-3)^3 + 27}{54}" />
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
              <p className="font-bold mb-2">3. Función Inversa (despejando x)</p>
              <p className="mb-2">Igualamos F(x) = R y despejamos x:</p>
              <BlockMath math="R = \frac{(x-3)^3 + 27}{54}" />
              <BlockMath math="54R = (x-3)^3 + 27" />
              <BlockMath math="54R - 27 = (x-3)^3" />
              <BlockMath math="\sqrt[3]{54R - 27} = x - 3" />
              <BlockMath math="x = 3 + \sqrt[3]{54R - 27}" />
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
              <p className="font-bold mb-2">4. Criterio de Validación</p>
              <p>Si <InlineMath math="0 \leq R \leq 1" /> y <InlineMath math="0 \leq x \leq 6" />, entonces aceptamos x como muestra válida.</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Calculator size={20} className="text-green-600"/>
            Simulación Interactiva
          </h2>
          
          <button
            onClick={simularTransformadaInversa}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <RefreshCcw size={20} />
            Generar 10 Muestras Aleatorias
          </button>
        </div>

        {simulacion.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Resultados de la Simulación</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border p-3 text-left">N°</th>
                    <th className="border p-3 text-left">Valor R</th>
                    <th className="border p-3 text-left">Cálculo</th>
                    <th className="border p-3 text-left">Valor X</th>
                    <th className="border p-3 text-left">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {simulacion.map((fila) => (
                    <tr key={fila.i} className={fila.i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="border p-3 font-mono">{fila.i}</td>
                      <td className="border p-3 font-mono">{fila.R}</td>
                      <td className="border p-3 text-xs font-mono text-slate-600">{fila.pasoDetalle}</td>
                      <td className="border p-3 font-mono font-bold text-blue-700">{fila.X}</td>
                      <td className="border p-3">
                        {fila.valido ? (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                            ✓ Válido
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold">
                            ✗ Fuera de rango
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="font-bold text-slate-700 mb-2">Resumen Estadístico</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Total muestras:</span>
                  <span className="ml-2 font-bold text-blue-600">{simulacion.length}</span>
                </div>
                <div>
                  <span className="text-slate-600">Válidas:</span>
                  <span className="ml-2 font-bold text-green-600">
                    {simulacion.filter(f => f.valido).length}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600">Promedio X:</span>
                  <span className="ml-2 font-bold text-purple-600">
                    {(simulacion.reduce((sum, f) => sum + f.X, 0) / simulacion.length).toFixed(4)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600">Tasa éxito:</span>
                  <span className="ml-2 font-bold text-orange-600">
                    {((simulacion.filter(f => f.valido).length / simulacion.length) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
          <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
            <BookOpen size={18} />
            Nota Importante
          </h3>
          <p className="text-sm text-blue-800">
            El método de <strong>Transformada Inversa</strong> es exacto y eficiente cuando se conoce 
            la función inversa F⁻¹(R). A diferencia del método de rechazo, no hay valores rechazados, 
            por lo que cada número aleatorio R genera directamente una muestra válida X.
          </p>
        </div>

      </div>
    </div>
  );
}
