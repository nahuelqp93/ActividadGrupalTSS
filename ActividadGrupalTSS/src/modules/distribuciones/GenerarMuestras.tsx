import { useState } from 'react';
import { evaluate } from 'mathjs';
import GraficoHistograma from './GraficoHistograma';

interface GenerarMuestrasProps {
  ecuacion1: string;
  ecuacion2: string;
  limiteInf1: number;
  limiteSupf1: number;
  limiteInf2: number;
  limiteSupf2: number;
  onCerrar: () => void;
}

interface Muestra {
  simulacion: number;
  r1: number;
  r2: number;
  x: number;
  fx: number;
  fmax: number;
  estado: string;
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
  const [muestras, setMuestras] = useState<Muestra[]>([]);
  const [mostrarGrafico, setMostrarGrafico] = useState(false);

  const evaluarFuncion = (ecuacion: string, x: number): number | null => {
    try {
      const resultado = evaluate(ecuacion, { x });
      return typeof resultado === 'number' ? resultado : null;
    } catch (e) {
      return null;
    }
  };

  const calcularMaxY = (limInf: number,limSup:number, ecuacion: string): number => {
    let maxY = 0;
    const numSamples = 100;
    
    for (let i = 0; i <= numSamples; i++) {
      const x = limInf + (limSup - limInf) * (i / numSamples);
      const y = evaluarFuncion(ecuacion, x);
      if (y !== null && isFinite(y) && y > maxY) {
        maxY = y;
      }
    }
    
    return maxY;
  };



  const generarMuestras = () => {
    const numSims = parseInt(numSimulaciones) || 10;
    const maxY1 = calcularMaxY(limiteInf1, limiteSupf1, ecuacion1);
    const maxY2 = calcularMaxY(limiteInf2, limiteSupf2, ecuacion2);
    if (maxY1 > maxY2) {
      var maxY = 1/maxY1;
    } else {
      var maxY = 1/maxY2;
    }
    const nuevasMuestras: Muestra[] = [];

    for (let i = 1; i <= numSims; i++) {
      const r1 = Math.random();
      const r2 = Math.random();
      const x = limiteInf1 + (limiteSupf2 - limiteInf1) * r1;
      
      let estado = 'Rechazado';
      let fxValue = 0;
      
      if (x < limiteSupf1) {
        const fx = evaluarFuncion(ecuacion1, x);
        fxValue = fx !== null ? fx : 0;
        if (fx !== null && r2 <= fx * maxY) {
          estado = 'Aceptado';
        }
      } else {
        if (x < limiteSupf2) {
          const fx = evaluarFuncion(ecuacion2, x);
          fxValue = fx !== null ? fx : 0;
          if (fx !== null && r2 <= fx * maxY) {
            estado = 'Aceptado';
          }
        }
      }

      nuevasMuestras.push({
        simulacion: i,
        r1: parseFloat(r1.toFixed(6)),
        r2: parseFloat(r2.toFixed(6)),
        x: parseFloat(x.toFixed(6)),
        fx: parseFloat(fxValue.toFixed(6)),
        fmax: parseFloat(maxY.toFixed(6)),
        estado
      });
    }

    setMuestras(nuevasMuestras);
  };
  return (
    <div className="bg-gray-50 rounded-lg shadow-lg p-6 border-2 border-blue-200">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-blue-800">Generador de Muestras</h2>
        <button
          onClick={onCerrar}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Cerrar
        </button>
      </div>

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

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4">Método del Rechazo</h3>
        
        <div className="mb-4 flex items-center gap-4">
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
              className="p-2 border border-gray-300 rounded-md focus:outline-none"
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
            >
              {mostrarGrafico ? 'Ocultar Puntos' : 'Graficar Puntos'}
            </button>
          </div>
        </div>

        {mostrarGrafico && muestras.length > 0 && (
          <div className="mt-6">
            <GraficoHistograma 
              muestras={muestras}
              ecuacion1={ecuacion1}
              ecuacion2={ecuacion2}
              limiteInf1={limiteInf1}
              limiteSupf1={limiteSupf1}
              limiteInf2={limiteInf2}
              limiteSupf2={limiteSupf2}
            />
          </div>
        )}

        {muestras.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">Simulación</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">R1</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">R2</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">X</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">f(x)</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">C</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Estado</th>
                </tr>
              </thead>
              <tbody>
                {muestras.map((muestra) => (
                  <tr key={muestra.simulacion} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{muestra.simulacion}</td>
                    <td className="border border-gray-300 px-4 py-2">{muestra.r1}</td>
                    <td className="border border-gray-300 px-4 py-2">{muestra.r2}</td>
                    <td className="border border-gray-300 px-4 py-2">{muestra.x}</td>
                    <td className="border border-gray-300 px-4 py-2">{muestra.fx}</td>
                    <td className="border border-gray-300 px-4 py-2">{muestra.fmax}</td>
                    <td className={`border border-gray-300 px-4 py-2 font-semibold ${
                      muestra.estado === 'Aceptado' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {muestra.estado}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm">
                <strong>Total muestras:</strong> {muestras.length}  
                <strong className="ml-4 text-green-600">Aceptadas:</strong> {muestras.filter(m => m.estado === 'Aceptado').length} 
                <strong className="ml-4 text-red-600">Rechazadas:</strong> {muestras.filter(m => m.estado === 'Rechazado').length}
              </p>
              <p className="text-sm mt-2">
                <strong>Tasa de aceptación:</strong> {((muestras.filter(m => m.estado === 'Aceptado').length / muestras.length) * 100).toFixed(2)}%
              </p>
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-sm font-semibold mb-1">Formula para calcular X:</p>
                <p className="text-sm font-mono bg-white px-3 py-2 rounded">
                  x = {limiteInf1} + ({limiteSupf2} - {limiteInf1}) × R1
                </p>
                <p className="text-sm font-semibold mb-1 mt-3">Formula de Factor de Escala:</p>
                <p className="text-sm font-mono bg-white px-3 py-2 rounded">
                  C = 1 / fmax
                </p>

                {muestras.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-blue-300">
                    <h4 className="text-sm font-bold mb-3 text-blue-700">Pasos del Metodo del Rechazo (Simulacion 1)</h4>
                    
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border-l-4 border-blue-400">
                        <p className="text-sm font-semibold text-blue-600 mb-2">Paso 1: Generar numeros aleatorios</p>
                        <div className="text-sm font-mono bg-gray-50 px-3 py-2 rounded">
                          <p>R1 = {muestras[0].r1}</p>
                          <p>R2 = {muestras[0].r2}</p>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border-l-4 border-blue-400">
                        <p className="text-sm font-semibold text-blue-600 mb-2">Paso 2: Calcular X</p>
                        <div className="text-sm bg-gray-50 px-3 py-2 rounded space-y-1">
                          <p className="font-mono">X = {limiteInf1} + ({limiteSupf2} - {limiteInf1}) × {muestras[0].r1}</p>
                          <p className="font-mono">X = {limiteInf1} + ({limiteSupf2 - limiteInf1}) × {muestras[0].r1}</p>
                          <p className="font-mono font-semibold text-blue-700">X = {muestras[0].x}</p>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border-l-4 border-blue-400">
                        <p className="text-sm font-semibold text-blue-600 mb-2">Paso 3: Evaluar f(X)</p>
                        <div className="text-sm bg-gray-50 px-3 py-2 rounded">
                          <p className="font-mono font-semibold text-blue-700">f({muestras[0].x}) = {muestras[0].fx}</p>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border-l-4 border-blue-400">
                        <p className="text-sm font-semibold text-blue-600 mb-2">Paso 4: Calcular Factor de Escala (C)</p>
                        <div className="text-sm bg-gray-50 px-3 py-2 rounded">
                          <p className="font-mono">C = 1 / fmax</p>
                          <p className="font-mono font-semibold text-blue-700">C = {muestras[0].fmax}</p>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border-l-4 border-blue-400">
                        <p className="text-sm font-semibold text-blue-600 mb-2">Paso 5: Aplicar criterio de aceptacion</p>
                        <div className="text-sm bg-gray-50 px-3 py-2 rounded space-y-2">
                          <p>Condicion: R2 ≤ f(X) × C</p>
                          <p className="font-mono">{muestras[0].r2} ≤ {muestras[0].fx} × {muestras[0].fmax}</p>
                          <p className="font-mono">{muestras[0].r2} ≤ {(muestras[0].fx * muestras[0].fmax).toFixed(6)}</p>
                          <p className="font-semibold mt-2">
                            <span className={muestras[0].estado === 'Aceptado' ? 'text-green-600' : 'text-red-600'}>
                              Resultado: {muestras[0].estado}
                            </span>
                          </p>
                          {muestras[0].estado === 'Rechazado' && (
                            <p className="text-xs text-gray-600 italic mt-1">
                              Como {muestras[0].r2} &gt; {(muestras[0].fx * muestras[0].fmax).toFixed(6)}, el valor de X se rechaza
                            </p>
                          )}
                          {muestras[0].estado === 'Aceptado' && (
                            <p className="text-xs text-gray-600 italic mt-1">
                              Como {muestras[0].r2} ≤ {(muestras[0].fx * muestras[0].fmax).toFixed(6)}, el valor de X se acepta
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}