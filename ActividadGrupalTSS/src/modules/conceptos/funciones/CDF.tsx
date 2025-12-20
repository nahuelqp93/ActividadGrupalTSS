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
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { BotonVolver } from '../components/BotonVolver.tsx';
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

type VariableType = 'discreta' | 'continua';

interface DataPoint {
  x: string;
  y: number;
}

export default function FuncionCDFUniforme() {
  const [tipoVariable, setTipoVariable] = useState<VariableType>('continua');

  const [a, setA] = useState(0);
  const [b, setB] = useState(10);
  const [xEval, setXEval] = useState(5);

  /* ===================== DATOS ===================== */

  const generarCDFDiscreta = (): DataPoint[] => {
    const valores = [1, 2, 3, 4, 5, 6];
    const datos: DataPoint[] = [];

    for (let x = 0; x <= 7; x += 0.1) {
      let F = 0;
      for (const v of valores) {
        if (v <= x) F += 1 / 6;
      }
      datos.push({ x: x.toFixed(2), y: F });
    }
    return datos;
  };

  const generarCDFContinua = (): DataPoint[] => {
    const puntos = 200;
    const datos: DataPoint[] = [];
    const min = a - 2;
    const max = b + 2;
    const step = (max - min) / puntos;

    for (let i = 0; i <= puntos; i++) {
      const x = min + i * step;
      let F = 0;
      if (x < a) F = 0;
      else if (x <= b) F = (x - a) / (b - a);
      else F = 1;
      datos.push({ x: x.toFixed(2), y: F });
    }
    return datos;
  };

  const datosDiscretos = generarCDFDiscreta();
  const datosContinuos = generarCDFContinua();

  const F_x =
    xEval < a ? 0 :
    xEval > b ? 1 :
    (xEval - a) / (b - a);

  const chartData = {
    labels:
      tipoVariable === 'discreta'
        ? datosDiscretos.map(d => d.x)
        : datosContinuos.map(d => d.x),
    datasets: [{
      label: 'F(x)',
      data:
        tipoVariable === 'discreta'
          ? datosDiscretos.map(d => d.y)
          : datosContinuos.map(d => d.y),
      stepped: tipoVariable === 'discreta',
      pointRadius: tipoVariable === 'discreta' ? 3 : 0,
      borderWidth: 3,
      fill: true,
      borderColor:
        tipoVariable === 'discreta'
          ? 'rgb(234, 88, 12)'
          : 'rgb(147, 51, 234)',
      backgroundColor:
        tipoVariable === 'discreta'
          ? 'rgba(234, 88, 12, 0.1)'
          : 'rgba(147, 51, 234, 0.1)'
    }]
  };

  /* ===================== UI ===================== */

  return (
    <div className="min-h-screen bg-slate-50 p-6">
        <div className="print:hidden"> 
           <BotonVolver />
        </div>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-indigo-200">
          <h1 className="text-3xl font-bold text-indigo-900 mb-2">
            Función de Distribución Acumulada (CDF)
          </h1>
          <p className="text-gray-600">
            La CDF describe la probabilidad acumulada de una variable aleatoria.
          </p>
        </div>

        {/* DEFINICIÓN */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
          <h2 className="text-2xl font-bold mb-4">
            Definición Formal
          </h2>

          <p className="text-gray-700 mb-4 text-justify">
            La <strong>Función de Distribución Acumulada</strong>, denotada por{' '}
            <InlineMath math="F(x)" />, representa la probabilidad de que una
            variable aleatoria <InlineMath math="X" /> tome un valor menor o igual
            que <InlineMath math="x" />. Esta función caracteriza completamente
            la distribución de probabilidad de una variable aleatoria real.
          </p>

          <div className="bg-indigo-50 p-6 rounded-lg text-center mb-4">
            <BlockMath math="F(x) = P(X \le x)" />
          </div>

          <p className="text-gray-700 text-justify">
            A diferencia de la función de probabilidad o densidad, que describe
            la probabilidad en un punto específico, la CDF <strong>acumula</strong>{' '}
            toda la probabilidad desde <InlineMath math="-\infty" /> hasta{' '}
            <InlineMath math="x" />.
          </p>
        </div>

        {/* DISCRETA VS CONTINUA */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-orange-200">
          <h2 className="text-2xl font-bold mb-4">
            Casos según el Tipo de Variable
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-bold mb-2 text-orange-900">
                Variable Aleatoria Discreta
              </h3>
              <BlockMath math="F(x) = \sum_{t \le x} p(t)" />
              <p className="text-sm text-gray-700 mt-2 text-justify">
                La función acumulada se obtiene sumando las probabilidades
                puntuales de todos los valores menores o iguales a{' '}
                <InlineMath math="x" />. El gráfico resultante es una{' '}
                <strong>función escalonada</strong>, con saltos en cada valor que
                tiene probabilidad positiva.
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-bold mb-2 text-purple-900">
                Variable Aleatoria Continua
              </h3>
              <BlockMath math="F(x) = \int_{-\infty}^{x} f(t)\,dt" />
              <p className="text-sm text-gray-700 mt-2 text-justify">
                En el caso continuo, la CDF se obtiene integrando la función de
                densidad. El resultado es una <strong>curva suave</strong> que
                crece gradualmente desde 0 hasta 1.
              </p>
            </div>
          </div>
        </div>

        {/* SIMULACIÓN */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-purple-200 space-y-6">
          <h2 className="text-2xl font-bold">
            Visualización Interactiva
          </h2>

          {/* TOGGLE */}
          <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setTipoVariable('discreta')}
              className={`px-4 py-2 rounded-md transition-all ${
                tipoVariable === 'discreta'
                  ? 'bg-white text-orange-600 font-bold shadow'
                  : 'text-gray-600'
              }`}
            >
              Discreta
            </button>
            <button
              onClick={() => setTipoVariable('continua')}
              className={`px-4 py-2 rounded-md transition-all ${
                tipoVariable === 'continua'
                  ? 'bg-white text-purple-600 font-bold shadow'
                  : 'text-gray-600'
              }`}
            >
              Continua
            </button>
          </div>

          {/* CONTROLES */}
          {tipoVariable === 'continua' && (
            <div className="flex flex-wrap gap-4 bg-purple-50 p-4 rounded-lg">
              <div>
                <label className="text-xs font-bold">a</label>
                <input
                  type="number"
                  value={a}
                  onChange={e => setA(+e.target.value)}
                  className="ml-2 w-20 p-1 border rounded"
                />
              </div>
              <div>
                <label className="text-xs font-bold">b</label>
                <input
                  type="number"
                  value={b}
                  onChange={e => setB(+e.target.value)}
                  className="ml-2 w-20 p-1 border rounded"
                />
              </div>
              <div>
                <label className="text-xs font-bold">x</label>
                <input
                  type="number"
                  value={xEval}
                  onChange={e => setXEval(+e.target.value)}
                  className="ml-2 w-20 p-1 border rounded"
                />
              </div>
              <div className="font-bold text-purple-900">
                <InlineMath math={`F(${xEval}) = ${F_x.toFixed(4)}`} />
              </div>
            </div>
          )}

          {/* GRÁFICO */}
          <div className="h-80 border rounded-lg p-4">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: { min: 0, max: 1.1 },
                  x: { title: { display: true, text: 'x' } }
                }
              }}
            />
          </div>
        </div>

        {/* APLICACIONES */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-green-200">
          <h2 className="text-2xl font-bold mb-4">
            Aplicaciones Fundamentales
          </h2>

          <p className="text-gray-700 mb-4 text-justify">
            Una de las aplicaciones más importantes de la función de distribución
            acumulada es el cálculo de probabilidades en intervalos:
          </p>

          <div className="bg-green-50 p-4 rounded-lg text-center mb-4">
            <BlockMath math="P(a < X \le b) = F(b) - F(a)" />
          </div>

          <p className="text-gray-700 text-justify">
            Para variables continuas, la función de densidad se obtiene derivando
            la CDF:
          </p>

          <div className="bg-green-50 p-4 rounded-lg text-center mt-2">
            <BlockMath math="f(x) = \frac{d}{dx}F(x)" />
          </div>
        </div>

      </div>
    </div>
  );
}
