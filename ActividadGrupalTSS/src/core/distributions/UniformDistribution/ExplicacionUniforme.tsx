import { BlockMath, InlineMath } from 'react-katex';

export const ExplicacionUniforme = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-6 mt-6">
      <h3 className="text-lg font-bold text-slate-800 border-b pb-2">
        ¿Por qué usamos esta fórmula? (Transformada Inversa)
      </h3>

      <div className="text-sm text-slate-600 space-y-4">
        <p>
          A diferencia de distribuciones complejas, la Uniforme se puede resolver despejando <InlineMath math="x" /> directamente.
          Este proceso se llama <strong>Método de la Transformada Inversa</strong> y consta de 3 pasos:
        </p>

        {/* PASO 1 */}
        <div className="bg-slate-50 p-4 rounded border-l-4 border-slate-400">
          <h4 className="font-bold text-slate-800 mb-2">Paso 1: La Función de Densidad (PDF)</h4>
          
          <p className="mb-2">
            Queremos que todos los números entre <InlineMath math="a" /> y <InlineMath math="b" /> tengan la misma probabilidad.
            Para que el área total sea 1, la altura del rectángulo debe ser:
          </p>
          <BlockMath math="f(x) = \frac{1}{b - a}" />
        </div>

        {/* PASO 2 */}
        <div className="bg-slate-50 p-4 rounded border-l-4 border-slate-400">
          <h4 className="font-bold text-slate-800 mb-2">Paso 2: La Función Acumulada (CDF)</h4>
          
          <p className="mb-2">
            Integramos la función anterior para obtener la probabilidad acumulada hasta un punto <InlineMath math="x" />.
            Esto nos da una línea recta ascendente (una rampa):
          </p>
          <BlockMath math="F(x) = \int_a^x \frac{1}{b-a} dx = \frac{x - a}{b - a}" />
        </div>

        {/* PASO 3 */}
        <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-500">
          <h4 className="font-bold text-blue-900 mb-2">Paso 3: La Inversa (El Despeje)</h4>
          <p className="mb-2 text-blue-800">
            Aquí ocurre la magia. Igualamos la acumulada <InlineMath math="F(x)" /> a nuestro número aleatorio <InlineMath math="R" /> (o <InlineMath math="U" />) y despejamos <InlineMath math="x" />.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
               <p className="text-xs text-gray-500 uppercase font-bold">La Ecuación:</p>
               <BlockMath math="\frac{x - a}{b - a} = R" />
            </div>
            <div>
               <p className="text-xs text-gray-500 uppercase font-bold">El Despeje Final:</p>
               <BlockMath math="x = a + (b - a)R" />
            </div>
          </div>
          
          <p className="mt-2 text-xs text-blue-700 italic">
            *Esta es exactamente la línea de código que tienes en tu función <code>uniformSample</code>.
          </p>
        </div>

      </div>
    </div>
  );
};