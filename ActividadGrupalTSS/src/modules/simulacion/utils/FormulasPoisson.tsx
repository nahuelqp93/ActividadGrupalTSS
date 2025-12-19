import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface FormulasPoissonProps {
  lambda?: number; // Tasa de llegadas (clientes por hora)
  mostrarEjemplo?: boolean;
  unidad?: string; // Unidad de tiempo (ej: "clientes por hora", "días")
}

export default function FormulasPoisson({ lambda, mostrarEjemplo = false, unidad = "clientes por hora" }: FormulasPoissonProps) {
  return (
    <div className="bg-blue-50 border-l-4 border-black p-4 rounded-lg">
      <h4 className="font-bold text-black mb-3 flex items-center gap-2">
         Distribución de Poisson
      </h4>
      
      <div className="space-y-3 text-sm">
        <div>
          <p className="font-semibold text-gray-700 mb-1">Función de probabilidad:</p>
          <BlockMath math="P(X = k) = \frac{\lambda^k e^{-\lambda}}{k!}" />
        </div>

        <div>
          <p className="font-semibold text-gray-700 mb-1">Tiempo entre llegadas (Exponencial):</p>
          <BlockMath math="T \sim \text{Exp}(\lambda), \quad f(t) = \lambda e^{-\lambda t}" />
        </div>

        <div>
          <p className="font-semibold text-gray-700 mb-1">Generación del tiempo:</p>
          <BlockMath math="T = -\frac{1}{\lambda} \ln(R)" />
          <p className="text-xs text-gray-600 mt-1">
            donde <InlineMath math="R \sim U(0,1)" /> es un número aleatorio uniforme
          </p>
        </div>

        {lambda && (
          <div className="bg-white p-3 rounded border border-blue-200">
            <p className="font-semibold text-blue-700 mb-1">Parámetros del ejercicio:</p>
            <p className="text-gray-700">
              <InlineMath math={`\\lambda = ${lambda}`} /> {unidad}
            </p>
            {unidad === "clientes por hora" && (
              <p className="text-gray-700 text-xs mt-1">
                Tiempo promedio entre llegadas: <InlineMath math={`\\frac{1}{\\lambda} = ${(60/lambda).toFixed(2)}`} /> minutos
              </p>
            )}
            {unidad === "días" && (
              <p className="text-gray-700 text-xs mt-1">
                Tiempo de entrega promedio de {lambda} días
              </p>
            )}
          </div>
        )}

        {mostrarEjemplo && (
          <div className="bg-yellow-50 p-3 rounded border border-yellow-300 text-xs">
            <p className="font-semibold text-yellow-800 mb-1">💡 Ejemplo de cálculo:</p>
            <p className="text-gray-700">
              Si <InlineMath math="R = 0.5" /> y <InlineMath math="\lambda = 20/60 = 0.333" /> (por minuto):
            </p>
            <p className="text-gray-700 mt-1">
              <InlineMath math="T = -\frac{1}{0.333} \ln(0.5) = 2.08" /> minutos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}