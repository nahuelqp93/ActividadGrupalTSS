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

interface UniformRow {
  u: number;
  x: number;
}

// Transformada directa
function uniformSample(
  a: number,
  b: number,
  nextU: () => number
): UniformRow {
  const u = nextU();
  const x = a + (b - a) * u;
  return { u, x };
}

// PDF teórica
function uniformPDF(x: number, a: number, b: number): number {
  return x >= a && x <= b ? 1 / (b - a) : 0;
}

const UniformLCG: React.FC = () => {
  const [a, setA] = useState(0);
  const [b, setB] = useState(10);
  const [n, setN] = useState(1000);

  const [samples, setSamples] = useState<number[]>([]);
  const [rawData, setRawData] = useState<UniformRow[]>([]);

  const rng = useLCG({
    seed: 1234,
    a: 1664525,
    c: 1013904223,
    m: 2 ** 32
  });

  const isValid = a < b;

  const generate = () => {
    if (!isValid) return;

    rng.reseed(1234);

    const data: UniformRow[] = [];
    for (let i = 0; i < n; i++) {
      data.push(uniformSample(a, b, rng.next));
    }

    setRawData(data);
    setSamples(data.map(d => d.x));
  };

  const stats = useMemo(() => {
    if (samples.length === 0) return null;
    const meanEmp = samples.reduce((s, x) => s + x, 0) / samples.length;
    const varEmp =
      samples.reduce((s, x) => s + (x - meanEmp) ** 2, 0) / samples.length;

    const meanTheo = (a + b) / 2;
    const varTheo = (b - a) ** 2 / 12;

    return { meanEmp, varEmp, meanTheo, varTheo };
  }, [samples, a, b]);

  const chartData = useMemo(() => {
    if (samples.length === 0) return { labels: [], datasets: [] };

    const bins = 30;
    const width = (b - a) / bins;

    const hist = new Array(bins).fill(0);
    samples.forEach(x => {
      const idx = Math.floor((x - a) / width);
      if (idx >= 0 && idx < bins) hist[idx]++;
    });

    const labels = hist.map((_, i) =>
      (a + i * width + width / 2).toFixed(2)
    );

    const theoretical = labels.map(label =>
      uniformPDF(parseFloat(label), a, b) * n * width
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
  }, [samples, a, b, n]);

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">

      <div>
        <h1 className="text-3xl font-bold mb-2">
          Distribución Uniforme Continua
        </h1>
        <p className="text-gray-600">
          Generación de variables aleatorias continuas mediante
          <b> Generador Congruencial Mixto</b> y transformación lineal.
        </p>
      </div>

      <BlockMath math={`
f(x)=
\\begin{cases}
\\dfrac{1}{b-a}, & a \\le x \\le b \\\\
0, & \\text{otro caso}
\\end{cases}
      `} />

      <BlockMath math="X = a + (b-a)U" />

      {/* CONTROLES */}
      <div className="flex gap-4 items-end">
        <label>
          <span className="font-bold">a:</span>
          <input
            type="number"
            value={a}
            onChange={e => setA(+e.target.value)}
            className="ml-2 p-2 border rounded w-24"
          />
        </label>

        <label>
          <span className="font-bold">b:</span>
          <input
            type="number"
            value={b}
            onChange={e => setB(+e.target.value)}
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
          Error: debe cumplirse <InlineMath math="a < b" />
        </p>
      )}

      {samples.length > 0 && (
        <>
          <p>
             Media teórica: {stats?.meanTheo.toFixed(4)} <br />
            Media simulada: <b>{stats?.meanEmp.toFixed(4)}</b> <br />
            Varianza teórica: {stats?.varTheo.toFixed(4)} <br />
            Varianza simulada: <b>{stats?.varEmp.toFixed(4)}</b>
          </p>

          <div className="h-64">
            <Chart type="bar" data={chartData} options={{ maintainAspectRatio: false }} />
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

export default UniformLCG;
