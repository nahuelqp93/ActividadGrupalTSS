import { useState } from 'react';
import Enunciado from '../utils/Enunciado';
import FormulasNormal from '../utils/FormulasNormal';

const SEMILLA_LCG = 9012;

interface IteracionInterferencia {
  simulacion: number;
  r1: number;
  r2: number;
  x1: number;
  x2: number;
  interferencia: string;
}

export default function SimulacionInterferenciaFlechaCojinete() {
  const [mediaX1, setMediaX1] = useState(1.5);
  const [desviacionX1, setDesviacionX1] = useState(0.04);
  const [mediaX2, setMediaX2] = useState(1.48);
  const [desviacionX2, setDesviacionX2] = useState(0.03);
  const [numSimulaciones, setNumSimulaciones] = useState(10);

  const [iteraciones, setIteraciones] = useState<IteracionInterferencia[]>([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [probabilidadEstimada, setProbabilidadEstimada] = useState(0);
  const [diferencia, setDiferencia] = useState(0);

  const PROBABILIDAD_VERDADERA = 34.46;

  const createLCG = (initialSeed: number) => {
    let current = initialSeed;
    const a = 1664525;
    const c = 1013904223;
    const m = 2 ** 32;
    return () => {
      current = (a * current + c) % m;
      return current / m;
    };
  };


  const normPPF = (p: number): number => {
    return Math.sqrt(2) * erfInv(2 * p - 1);
  };

  const erfInv = (x: number): number => {
    const a = 0.147;
    const sgn = x < 0 ? -1 : 1;
    const absX = Math.abs(x);
    
    const ln1MinusX2 = Math.log(1 - absX * absX);
    const term1 = 2 / (Math.PI * a) + ln1MinusX2 / 2;
    const term2 = ln1MinusX2 / a;
    
    return sgn * Math.sqrt(Math.sqrt(term1 * term1 - term2) - term1);
  };

  const generarNormal = (media: number, desviacion: number, r: number): number => {
    const z = normPPF(r);
    return media + desviacion * z;
  };

  const simular = () => {
    const rng = createLCG(SEMILLA_LCG);
    const resultados: IteracionInterferencia[] = [];
    let conteoInterferencias = 0;

    for (let i = 1; i <= numSimulaciones; i++) {
      const r1 = rng();
      const r2 = rng();

      const x1 = generarNormal(mediaX1, desviacionX1, r1);
      const x2 = generarNormal(mediaX2, desviacionX2, r2);

      const hayInterferencia = x1 <= x2;
      const interferencia = hayInterferencia ? 'Hay interferencia' : 'No hay interferencia';

      if (hayInterferencia) {
        conteoInterferencias++;
      }

      resultados.push({
        simulacion: i,
        r1,
        r2,
        x1,
        x2,
        interferencia
      });
    }

    const probEstimada = (conteoInterferencias / numSimulaciones) * 100;
    const dif = Math.abs(PROBABILIDAD_VERDADERA - probEstimada);

    setIteraciones(resultados);
    setProbabilidadEstimada(probEstimada);
    setDiferencia(dif);
    setMostrarResultados(true);
  };

  const ensamblados = iteraciones.filter(i => i.interferencia === 'No hay interferencia').length;
  const interferencias = iteraciones.filter(i => i.interferencia === 'Hay interferencia').length;

  return (
    <div className="min-h-screen bg-white p-6 text-black">
      <div className="max-w-7xl mx-auto space-y-6">
        <Enunciado
          titulo="Simulación de Interferencia en Ensamblaje de una Flecha y el Cojinete"
          descripcion="Se simula el ensamble de una flecha en un cojinete usando la distribución normal para el ancho de X1 y X2. Hay una interferencia cuando X1 ≤ X2."
          preguntas={[
            'Probabilidad estimada de interferencia',
            'Número de ensamblados exitosos',
            'Diferencia con la probabilidad verdadera (34.46%)'
          ]}
          datos={[
            { label: 'Media X1 (flecha)', valor: `${mediaX1} mm` },
            { label: 'Desviación X1', valor: `${desviacionX1} mm` },
            { label: 'Media X2 (cojinete)', valor: `${mediaX2} mm` },
            { label: 'Desviación X2', valor: `${desviacionX2} mm` }
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormulasNormal media={mediaX1} desviacion={desviacionX1} variable="X1 (Flecha)" />
          <FormulasNormal media={mediaX2} desviacion={desviacionX2} variable="X2 (Cojinete)" />
        </div>

        <div className="border p-4 space-y-4">
          <h3 className="font-semibold text-lg">Parámetros de simulación</h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <label>
              Media X1
              <input
                type="number"
                step="0.01"
                value={mediaX1}
                onChange={e => setMediaX1(+e.target.value)}
                className="border p-1 w-full"
              />
            </label>

            <label>
              Desviación estándar X1
              <input
                type="number"
                step="0.001"
                value={desviacionX1}
                onChange={e => setDesviacionX1(+e.target.value)}
                className="border p-1 w-full"
              />
            </label>

            <label>
              Media X2 
              <input
                type="number"
                step="0.01"
                value={mediaX2}
                onChange={e => setMediaX2(+e.target.value)}
                className="border p-1 w-full"
              />
            </label>

            <label>
              Desviación estándar X2 
              <input
                type="number"
                step="0.001"
                value={desviacionX2}
                onChange={e => setDesviacionX2(+e.target.value)}
                className="border p-1 w-full"
              />
            </label>

            <label>
              Número de simulaciones
              <input
                type="number"
                value={numSimulaciones}
                onChange={e => setNumSimulaciones(+e.target.value)}
                className="border p-1 w-full"
              />
            </label>
          </div>

          <button
            onClick={simular}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Ejecutar simulación
          </button>
        </div>

        {mostrarResultados && (
          <>
            <div className="border overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-2 border">Simulación</th>
                    <th className="p-2 border">R1</th>
                    <th className="p-2 border">R2</th>
                    <th className="p-2 border">X1 (Flecha)</th>
                    <th className="p-2 border">X2 (Cojinete)</th>
                    <th className="p-2 border">Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  {iteraciones.map((it, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                      <td className="p-2 border text-center">{it.simulacion}</td>
                      <td className="p-2 border text-center">{it.r1.toFixed(4)}</td>
                      <td className="p-2 border text-center">{it.r2.toFixed(4)}</td>
                      <td className="p-2 border text-center">{it.x1.toFixed(4)}</td>
                      <td className="p-2 border text-center">{it.x2.toFixed(4)}</td>
                      <td className={`p-2 border text-center font-medium ${
                        it.interferencia === 'Hay interferencia' 
                          ? 'text-red-600' 
                          : 'text-green-600'
                      }`}>
                        {it.interferencia}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border p-4 text-sm space-y-2">
              <p>
                <strong className="text-green-600">Flechas ensambladas:</strong> {ensamblados}
              </p>
              <p>
                <strong className="text-red-600">Interferencias:</strong> {interferencias}
              </p>
              <p>
                <strong>Probabilidad estimada de interferencia:</strong>{' '}
                {probabilidadEstimada.toFixed(2)}%
              </p>
              <p>
                <strong>Probabilidad verdadera:</strong> {PROBABILIDAD_VERDADERA}%
              </p>
              <p>
                <strong>Diferencia:</strong> {diferencia.toFixed(2)}%
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
