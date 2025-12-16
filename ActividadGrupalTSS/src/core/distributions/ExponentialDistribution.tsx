import React, { useState, useMemo } from "react";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
} from "chart.js";
import { Chart } from "react-chartjs-2";

import { useLCG } from "../random/useLCG";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

interface ExponentialRow {
  u: number;
  x: number;
}

// Transformada inversa
function exponentialSample(
  lambda: number,
  nextU: () => number
): ExponentialRow {
  const u = nextU();
  const x = -Math.log(1 - u) / lambda;
  return { u, x };
}

// PDF teórica
function exponentialPDF(x: number, lambda: number): number {
  return x >= 0 ? lambda * Math.exp(-lambda * x) : 0;
}

const ExponentialLCG: React.FC = () => {
  const [lambda, setLambda] = useState(1);
  const [n, setN] = useState(1000);

  const [samples, setSamples] = useState<number[]>([]);
  const [rawData, setRawData] = useState<ExponentialRow[]>([]);

  const rng = useLCG({
    seed: 1234,
    a: 1664525,
    c: 1013904223,
    m: 2 ** 32
  });

  const isValid = lambda > 0;

  const generate = () => {
    if (!isValid) return;

    rng.reseed(1234);

    const data: ExponentialRow[] = [];
    for (let i = 0; i < n; i++) {
      data.push(exponentialSample(lambda, rng.next));
    }

    setRawData(data);
    setSamples(data.map(d => d.x));
  };

  const stats = useMemo(() => {
    if (samples.length === 0) return null;

    const meanEmp = samples.reduce((s, x) => s + x, 0) / samples.length;
    const varEmp =
      samples.reduce((s, x) => s + (x - meanEmp) ** 2, 0) / samples.length;

    const meanTheo = 1 / lambda;
    const varTheo = 1 / (lambda * lambda);

    return { meanEmp, varEmp, meanTheo, varTheo };
  }, [samples, lambda]);

  const chartData = useMemo(() => {
    if (samples.length === 0) return { labels: [], datasets: [] };

    const maxX = Math.max(...samples);
    const bins = 30;
    const width = maxX / bins;

    const hist = new Array(bins).fill(0);
    samples.forEach(x => {
      const idx = Math.floor(x / width);
      if (idx >= 0 && idx < bins) hist[idx]++;
    });

    const labels = hist.map((_, i) =>
      (i * width + width / 2).toFixed(2)
    );

    const theoretical = labels.map(label =>
      exponentialPDF(parseFloat(label), lambda) * n * width
    );

    return {
      labels,
      datasets: [
        {
          type: "line" as const,
          label: "Teórico (PDF)",
          data: theoretical,
          borderColor: "rgb(220,38,38)",
          borderWidth: 2,
          pointRadius: 0
        },
        {
          type: "bar" as const,
          label: "Simulación (LCG)",
          data: hist,
          backgroundColor: "rgba(30,58,138,0.7)"
        }
      ]
    };
  }, [samples, lambda, n]);

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">

      <div>
        <h1 className="text-3xl font-bold mb-2">
          Distribución Exponencial
        </h1>
        <p className="text-gray-600">
          Modelo continuo para tiempos de espera, generado mediante
          <b> Generador Congruencial Mixto</b> y transformada inversa.
        </p>
      </div>

      <BlockMath math="f(x)=\lambda e^{-\lambda x}, \quad x \ge 0" />
      <BlockMath math="X = -\frac{1}{\lambda}\ln(1-U)" />

      {/* CONTROLES */}
      <div className="flex gap-4 items-end">
        <label>
          <span className="font-bold">λ:</span>
          <input
            type="number"
            step="0.1"
            value={lambda}
            onChange={e => setLambda(+e.target.value)}
            className="ml-2 p-2 border rounded w-24"
          />
        </label>

        <label>
          <span className="font-bold">n:</span>
          <input
            type="number"
            value={n}
            onChange={e => setN(+e.target.value)}
            className="ml-2 p-2 border rounded w-24"
          />
        </label>

        <button
          onClick={generate}
          className="bg-blue-900 text-white px-4 py-2 rounded font-bold"
        >
          Simular
        </button>
      </div>

      {!isValid && (
        <p className="text-red-600 font-bold">
          Error: <InlineMath math="\lambda > 0" />
        </p>
      )}

      {samples.length > 0 && stats && (
        <>
          <p>
            Media teórica: {stats.meanTheo.toFixed(4)} <br />
            Media simulada: <b>{stats.meanEmp.toFixed(4)}</b> <br />
            Varianza teórica: {stats.varTheo.toFixed(4)} <br />
            Varianza simulada: <b>{stats.varEmp.toFixed(4)}</b>
          </p>

          <div className="h-64">
            <Chart
              type="bar"
              data={chartData}
              options={{ maintainAspectRatio: false }}
            />
          </div>

          {/* TABLA */}
          <div className="bg-white rounded border border-gray-300 shadow-sm overflow-hidden">
            <h3 className="px-6 py-3 bg-gray-100 font-bold text-sm uppercase">
              Tabla de valores generados (muestra)
            </h3>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 font-semibold">
                <tr>
                  <th className="px-4 py-2 border-b">i</th>
                  <th className="px-4 py-2 border-b">
                    <InlineMath math="U_i" />
                  </th>
                  <th className="px-4 py-2 border-b">
                    <InlineMath math="X_i" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {rawData.slice(0, 20).map((row, i) => (
                  <tr key={i} className="odd:bg-white even:bg-gray-50">
                    <td className="px-4 py-2 text-center">{i + 1}</td>
                    <td className="px-4 py-2 text-center font-mono">
                      {row.u.toFixed(5)}
                    </td>
                    <td className="px-4 py-2 text-center font-mono">
                      {row.x.toFixed(5)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="px-6 py-2 text-xs text-gray-500 border-t">
              Se muestran los primeros 20 valores generados.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ExponentialLCG;
