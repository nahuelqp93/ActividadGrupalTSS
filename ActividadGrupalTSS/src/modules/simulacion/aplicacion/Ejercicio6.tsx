import { useState } from 'react';
import Enunciado from '../utils/Enunciado';
import FormulasNormal from '../utils/FormulasNormal';

const SEMILLA_LCG = 7890;

interface IteracionPolitica {
  horasTotales: number;
  tVidaC1: number;
  tVidaC2: number;
  tVidaC3: number;
  tVidaC4: number;
  horasTrabajadas: number;
  horasSinTrabajar: number;
  costoComponente: number;
  costoDesconexion: number;
  costoTotal: number;
}

export default function SimulacionEjercicio6() {
  const [media, setMedia] = useState(600);
  const [desviacion, setDesviacion] = useState(100);
  const [tiempoDesc1, setTiempoDesc1] = useState(1);
  const [tiempoDesc4, setTiempoDesc4] = useState(2);
  const [costoComponente, setCostoComponente] = useState(200);
  const [costoDesconexion, setCostoDesconexion] = useState(100);
  const [horasSimular, setHorasSimular] = useState(20000);

  const [politica1, setPolitica1] = useState<IteracionPolitica[]>([]);
  const [politica2, setPolitica2] = useState<IteracionPolitica[]>([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [costoTotalP1, setCostoTotalP1] = useState(0);
  const [costoTotalP2, setCostoTotalP2] = useState(0);

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

  const generarNormal = (m: number, desv: number, r: number): number => {
    const z = normPPF(r);
    return Math.round(m + desv * z);
  };

  const simularPolitica1 = (rng: () => number) => {
    const resultados: IteracionPolitica[] = [];
    let horasTotales = 0;
    let c1Des = 0, c2Des = 0, c3Des = 0, c4Des = 0;
    let componentesRemplazados = 0;

    while (horasTotales <= horasSimular) {
      let c1, c2, c3, c4;
      
      // Generar tiempos de vida
      if (horasTotales === 0) {
        c1 = generarNormal(media, desviacion, rng());
        c2 = generarNormal(media, desviacion, rng());
        c3 = generarNormal(media, desviacion, rng());
        c4 = generarNormal(media, desviacion, rng());
      } else {
        c1 = c1Des;
        c2 = c2Des;
        c3 = c3Des;
        c4 = c4Des;
      }

      // Calcular horas trabajadas
      const horasTrabajadas = Math.min(c1, c2, c3, c4);
      c1Des = c1 - horasTrabajadas;
      c2Des = c2 - horasTrabajadas;
      c3Des = c3 - horasTrabajadas;
      c4Des = c4 - horasTrabajadas;

      // Reemplazar componentes que llegaron a 0
      if (c1Des === 0) {
        c1Des = generarNormal(media, desviacion, rng());
        componentesRemplazados++;
      }
      if (c2Des === 0) {
        c2Des = generarNormal(media, desviacion, rng());
        componentesRemplazados++;
      }
      if (c3Des === 0) {
        c3Des = generarNormal(media, desviacion, rng());
        componentesRemplazados++;
      }
      if (c4Des === 0) {
        c4Des = generarNormal(media, desviacion, rng());
        componentesRemplazados++;
      }

      // Calcular horas sin trabajar (si todos fallaron al mismo tiempo = 2h, sino = 1h)
      const horasSinTrabajar = (c1 === c2 && c2 === c3 && c3 === c4) ? tiempoDesc4 : tiempoDesc1;
      horasTotales += horasSinTrabajar + horasTrabajadas;

      // Calcular costos
      const costoComp = componentesRemplazados * costoComponente;
      const costoDesc = horasSinTrabajar * costoDesconexion;
      const costoTotal = costoComp + costoDesc;

      resultados.push({
        horasTotales,
        tVidaC1: c1,
        tVidaC2: c2,
        tVidaC3: c3,
        tVidaC4: c4,
        horasTrabajadas,
        horasSinTrabajar,
        costoComponente: costoComp,
        costoDesconexion: costoDesc,
        costoTotal
      });

      componentesRemplazados = 0;

      if (horasTotales > horasSimular) break;
    }

    return resultados;
  };

  const simularPolitica2 = (rng: () => number) => {
    const resultados: IteracionPolitica[] = [];
    let horasTotales = 0;

    while (horasTotales <= horasSimular) {
      // Generar tiempos de vida de todos los componentes (nuevos)
      const c1 = generarNormal(media, desviacion, rng());
      const c2 = generarNormal(media, desviacion, rng());
      const c3 = generarNormal(media, desviacion, rng());
      const c4 = generarNormal(media, desviacion, rng());

      const horasTrabajadas = Math.min(c1, c2, c3, c4);
      horasTotales += tiempoDesc4 + horasTrabajadas;

      // Calcular costos (siempre se reemplazan los 4)
      const costoComp = 4 * costoComponente;
      const costoDesc = tiempoDesc4 * costoDesconexion;
      const costoTotal = costoComp + costoDesc;

      resultados.push({
        horasTotales,
        tVidaC1: c1,
        tVidaC2: c2,
        tVidaC3: c3,
        tVidaC4: c4,
        horasTrabajadas,
        horasSinTrabajar: tiempoDesc4,
        costoComponente: costoComp,
        costoDesconexion: costoDesc,
        costoTotal
      });

      if (horasTotales > horasSimular) break;
    }

    return resultados;
  };

  const simular = () => {
    const rng1 = createLCG(SEMILLA_LCG);
    const rng2 = createLCG(SEMILLA_LCG);

    const resultadosP1 = simularPolitica1(rng1);
    const resultadosP2 = simularPolitica2(rng2);

    const costoP1 = resultadosP1.reduce((sum, r) => sum + r.costoTotal, 0);
    const costoP2 = resultadosP2.reduce((sum, r) => sum + r.costoTotal, 0);

    setPolitica1(resultadosP1);
    setPolitica2(resultadosP2);
    setCostoTotalP1(costoP1);
    setCostoTotalP2(costoP2);
    setMostrarResultados(true);
  };

  const mejorPolitica = costoTotalP1 < costoTotalP2 ? 'Política 1' : costoTotalP2 < costoTotalP1 ? 'Política 2' : 'Ambas tienen el mismo costo';

  return (
    <div className="min-h-screen bg-white p-6 text-black">
      <div className="max-w-7xl mx-auto space-y-6">
        <Enunciado
          titulo="Simulación del Mantenimiento de 4 Componentes Electrónicos"
          descripcion="La simulación compara dos políticas de mantenimiento: Política 1 (reemplazar componentes individualmente) vs Política 2 (reemplazar todos los componentes cuando uno falla). Se busca determinar cuál política es la mas económica."
          preguntas={[
            'Costo total de cada política',
            'Política con menor costo',
            'Diferencia de costos entre políticas'
          ]}
          datos={[
            { label: 'Tiempo de vida', valor: `Normal(μ=${media}, σ=${desviacion})` },
            { label: 'Tiempo desc. 1 comp.', valor: `${tiempoDesc1} hora(s)` },
            { label: 'Tiempo desc. 4 comp.', valor: `${tiempoDesc4} hora(s)` },
            { label: 'Costo componente', valor: `${costoComponente}$` },
            { label: 'Costo desconexión', valor: `${costoDesconexion}$/hora` },
            { label: 'Horas a simular', valor: `${horasSimular} horas` }
          ]}
        />

        <FormulasNormal media={600} desviacion={100} variable="Tiempo de vida de componentes" />

        <div className="border p-4 space-y-4">
          <h3 className="font-semibold text-lg">Parámetros de simulación</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <label>
              Media (horas)
              <input
                type="number"
                value={media}
                onChange={e => setMedia(+e.target.value)}
                className="border p-1 w-full"
              />
            </label>

            <label>
              Desviación estándar (horas)
              <input
                type="number"
                value={desviacion}
                onChange={e => setDesviacion(+e.target.value)}
                className="border p-1 w-full"
              />
            </label>

            <label>
              Tiempo desc. 1 comp. (h)
              <input
                type="number"
                value={tiempoDesc1}
                onChange={e => setTiempoDesc1(+e.target.value)}
                className="border p-1 w-full"
              />
            </label>

            <label>
              Tiempo desc. 4 comp. (h)
              <input
                type="number"
                value={tiempoDesc4}
                onChange={e => setTiempoDesc4(+e.target.value)}
                className="border p-1 w-full"
              />
            </label>

            <label>
              Costo componente ($)
              <input
                type="number"
                value={costoComponente}
                onChange={e => setCostoComponente(+e.target.value)}
                className="border p-1 w-full"
              />
            </label>

            <label>
              Costo desconexión ($/h)
              <input
                type="number"
                value={costoDesconexion}
                onChange={e => setCostoDesconexion(+e.target.value)}
                className="border p-1 w-full"
              />
            </label>

            <label>
              Horas a simular
              <input
                type="number"
                value={horasSimular}
                onChange={e => setHorasSimular(+e.target.value)}
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
            <div className="border p-4 space-y-2">
              <h3 className="font-semibold text-lg mb-3">Política 1 - Reemplazar componentes individualmente</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="p-2 border">Horas Totales</th>
                      <th className="p-2 border">T. Vida C1</th>
                      <th className="p-2 border">T. Vida C2</th>
                      <th className="p-2 border">T. Vida C3</th>
                      <th className="p-2 border">T. Vida C4</th>
                      <th className="p-2 border">H. Trabajadas</th>
                      <th className="p-2 border">H. Sin Trabajar</th>
                      <th className="p-2 border">C. Componente</th>
                      <th className="p-2 border">C. Desconexión</th>
                      <th className="p-2 border">C. Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {politica1.map((it, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-2 border text-center">{it.horasTotales}</td>
                        <td className="p-2 border text-center">{it.tVidaC1}</td>
                        <td className="p-2 border text-center">{it.tVidaC2}</td>
                        <td className="p-2 border text-center">{it.tVidaC3}</td>
                        <td className="p-2 border text-center">{it.tVidaC4}</td>
                        <td className="p-2 border text-center">{it.horasTrabajadas}</td>
                        <td className="p-2 border text-center">{it.horasSinTrabajar}</td>
                        <td className="p-2 border text-center">${it.costoComponente}</td>
                        <td className="p-2 border text-center">${it.costoDesconexion}</td>
                        <td className="p-2 border text-center font-semibold">${it.costoTotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border p-4 space-y-2">
              <h3 className="font-semibold text-lg mb-3">Política 2 - Reemplazar todos los componentes</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="p-2 border">Horas Totales</th>
                      <th className="p-2 border">T. Vida C1</th>
                      <th className="p-2 border">T. Vida C2</th>
                      <th className="p-2 border">T. Vida C3</th>
                      <th className="p-2 border">T. Vida C4</th>
                      <th className="p-2 border">H. Trabajadas</th>
                      <th className="p-2 border">H. Sin Trabajar</th>
                      <th className="p-2 border">C. Componente</th>
                      <th className="p-2 border">C. Desconexión</th>
                      <th className="p-2 border">C. Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {politica2.map((it, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-2 border text-center">{it.horasTotales}</td>
                        <td className="p-2 border text-center">{it.tVidaC1}</td>
                        <td className="p-2 border text-center">{it.tVidaC2}</td>
                        <td className="p-2 border text-center">{it.tVidaC3}</td>
                        <td className="p-2 border text-center">{it.tVidaC4}</td>
                        <td className="p-2 border text-center">{it.horasTrabajadas}</td>
                        <td className="p-2 border text-center">{it.horasSinTrabajar}</td>
                        <td className="p-2 border text-center">${it.costoComponente}</td>
                        <td className="p-2 border text-center">${it.costoDesconexion}</td>
                        <td className="p-2 border text-center font-semibold">${it.costoTotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border p-4 text-sm space-y-2">
              <p>
                <strong>Costo total Política 1:</strong> ${costoTotalP1.toFixed(2)}
              </p>
              <p>
                <strong>Costo total Política 2:</strong> ${costoTotalP2.toFixed(2)}
              </p>
              <p>
                <strong>Menor costo:</strong> {mejorPolitica}
              </p>
              <p>
                <strong>Diferencia:</strong> ${Math.abs(costoTotalP1 - costoTotalP2).toFixed(2)}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}