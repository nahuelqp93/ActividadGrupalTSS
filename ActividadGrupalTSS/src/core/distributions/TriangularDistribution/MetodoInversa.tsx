import { useState } from 'react';
import { inverseMethod } from '../../../core/methods/inversa';
import type { SamplePoint } from '../../../core/types/Sample';
import SampleTable from '../../../components/common/SampleTable';
import SamplePlot from '../../../components/common/SamplePlot';

export default function MetodoInversa() {
  const [numSimulaciones, setNumSimulaciones] = useState('10');
  const [seed, setSeed] = useState(1234);
  const [muestras, setMuestras] = useState<SamplePoint[]>([]);
  const [mostrarGrafico, setMostrarGrafico] = useState(false);

  // LCG Generator
  const createLCG = (initialSeed: number) => {
    let current = initialSeed;
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);
    return () => {
      current = (a * current + c) % m;
      return current / m;
    };
  };

  const generarMuestras = () => {
    const n = parseInt(numSimulaciones) || 10;
    const rng = createLCG(seed);

    // Ejemplo: Distribución Exponencial con λ=1
    const samples = inverseMethod({
      n,
      nextU: rng,
      inverseCDF: (u) => -Math.log(1 - u), // F⁻¹(u) para Exp(1)
      pdf: (x) => Math.exp(-x) // f(x) = e^(-x)
    });

    setMuestras(samples);
  };

  const curves = [
    {
      xmin: 0,
      xmax: 5,
      pdf: (x: number) => Math.exp(-x),
      color: '#16a34a',
      label: 'Exponencial(λ=1)'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Configuración */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center gap-2">
           Método de la Transformada Inversa(No es la version correcta)
        </h2>
        
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <p className="text-sm text-gray-700">
            <strong>Ejemplo implementado:</strong> Distribución Exponencial con λ=1
          </p>
          <p className="text-sm text-gray-700 mt-2">
            F⁻¹(u) = -ln(1-u)
          </p>
          <p className="text-sm text-gray-700 mt-1">
            f(x) = e^(-x)
          </p>
        </div>

        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <label className="block text-sm font-medium mb-2">Número de Simulaciones</label>
            <input
              type="text"
              value={numSimulaciones}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d+$/.test(value)) setNumSimulaciones(value);
              }}
              className="p-2 border border-gray-300 rounded-md w-40"
            />
          </div>

          <div>
        
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(parseInt(e.target.value) || 1234)}
              className="p-2 border border-gray-300 rounded-md w-40"
            />
          </div>

          <button
            onClick={generarMuestras}
            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
             Generar Muestras
          </button>

          {muestras.length > 0 && (
        <div>
            <button
              onClick={() => setMostrarGrafico(!mostrarGrafico)}
              className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              {mostrarGrafico ? ' Ver Tabla' : ' Ver Gráfico'}
            </button>
          </div>
        )}
        </div>

        {/* Gráfico */}
        {mostrarGrafico && muestras.length > 0 && (
          <div className="mt-6">
            <SamplePlot
              samples={muestras}
              curves={curves}
              title="Método de Transformada Inversa - Visualización"
            />
          </div>
        )}

        {/* Tabla */}
        {!mostrarGrafico && muestras.length > 0 && (
          <SampleTable
            samples={muestras}
            columns={{
              i: true,
              u: true,
              u2: false, // Inversa solo usa un uniforme
              x: true,
              y: false,
              fx: true,
              accepted: false // Inversa no rechaza
            }}
            showFormulas={{
              xFormula: 'x = F⁻¹(U) = -ln(1-U)'
            }}
          />
        )}
      </div>
    </div>
  );
}