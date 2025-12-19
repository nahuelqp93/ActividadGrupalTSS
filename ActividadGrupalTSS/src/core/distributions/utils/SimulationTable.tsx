import React from 'react';
import { InlineMath } from 'react-katex';

interface UniformRow {
  u: number;
  x: number;
}

interface SimulationTableProps {
  data: UniformRow[];
}

export const SimulationTable: React.FC<SimulationTableProps> = ({ data }) => {
  if (data.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
      <div className="px-6 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
          Muestra de Datos Generados
        </h3>
        <span className="text-[10px] text-gray-500">Primeros 20 registros</span>
      </div>
      <table className="w-full text-xs text-left">
        <thead>
          <tr className="bg-white text-gray-900 border-b border-gray-200">
            <th className="px-6 py-3 font-semibold w-20">#</th>
            <th className="px-6 py-3 font-semibold">
              <InlineMath math="U_i \text{ (Aleatorio)}" />
            </th>
            <th className="px-6 py-3 font-semibold">
              <InlineMath math="X_i \text{ (Transformado)}" />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.slice(0, 20).map((row, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-2 text-gray-500">{i + 1}</td>
              <td className="px-6 py-2 font-mono text-gray-600">{row.u.toFixed(5)}</td>
              <td className="px-6 py-2 font-mono font-bold text-gray-900">{row.x.toFixed(5)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};