import { useState } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { BotonVolver } from '../components/BotonVolver.tsx';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function FuncionCDF() {
  const [tipoVariable, setTipoVariable] = useState<'discreta' | 'continua'>('discreta');
  
  // Parámetros para Normal (Continua)
  const [mu, setMu] = useState(0);
  const [sigma, setSigma] = useState(1);

  // Generar datos para CDF Discreta (Ejemplo: Lanzamiento de dos monedas)
  // X = número de caras {0, 1, 2}
  // P(X=0)=0.25, P(X=1)=0.5, P(X=2)=0.25
  const generarCDFDiscreta = () => {
    // Para el gráfico escalonado necesitamos puntos extendidos
    return {
      labels: ['-1', '0', '1', '2', '3'],
      datos: [0, 0.25, 0.75, 1, 1]
    };
  };

  // Función de error aproximada para la CDF Normal
  const erf = (x: number) => {
    // Aproximación de Abramowitz and Stegun
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;
    const sign = (x >= 0) ? 1 : -1;
    x = Math.abs(x);
    const t = 1.0 / (1.0 + p*x);
    const y = 1.0 - (((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t*Math.exp(-x*x);
    return sign * y;
  };

  // Generar datos para CDF Continua (Normal)
  const generarCDFContinua = () => {
    const puntos = 100;
    const datos = [];
    const rango = 4 * sigma; // graficar +/- 4 desviaciones estándar
    const min = mu - rango;
    const max = mu + rango;
    const step = (max - min) / puntos;

    for (let i = 0; i <= puntos; i++) {
      const x = min + i * step;
      // CDF de normal usando erf: F(x) = 0.5 * (1 + erf((x-mu)/(sigma*sqrt(2))))
      const z = (x - mu) / (sigma * Math.sqrt(2));
      const y = 0.5 * (1 + erf(z));
      datos.push({ x: x.toFixed(2), y });
    }
    return datos;
  };

  const dataDiscreta = generarCDFDiscreta();
  const dataContinua = generarCDFContinua();

  const chartData = {
    labels: tipoVariable === 'discreta' ? dataDiscreta.labels : dataContinua.map(d => d.x),
    datasets: [{
      label: tipoVariable === 'discreta' ? 'F(x) - Acumulada Discreta' : 'F(x) - Acumulada Continua',
      data: tipoVariable === 'discreta' ? dataDiscreta.datos : dataContinua.map(d => d.y),
      borderColor: tipoVariable === 'discreta' ? 'rgb(234, 88, 12)' : 'rgb(147, 51, 234)',
      backgroundColor: tipoVariable === 'discreta' ? 'rgba(234, 88, 12, 0.1)' : 'rgba(147, 51, 234, 0.1)',
      borderWidth: 3,
      // Aquí está la magia para la discreta: stepped chart
      stepped: tipoVariable === 'discreta' ? true : false,
      pointRadius: tipoVariable === 'discreta' ? 4 : 0,
      fill: true
    }]
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
        <div className="print:hidden"> 
           <BotonVolver />
        </div>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-orange-200">
          <h1 className="text-3xl font-bold text-orange-900 mb-2">
            2.2 Función de Distribución Acumulada (CDF)
          </h1>
          <p className="text-gray-600">
            La probabilidad de que la variable aleatoria tome un valor menor o igual a x.
          </p>
        </div>

        {/* Definición Matemática */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Definición Fundamental
          </h2>
          
          <div className="bg-orange-50 p-6 rounded-lg text-center mb-6">
            <BlockMath math="F(x) = P(X \leq x)" />
            <p className="text-gray-700 mt-2">
              "F mayúscula" siempre denota la función acumulada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border p-4 rounded-lg bg-white">
              <h3 className="font-bold text-gray-800 border-b pb-2 mb-2">Caso Discreto</h3>
              <BlockMath math="F(x) = \sum_{t \leq x} p(t)" />
              <p className="text-sm text-gray-600 mt-2">
                Suma de probabilidades puntuales. El gráfico es una <strong>escalera</strong>.
              </p>
            </div>
            
            <div className="border p-4 rounded-lg bg-white">
              <h3 className="font-bold text-gray-800 border-b pb-2 mb-2">Caso Continuo</h3>
              <BlockMath math="F(x) = \int_{-\infty}^{x} f(t) dt" />
              <p className="text-sm text-gray-600 mt-2">
                Integral de la densidad. El gráfico es una <strong>curva suave en forma de S</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Visualización Interactiva */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-indigo-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Visualizador de Acumulación
          </h2>

          <div className="space-y-6">
            {/* Controles */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setTipoVariable('discreta')}
                  className={`px-4 py-2 rounded-md transition-all ${
                    tipoVariable === 'discreta' 
                    ? 'bg-white text-orange-600 shadow-sm font-bold' 
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Discreta (Escalera)
                </button>
                <button
                  onClick={() => setTipoVariable('continua')}
                  className={`px-4 py-2 rounded-md transition-all ${
                    tipoVariable === 'continua' 
                    ? 'bg-white text-purple-600 shadow-sm font-bold' 
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Continua (Curva S)
                </button>
              </div>

              {tipoVariable === 'continua' && (
                <div className="flex gap-4 items-center bg-purple-50 px-4 rounded-lg flex-1">
                  <span className="text-sm font-bold text-purple-900">Normal(μ, σ):</span>
                  <div className="flex items-center gap-2">
                    <label className="text-xs">μ:</label>
                    <input 
                      type="number" 
                      value={mu} 
                      onChange={(e) => setMu(Number(e.target.value))}
                      className="w-16 p-1 rounded border border-purple-200"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs">σ:</label>
                    <input 
                      type="number" 
                      value={sigma} 
                      onChange={(e) => setSigma(Number(e.target.value))}
                      min="0.1"
                      step="0.1"
                      className="w-16 p-1 rounded border border-purple-200"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Gráfico */}
            <div className="h-80 bg-white border border-gray-200 rounded-lg p-4 relative">
              <Line 
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      min: 0,
                      max: 1.1, // Un poco más de 1 para ver el techo
                      title: { display: true, text: 'Probabilidad Acumulada F(x)' }
                    },
                    x: {
                      title: { display: true, text: 'Valor de x' }
                    }
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: (context) => `P(X ≤ ${context.label}) = ${Number(context.raw).toFixed(3)}`
                      }
                    }
                  }
                }}
              />
              {/* Overlay explicativo */}
              <div className="absolute top-4 right-4 bg-white/90 p-2 text-xs border border-gray-200 rounded shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-gray-300"></div>
                  <span>Límite superior = 1</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-300"></div>
                  <span>Límite inferior = 0</span>
                </div>
              </div>
            </div>

            {/* Explicación del Gráfico */}
            <div className={`p-4 rounded-lg border-l-4 ${
              tipoVariable === 'discreta' ? 'bg-orange-50 border-orange-500' : 'bg-purple-50 border-purple-500'
            }`}>
              {tipoVariable === 'discreta' ? (
                <div>
                  <h4 className="font-bold text-orange-900">¿Por qué parece una escalera?</h4>
                  <p className="text-sm text-gray-700 mt-1">
                    En variables discretas, la probabilidad acumulada se mantiene constante entre los valores posibles y da un "salto" súbito cada vez que alcanzamos un valor con probabilidad positiva (ej. sacar 1, 2, 3...).
                    Se dice que es <strong>continua por la derecha</strong>.
                  </p>
                </div>
              ) : (
                <div>
                  <h4 className="font-bold text-purple-900">La curva Sigmoide (Forma de S)</h4>
                  <p className="text-sm text-gray-700 mt-1">
                    En variables continuas, la acumulación es suave. Nota cómo la curva es más empinada donde hay más densidad de probabilidad (la "campana" de la PDF) y se aplana en los extremos donde la probabilidad es baja.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Propiedades Clave */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-green-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Propiedades Universales
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <li className="bg-green-50 p-3 rounded-md">
              <span className="font-bold text-green-700 block mb-2">No decreciente</span>
              <p className="text-sm text-gray-600">
                <InlineMath math="x_1 < x_2 \Rightarrow F(x_1) \leq F(x_2)" />. La probabilidad acumulada nunca puede disminuir.
              </p>
            </li>
            <li className="bg-green-50 p-3 rounded-md">
              <span className="font-bold text-green-700 block mb-2">Límites</span>
              <p className="text-sm text-gray-600">
                <InlineMath math="\lim_{x \to -\infty} F(x) = 0" /><br/>
                <InlineMath math="\lim_{x \to \infty} F(x) = 1" />
              </p>
            </li>
            <li className="bg-green-50 p-3 rounded-md">
              <span className="font-bold text-green-700 block mb-2">Cálculo de Intervalos</span>
              <p className="text-sm text-gray-600">
                <InlineMath math="P(a < X \leq b) = F(b) - F(a)" />
                <br/>
                ¡Fórmula fundamental para calcular probabilidades!
              </p>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}