import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface FormulasExponencialProps {
  media?: number; // Media en minutos
  mostrarEjemplo?: boolean;
}

export default function FormulasExponencial({ media, mostrarEjemplo = false }: FormulasExponencialProps) {
  const lambda = media ? 1 / media : null;

  return (
    <div className="bg-green-50 border-l-4 border-black p-4 rounded-lg">
      <h4 className="font-bold text-black mb-3 flex items-center gap-2">
         Distribución Exponencial - Tiempos de Servicio
      </h4>
      
      <div className="space-y-3 text-sm">
        <div>
          <p className="font-semibold text-gray-700 mb-1">Función de densidad:</p>
          <BlockMath math="f(x) = \lambda e^{-\lambda x}, \quad x \geq 0" />
        </div>

        <div>
          <p className="font-semibold text-gray-700 mb-1">Media y parámetro:</p>
          <BlockMath math="\mu = \frac{1}{\lambda}, \quad \lambda = \frac{1}{\mu}" />
        </div>

        <div>
          <p className="font-semibold text-gray-700 mb-1">Método de transformada inversa:</p>
          <BlockMath math="X = -\frac{1}{\lambda} \ln(R) = -\mu \ln(R)" />
          <p className="text-xs text-gray-600 mt-1">
            donde <InlineMath math="R \sim U(0,1)" /> es un número aleatorio uniforme
          </p>
        </div>

        {media && lambda && (
          <div className="bg-white p-3 rounded border border-green-200">
            <p className="font-semibold text-green-700 mb-1">Parámetros del ejercicio:</p>
            <p className="text-gray-700">
              Media: <InlineMath math={`\\mu = ${media}`} /> minutos
            </p>
            <p className="text-gray-700">
              Tasa: <InlineMath math={`\\lambda = ${lambda.toFixed(4)}`} /> por minuto
            </p>
          </div>
        )}

        {mostrarEjemplo && media && (
          <div className="bg-yellow-50 p-3 rounded border border-yellow-300 text-xs">
            <p className="font-semibold text-yellow-800 mb-1">💡 Ejemplo de cálculo:</p>
            <p className="text-gray-700">
              Si <InlineMath math="R = 0.3" /> y <InlineMath math={`\\mu = ${media}`} /> minutos:
            </p>
            <p className="text-gray-700 mt-1">
              <InlineMath math={`X = -${media} \\ln(0.3) = ${(-media * Math.log(0.3)).toFixed(2)}`} /> minutos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}