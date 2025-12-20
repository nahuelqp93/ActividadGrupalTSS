import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface FormulasBinomialProps {
  n?: number;
  p?: number;
}

export default function FormulasBinomial({ n, p }: FormulasBinomialProps) {
  return (
    <div className="bg-blue-50 border-l-4 border-black p-4 rounded-lg">
      <h4 className="font-bold text-black mb-3 flex items-center gap-2">
         Distribución Binomial
      </h4>
      
      <div className="space-y-3 text-sm">
        <div>
          <p className="font-semibold text-gray-700 mb-1">Función de probabilidad:</p>
          <BlockMath math="P(X = k) = \binom{n}{k} p^k (1-p)^{n-k}" />
          <p className="text-xs text-gray-600 mt-1">
            donde <InlineMath math="\binom{n}{k} = \frac{n!}{k!(n-k)!}" />
          </p>
        </div>

        <div>
          <p className="font-semibold text-gray-700 mb-1">Parámetros:</p>
          <p className="text-gray-700">
            <InlineMath math="n" /> = Número de ensayos
          </p>
          <p className="text-gray-700">
            <InlineMath math="p" /> = Probabilidad de éxito en cada ensayo
          </p>
        </div>

        <div>
          <p className="font-semibold text-gray-700 mb-1">Propiedades:</p>
          <p className="text-gray-700">
            Media: <InlineMath math="\mu = np" />
          </p>
          <p className="text-gray-700">
            Varianza: <InlineMath math="\sigma^2 = np(1-p)" />
          </p>
        </div>

        <div>
          <p className="font-semibold text-gray-700 mb-1">Generación por transformada inversa:</p>
          <p className="text-xs text-gray-600">
            1. Generar <InlineMath math="R \sim U(0,1)" />
          </p>
          <p className="text-xs text-gray-600">
            2. Encontrar <InlineMath math="k" /> tal que <InlineMath math="\sum_{i=0}^{k-1} P(X=i) < R \leq \sum_{i=0}^{k} P(X=i)" />
          </p>
        </div>

        {n !== undefined && p !== undefined && (
          <div className="bg-white p-3 rounded border border-blue-200">
            <p className="font-semibold text-blue-700 mb-1">Parámetros del ejercicio:</p>
            <p className="text-gray-700">
              <InlineMath math={`n = ${n}`} /> ensayos
            </p>
            <p className="text-gray-700">
              <InlineMath math={`p = ${p}`} /> probabilidad
            </p>
            <p className="text-gray-700 text-xs mt-1">
              La media de demanda diaria esperada es: <InlineMath math={`\\mu = ${(n * p).toFixed(2)}`} />
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
