
import { BlockMath, InlineMath } from 'react-katex';

export const ExplicacionExponencial = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-6 mt-6">
      <h3 className="text-lg font-bold text-slate-800 border-b pb-2">
        ¿De dónde sale la fórmula?
      </h3>

      <div className="text-sm text-slate-600 space-y-4">
        <p>
          Para simular el tiempo de espera, usamos el <strong>Método de la Transformada Inversa</strong>. 
          Básicamente, despejamos la <InlineMath math="x" /> (tiempo) de la función de probabilidad acumulada.
        </p>

        {/* PASO 1 */}
        <div className="bg-slate-50 p-4 rounded border-l-4 border-slate-400">
          <h4 className="font-bold text-slate-800 mb-2">Paso 1: La Acumulada (CDF)</h4>
          <p className="mb-2">
            La probabilidad de que el evento ocurra <em>antes</em> de un tiempo <InlineMath math="x" /> es:
          </p>
          <BlockMath math="F(x) = 1 - e^{-\lambda x}" />
          <p className="text-xs text-gray-500">
            (Donde <InlineMath math="e" /> es la constante de Euler y <InlineMath math="\lambda" /> es la tasa promedio).
          </p>
        </div>

        {/* PASO 2 */}
        <div className="bg-slate-50 p-4 rounded border-l-4 border-slate-400">
          <h4 className="font-bold text-slate-800 mb-2">Paso 2: Igualar a Random (R)</h4>
          <p className="mb-2">
            Como <InlineMath math="F(x)" /> es una probabilidad (va de 0 a 1), la igualamos a nuestro número aleatorio generado por la computadora:
          </p>
          <BlockMath math="1 - e^{-\lambda x} = R" />
        </div>

        {/* PASO 3 */}
        <div className="bg-green-50 p-4 rounded border-l-4 border-green-500">
          <h4 className="font-bold text-green-900 mb-2">Paso 3: El Despeje (La Inversa)</h4>
          <p className="mb-2 text-green-800">
            Ahora usamos álgebra para dejar la <InlineMath math="x" /> sola. Aquí entra el <strong>Logaritmo Natural</strong> (<InlineMath math="\ln" />) para eliminar la exponencial:
          </p>
          
          <div className="pl-4 border-l-2 border-green-200 my-2 italic space-y-1">
            <p>1. Reordenamos: <InlineMath math="e^{-\lambda x} = 1 - R" /></p>
            <p>2. Aplicamos Logaritmo: <InlineMath math="-\lambda x = \ln(1 - R)" /></p>
            <p>3. Dividimos por lambda:</p>
          </div>

          <div className="bg-white p-3 rounded border border-green-200 mt-3 text-center">
             <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Fórmula Final</span>
             <BlockMath math="x = -\frac{1}{\lambda} \ln(1 - R)" />
          </div>
          
          <p className="mt-2 text-xs text-green-700">
            *Esta fórmula transforma un número uniforme <InlineMath math="R" /> en un tiempo de espera exponencial.
          </p>
        </div>

      </div>
    </div>
  );
};