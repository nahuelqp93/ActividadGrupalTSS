import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface FormulasNormalProps {
  media?: number;
  desviacion?: number;
  variable?: string;
}

export default function FormulasNormal({ media, desviacion, variable = 'X' }: FormulasNormalProps) {
  return (
    <div className="bg-blue-50 border-l-4 border-black p-4 rounded-lg">
      <h4 className="font-bold text-black mb-3 flex items-center gap-2">
         Distribución Normal {variable && `- ${variable}`}
      </h4>
      
      <div className="space-y-3 text-sm">
        <div>
          <p className="font-semibold text-gray-700 mb-1">Función de densidad:</p>
          <BlockMath math="f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{1}{2}\left(\frac{x-\mu}{\sigma}\right)^2}" />
        </div>

        <div>
          <p className="font-semibold text-gray-700 mb-1">Parámetros:</p>
          <p className="text-gray-700">
            <InlineMath math="\mu" /> = Media (centro de la distribución)
          </p>
          <p className="text-gray-700">
            <InlineMath math="\sigma" /> = Desviación estándar (dispersión)
          </p>
        </div>

        <div>
          <p className="font-semibold text-gray-700 mb-1">Método de transformada inversa:</p>
          <BlockMath math="X = \mu + \sigma \cdot \Phi^{-1}(R)" />
          <p className="text-xs text-gray-600 mt-1">
            donde <InlineMath math="R \sim U(0,1)" /> y <InlineMath math="\Phi^{-1}" /> es la inversa de la CDF normal estándar
          </p>
        </div>

        {media !== undefined && desviacion !== undefined && (
          <div className="bg-white p-3 rounded border border-blue-200">
            <p className="font-semibold text-blue-700 mb-1">Parámetros del ejercicio:</p>
            <p className="text-gray-700">
              Media: <InlineMath math={`\\mu = ${media}`} /> 
            </p>
            <p className="text-gray-700">
              Desviación: <InlineMath math={`\\sigma = ${desviacion}`} /> 
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
