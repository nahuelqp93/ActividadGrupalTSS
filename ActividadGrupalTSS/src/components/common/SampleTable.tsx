import type { SamplePoint } from '../../core/types/Sample';

interface SampleTableProps {
  samples: SamplePoint[];
  columns?: {
    i?: boolean;
    u?: boolean;
    u2?: boolean;
    x?: boolean;
    y?: boolean;
    fx?: boolean;
    c?: boolean;
    accepted?: boolean;
  };
  maxRows?: number;
  showFormulas?: {
    xFormula?: string;
    cFormula?: string;
  };
}

export default function SampleTable({ 
  samples, 
  columns = {},
  maxRows,
  showFormulas
}: SampleTableProps) {
  const {
    i = true,
    u = true,
    u2 = false,
    x = true,
    y = false,
    fx = true,
    c = false,
    accepted = true
  } = columns;

  const displaySamples = maxRows ? samples.slice(0, maxRows) : samples;
  
  const acceptedCount = samples.filter(s => s.accepted).length;
  const rejectedCount = samples.length - acceptedCount;
  const acceptanceRate = (acceptedCount / samples.length) * 100;

  return (
    <div className="mt-6">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              {i && <th className="border border-gray-300 px-4 py-2">i</th>}
              {u && <th className="border border-gray-300 px-4 py-2">R1</th>}
              {u2 && <th className="border border-gray-300 px-4 py-2">R2</th>}
              {x && <th className="border border-gray-300 px-4 py-2">X</th>}
              {y && <th className="border border-gray-300 px-4 py-2">Y</th>}
              {fx && <th className="border border-gray-300 px-4 py-2">f(x)</th>}
              {c && <th className="border border-gray-300 px-4 py-2">C</th>}
              {accepted && <th className="border border-gray-300 px-4 py-2">Estado</th>}
            </tr>
          </thead>
          <tbody>
            {displaySamples.map((sample) => (
              <tr 
                key={sample.i}
                className={sample.accepted ? 'bg-green-50 hover:bg-green-100' : 'bg-red-50 hover:bg-red-100'}
              >
                {i && <td className="border border-gray-300 px-4 py-2 text-center">{sample.i}</td>}
                {u && <td className="border border-gray-300 px-4 py-2">{sample.u.toFixed(6)}</td>}
                {u2 && sample.u2 !== undefined && (
                  <td className="border border-gray-300 px-4 py-2">{sample.u2.toFixed(6)}</td>
                )}
                {x && <td className="border border-gray-300 px-4 py-2">{sample.x.toFixed(6)}</td>}
                {y && sample.y !== undefined && (
                  <td className="border border-gray-300 px-4 py-2">{sample.y.toFixed(6)}</td>
                )}
                {fx && sample.fx !== undefined && (
                  <td className="border border-gray-300 px-4 py-2">{sample.fx.toFixed(6)}</td>
                )}
                {c && sample.c !== undefined && (
                  <td className="border border-gray-300 px-4 py-2">{sample.c.toFixed(6)}</td>
                )}
                {accepted && (
                  <td className={`border border-gray-300 px-4 py-2 font-semibold text-center ${
                    sample.accepted ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {sample.accepted ? 'Aceptado' : 'Rechazado'}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm">
          <strong>Total muestras:</strong> {samples.length}
          <strong className="ml-4 text-green-600">Aceptadas:</strong> {acceptedCount}
          <strong className="ml-4 text-red-600">Rechazadas:</strong> {rejectedCount}
        </p>
        <p className="text-sm mt-2">
          <strong>Tasa de aceptación:</strong> {acceptanceRate.toFixed(2)}%
        </p>

        {showFormulas && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            {showFormulas.xFormula && (
              <>
                <p className="text-sm font-semibold mb-1">Fórmula para calcular X:</p>
                <p className="text-sm font-mono bg-white px-3 py-2 rounded mb-3">
                  {showFormulas.xFormula}
                </p>
              </>
            )}
            {showFormulas.cFormula && (
              <>
                <p className="text-sm font-semibold mb-1">Fórmula de Factor de Escala:</p>
                <p className="text-sm font-mono bg-white px-3 py-2 rounded">
                  {showFormulas.cFormula}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}