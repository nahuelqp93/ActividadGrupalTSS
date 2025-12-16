import { useState, useMemo } from 'react';
import { evaluate } from 'mathjs';
import { rejectionMethod } from '../../core/methods/rechazo';
import type { SamplePoint } from '../../core/types/Sample';
import SampleTable from '../../components/common/SampleTable';
import SamplePlot from '../../components/common/SamplePlot';

interface GenerarMuestrasProps {
  ecuacion1: string;
  ecuacion2: string;
  limiteInf1: number;
  limiteSupf1: number;
  limiteInf2: number;
  limiteSupf2: number;
  onCerrar: () => void;
}

export default function GenerarMuestras({
  ecuacion1,
  ecuacion2,
  limiteInf1,
  limiteSupf1,
  limiteInf2,
  limiteSupf2,
  onCerrar,
}: GenerarMuestrasProps) {
  const [numSimulaciones, setNumSimulaciones] = useState('10');
  const [muestras, setMuestras] = useState<SamplePoint[]>([]);
  const [mostrarGrafico, setMostrarGrafico] = useState(false);
  const [seed, setSeed] = useState(1234);

  // LCG simple integrado
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

  const evaluarFuncion = (ecuacion: string, x: number): number => {
    try {
      const resultado = evaluate(ecuacion, { x });
      return typeof resultado === 'number' ? resultado : 0;
    } catch (e) {
      return 0;
    }
  };

  const calcularMaxY = (limInf: number, limSup: number, ecuacion: string): number => {
    let maxY = 0;
    const numSamples = 100;
    
    for (let i = 0; i <= numSamples; i++) {
      const x = limInf + (limSup - limInf) * (i / numSamples);
      const y = evaluarFuncion(ecuacion, x);
      if (isFinite(y) && y > maxY) {
        maxY = y;
      }
    }
    
    return maxY;
  };

  // PDF unificada
  const pdf = useMemo(() => {
    return (x: number): number => {
      if (x < limiteSupf1) {
        return evaluarFuncion(ecuacion1, x);
      }
      if (x <= limiteSupf2) {
        return evaluarFuncion(ecuacion2, x);
      }
      return 0;
    };
  }, [ecuacion1, ecuacion2, limiteSupf1, limiteSupf2]);

  const generarMuestras = () => {
    const n = parseInt(numSimulaciones) || 10;
    
    const maxY1 = calcularMaxY(limiteInf1, limiteSupf1, ecuacion1);
    const maxY2 = calcularMaxY(limiteInf2, limiteSupf2, ecuacion2);
    const fmax = Math.max(maxY1, maxY2);

    const rng = createLCG(seed);

    const samples = rejectionMethod({
      n,
      nextU: rng,
      xmin: limiteInf1,
      xmax: limiteSupf2,
      pdf,
      fmax
    });

    setMuestras(samples);
  };

  const curves = useMemo(() => [
    {
      xmin: limiteInf1,
      xmax: limiteSupf1,
      pdf: (x: number) => evaluarFuncion(ecuacion1, x),
      color: '#3b82f6',
      label: 'Función 1'
    },
    {
      xmin: limiteInf2,
      xmax: limiteSupf2,
      pdf: (x: number) => evaluarFuncion(ecuacion2, x),
      color: '#ef4444',
      label: 'Función 2'
    }
  ], [ecuacion1, ecuacion2, limiteInf1, limiteSupf1, limiteInf2, limiteSupf2]);

  return (
    <div className="bg-gray-50 rounded-lg shadow-lg p-6 border-2 border-blue-200">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-blue-800">Generador de Muestras - Método del Rechazo</h2>
        <button
          onClick={onCerrar}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Cerrar
        </button>
      </div>

      {/* Parámetros */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 text-blue-800">
          Parámetros de las Funciones
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold text-lg mb-2 text-blue-600">Función 1 (Azul)</h3>
            <p className="text-gray-700"><strong>Ecuación:</strong> f₁(x) = {ecuacion1}</p>
            <p className="text-gray-700"><strong>Límite Inferior:</strong> {limiteInf1}</p>
            <p className="text-gray-700"><strong>Límite Superior:</strong> {limiteSupf1}</p>
          </div>

          <div className="border-l-4 border-red-500 pl-4">
            <h3 className="font-semibold text-lg mb-2 text-red-600">Función 2 (Rojo)</h3>
            <p className="text-gray-700"><strong>Ecuación:</strong> f₂(x) = {ecuacion2}</p>
            <p className="text-gray-700"><strong>Límite Inferior:</strong> {limiteInf2}</p>
            <p className="text-gray-700"><strong>Límite Superior:</strong> {limiteSupf2}</p>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4">Configuración</h3>
        
        <div className="mb-4 flex items-center gap-4 flex-wrap">
          <div>
            <label className="block text-sm font-medium mb-2">
              Número de Simulaciones
            </label>
            <input
              type="text"
              value={numSimulaciones}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d+$/.test(value)) {
                  setNumSimulaciones(value);
                }
              }}
              placeholder="10"
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Semilla (Seed)
            </label>
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(parseInt(e.target.value) || 1234)}
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={generarMuestras}
              className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-md"
            >
              Generar Muestras
            </button>
            <button
              onClick={() => setMostrarGrafico(!mostrarGrafico)}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              disabled={muestras.length === 0}
            >
              {mostrarGrafico ? 'Ocultar Gráfico' : 'Mostrar Gráfico'}
            </button>
          </div>
        </div>

        {/* Gráfico */}
        {mostrarGrafico && muestras.length > 0 && (
          <div className="mt-6">
            <SamplePlot
              samples={muestras}
              curves={curves}
              title="Método del Rechazo - Visualización"
            />
          </div>
        )}

        {/* Tabla */}
        {muestras.length > 0 && (
          <SampleTable
            samples={muestras}
            columns={{
              i: true,
              u: true,
              u2: true,
              x: true,
              y: true,
              fx: true,
              accepted: true
            }}
            showFormulas={{
              xFormula: `x = ${limiteInf1} + (${limiteSupf2} - ${limiteInf1}) × U₁`,
              cFormula: `C = 1 / fmax`
            }}
          />
        )}
      </div>
    </div>
  );
}