import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface FormulasUniformeProps {
  a?: number; // Límite inferior
  b?: number; // Límite superior
  mostrarEjemplo?: boolean;
}

export default function FormulasUniforme({ a, b, mostrarEjemplo = false }: FormulasUniformeProps) {
  const media = a && b ? (a + b) / 2 : null;

  return (
    <div className="bg-purple-50 border-l-4 border-black p-4 rounded-lg">
      <h4 className="font-bold text-black mb-3 flex items-center gap-2">
      Distribución Uniforme Continua
      </h4>
      
      <div className="space-y-3 text-sm">
        <div>
          <p className="font-semibold text-gray-700 mb-1">Función de densidad:</p>
          <BlockMath math="f(x) = \begin{cases} \frac{1}{b-a} & \text{si } a \leq x \leq b \\ 0 & \text{en otro caso} \end{cases}" />
        </div>

        <div>
          <p className="font-semibold text-gray-700 mb-1">Media y Varianza:</p>
          <BlockMath math="\mu = \frac{a+b}{2}, \quad \sigma^2 = \frac{(b-a)^2}{12}" />
        </div>

        <div>
          <p className="font-semibold text-gray-700 mb-1">Método de transformada inversa:</p>
          <BlockMath math="X = a + (b-a) \cdot R" />
          <p className="text-xs text-gray-600 mt-1">
            donde <InlineMath math="R \sim U(0,1)" /> es un número aleatorio uniforme
          </p>
        </div>

        {a !== undefined && b !== undefined && media && (
          <div className="bg-white p-3 rounded border border-purple-200">
            <p className="font-semibold text-black mb-1">Parámetros del ejercicio:</p>
            <p className="text-gray-700">
              Intervalo: <InlineMath math={`[${a}, ${b}]`} /> minutos
            </p>
            <p className="text-gray-700">
              Media: <InlineMath math={`\\mu = ${media}`} /> minutos
            </p>
          </div>
        )}

        {mostrarEjemplo && a !== undefined && b !== undefined && (
          <div className="bg-yellow-50 p-3 rounded border border-yellow-300 text-xs">
            <p className="font-semibold text-yellow-800 mb-1">💡 Ejemplo de cálculo:</p>
            <p className="text-gray-700">
              Si <InlineMath math="R = 0.7" /> y el intervalo es <InlineMath math={`[${a}, ${b}]`} />:
            </p>
            <p className="text-gray-700 mt-1">
              <InlineMath math={`X = ${a} + (${b}-${a}) \\cdot 0.7 = ${(a + (b-a) * 0.7).toFixed(2)}`} /> minutos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}