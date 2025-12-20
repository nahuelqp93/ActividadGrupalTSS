import { useState } from 'react';
import Enunciado from '../utils/Enunciado';

const SEMILLA_LCG = 5678;

interface IteracionAlquiler {
  dia: number;
  r1: number;
  demanda: number;
  ocupadosIni: number;
  disponibles: number;
  aceptados: number;
  perdidos: number;
  ociosos: number;
  r2: number;
  diasRentados: number;
  ingresoDia: number;
  costoOcioso: number;
  costoFalta: number;
  beneficioDia: number;
  diaDevolucion: number;
}

interface Devolucion {
  dia: number;
  cantidad: number;
}

export default function Ejercicio3() {
  const [costoAnual, setCostoAnual] = useState(75000);
  const [rentaDiaria, setRentaDiaria] = useState(350);
  const [costoDisponible, setCostoDisponible] = useState(200);
  const [costoOcioso, setCostoOcioso] = useState(50);
  const [diasSimulacion, setDiasSimulacion] = useState(365);
  const [numAutos, setNumAutos] = useState(5);
  
  // Probabilidades de demanda
  const [probDemanda0, setProbDemanda0] = useState(0.10);
  const [probDemanda1, setProbDemanda1] = useState(0.10);
  const [probDemanda2, setProbDemanda2] = useState(0.25);
  const [probDemanda3, setProbDemanda3] = useState(0.30);
  const [probDemanda4, setProbDemanda4] = useState(0.25);
  
  // Probabilidades de días rentados 
  const [probDias1, setProbDias1] = useState(0.40);
  const [probDias2, setProbDias2] = useState(0.35);
  const [probDias3, setProbDias3] = useState(0.15);
  const [probDias4, setProbDias4] = useState(0.10);

  const [iteraciones, setIteraciones] = useState<IteracionAlquiler[]>([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [gananciaTotal, setGananciaTotal] = useState(0);

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

  const calcularDemanda = (r1: number): number => {
    const acum0 = probDemanda0;
    const acum1 = acum0 + probDemanda1;
    const acum2 = acum1 + probDemanda2;
    const acum3 = acum2 + probDemanda3;
    
    if (r1 <= acum0) return 0;
    if (r1 <= acum1) return 1;
    if (r1 <= acum2) return 2;
    if (r1 <= acum3) return 3;
    return 4;
  };

  const calcularDiasRentados = (r2: number, aceptados: number): number => {
    if (aceptados === 0) return 0;
    
    const acum1 = probDias1;
    const acum2 = acum1 + probDias2;
    const acum3 = acum2 + probDias3;
    
    if (r2 < acum1) return 1;
    if (r2 < acum2) return 2;
    if (r2 < acum3) return 3;
    return 4;
  };

  const simular = () => {
    const rng = createLCG(SEMILLA_LCG);
    const resultados: IteracionAlquiler[] = [];
    const devoluciones: Devolucion[] = [];

    let ociososAyer = 0;
    let gananciaAcumulada = 0;

    for (let dia = 1; dia <= diasSimulacion; dia++) {
      // Generar demanda
      const r1 = rng();
      const demanda = calcularDemanda(r1);

      // Calcular disponibles
      let disponibles: number;
      let ocupadosIni: number;
      
      if (dia === 1) {
        ocupadosIni = 0;
        disponibles = numAutos;
      } else {
        const devolucionesHoy = devoluciones
          .filter(d => d.dia === dia)
          .reduce((sum, d) => sum + d.cantidad, 0);
        disponibles = devolucionesHoy + ociososAyer;
        ocupadosIni = numAutos - disponibles;
      }

      // Determinar aceptados y perdidos
      const aceptados = Math.min(demanda, disponibles);
      const perdidos = Math.max(0, demanda - disponibles);

      // Autos ociosos del día
      const ociosos = disponibles - aceptados;

      // Días rentados
      const r2 = rng();
      const diasRentados = calcularDiasRentados(r2, aceptados);

      // Calcular costos e ingresos
      const ingresoDia = aceptados * rentaDiaria * diasRentados;
      const costoOciosoDia = ociosos * costoOcioso;
      const costoFaltaDia = perdidos * costoDisponible;
      const beneficioDia = ingresoDia - costoOciosoDia - costoFaltaDia;

      gananciaAcumulada += beneficioDia;

      // Registrar devolución
      let diaDevolucion = 0;
      if (aceptados > 0) {
        diaDevolucion = dia + diasRentados;
        devoluciones.push({
          dia: diaDevolucion,
          cantidad: aceptados
        });
      }

      resultados.push({
        dia,
        r1,
        demanda,
        ocupadosIni,
        disponibles,
        aceptados,
        perdidos,
        ociosos,
        r2,
        diasRentados,
        ingresoDia,
        costoOcioso: costoOciosoDia,
        costoFalta: costoFaltaDia,
        beneficioDia,
        diaDevolucion
      });

      ociososAyer = ociosos;
    }

    // Restar costo anual de mantenimiento
    const gananciaFinal = gananciaAcumulada - (numAutos * costoAnual);

    setIteraciones(resultados);
    setGananciaTotal(gananciaFinal);
    setMostrarResultados(true);
  };

  const totalIngresos = iteraciones.reduce((s, i) => s + i.ingresoDia, 0);
  const totalCostosOciosos = iteraciones.reduce((s, i) => s + i.costoOcioso, 0);
  const totalCostosFalta = iteraciones.reduce((s, i) => s + i.costoFalta, 0);

  return (
    <div className="min-h-screen bg-white p-6 text-black">
      <div className="max-w-7xl mx-auto space-y-6">
        <Enunciado
          titulo="Simulación de Alquiler de Autos"
          descripcion="Simulación de un sistema de alquiler de autos donde se evalúa la demanda diaria, disponibilidad, costos e ingresos durante un período determinado."
          preguntas={[
            'Ganancia total del período',
            'Total de ingresos generados',
            'Total de costos por autos ociosos',
            'Total de costos por falta de autos'
          ]}
          datos={[
            { label: 'Número de autos', valor: `${numAutos} autos` },
            { label: 'Días de simulación', valor: `${diasSimulacion} días` },
            { label: 'Renta diaria', valor: `${rentaDiaria} Bs.` },
            { label: 'Costo anual por auto', valor: `${costoAnual} Bs.` },
            { label: 'Costo por auto ocioso', valor: `${costoOcioso} Bs.` },
            { label: 'Costo por falta de auto', valor: `${costoDisponible} Bs.` }
          ]}
        />

        <div className="border p-4">
          <h3 className="font-semibold text-base mb-3">Distribución de demanda de autos</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2">Número de autos rentados por día</th>
                  <th className="border border-gray-300 px-4 py-2">0</th>
                  <th className="border border-gray-300 px-4 py-2">1</th>
                  <th className="border border-gray-300 px-4 py-2">2</th>
                  <th className="border border-gray-300 px-4 py-2">3</th>
                  <th className="border border-gray-300 px-4 py-2">4</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-medium">Probabilidad</td>
                  <td className="border border-gray-300 px-2 py-2 text-center">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={probDemanda0}
                      onChange={e => setProbDemanda0(+e.target.value)}
                      className="w-16 border p-1 text-center"
                    />
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-center">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={probDemanda1}
                      onChange={e => setProbDemanda1(+e.target.value)}
                      className="w-16 border p-1 text-center"
                    />
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-center">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={probDemanda2}
                      onChange={e => setProbDemanda2(+e.target.value)}
                      className="w-16 border p-1 text-center"
                    />
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-center">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={probDemanda3}
                      onChange={e => setProbDemanda3(+e.target.value)}
                      className="w-16 border p-1 text-center"
                    />
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-center">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={probDemanda4}
                      onChange={e => setProbDemanda4(+e.target.value)}
                      className="w-16 border p-1 text-center"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="border p-4">
          <h3 className="font-semibold text-base mb-3">Distribución de días rentados por auto</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2">Número de días rentados por auto</th>
                  <th className="border border-gray-300 px-4 py-2">1</th>
                  <th className="border border-gray-300 px-4 py-2">2</th>
                  <th className="border border-gray-300 px-4 py-2">3</th>
                  <th className="border border-gray-300 px-4 py-2">4</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-medium">Probabilidad</td>
                  <td className="border border-gray-300 px-2 py-2 text-center">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={probDias1}
                      onChange={e => setProbDias1(+e.target.value)}
                      className="w-16 border p-1 text-center"
                    />
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-center">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={probDias2}
                      onChange={e => setProbDias2(+e.target.value)}
                      className="w-16 border p-1 text-center"
                    />
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-center">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={probDias3}
                      onChange={e => setProbDias3(+e.target.value)}
                      className="w-16 border p-1 text-center"
                    />
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-center">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={probDias4}
                      onChange={e => setProbDias4(+e.target.value)}
                      className="w-16 border p-1 text-center"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="border p-4 space-y-4">
          <h3 className="font-semibold text-lg">Parámetros de simulación</h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <label>
              Costo anual por auto (Bs.)
              <input
                type="number"
                value={costoAnual}
                onChange={e => setCostoAnual(+e.target.value)}
                className="border p-1 w-full"
              />
            </label>

            <label>
              Renta diaria (Bs.)
              <input
                type="number"
                value={rentaDiaria}
                onChange={e => setRentaDiaria(+e.target.value)}
                className="border p-1 w-full"
              />
            </label>

            <label>
              Costo por auto no disponible (Bs.)
              <input
                type="number"
                value={costoDisponible}
                onChange={e => setCostoDisponible(+e.target.value)}
                className="border p-1 w-full"
              />
            </label>

            <label>
              Costo por auto ocioso (Bs.)
              <input
                type="number"
                value={costoOcioso}
                onChange={e => setCostoOcioso(+e.target.value)}
                className="border p-1 w-full"
              />
            </label>

            <label>
              Número de autos
              <input
                type="number"
                value={numAutos}
                onChange={e => setNumAutos(+e.target.value)}
                className="border p-1 w-full"
              />
            </label>

            <label>
              Días a simular
              <input
                type="number"
                value={diasSimulacion}
                onChange={e => setDiasSimulacion(+e.target.value)}
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
                    <th className="p-2 border">Día</th>
                    <th className="p-2 border">R1</th>
                    <th className="p-2 border">Demanda</th>
                    <th className="p-2 border">Ocupados Ini</th>
                    <th className="p-2 border">Disponibles</th>
                    <th className="p-2 border">Aceptados</th>
                    <th className="p-2 border">Perdidos</th>
                    <th className="p-2 border">Ociosos</th>
                    <th className="p-2 border">R2</th>
                    <th className="p-2 border">Días Rentados</th>
                    <th className="p-2 border">Ingreso Día</th>
                    <th className="p-2 border">Costo Ocioso</th>
                    <th className="p-2 border">Costo Falta</th>
                    <th className="p-2 border">Beneficio Día</th>
                    <th className="p-2 border">Día Devolución</th>
                  </tr>
                </thead>
                <tbody>
                  {iteraciones.map((it, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                      <td className="p-2 border text-center">{it.dia}</td>
                      <td className="p-2 border text-center">{it.r1.toFixed(2)}</td>
                      <td className="p-2 border text-center">{it.demanda}</td>
                      <td className="p-2 border text-center">{it.ocupadosIni}</td>
                      <td className="p-2 border text-center">{it.disponibles}</td>
                      <td className="p-2 border text-center">{it.aceptados}</td>
                      <td className="p-2 border text-center">{it.perdidos}</td>
                      <td className="p-2 border text-center">{it.ociosos}</td>
                      <td className="p-2 border text-center">{it.r2.toFixed(2)}</td>
                      <td className="p-2 border text-center">{it.diasRentados}</td>
                      <td className="p-2 border text-center">{it.ingresoDia}</td>
                      <td className="p-2 border text-center">{it.costoOcioso}</td>
                      <td className="p-2 border text-center">{it.costoFalta}</td>
                      <td className="p-2 border text-center">{it.beneficioDia}</td>
                      <td className="p-2 border text-center">{it.diaDevolucion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border p-4 text-sm space-y-2">
              <p>
                <strong> Ganancia total:</strong> {gananciaTotal.toFixed(0)} Bs.
              </p>
              <p>
                <strong>Total ingresos:</strong> {totalIngresos.toFixed(0)} Bs.
              </p>
              <p>
                <strong>Total costos ociosos:</strong> {totalCostosOciosos.toFixed(0)} Bs.
              </p>
              <p>
                <strong>Total costos por falta:</strong> {totalCostosFalta.toFixed(0)} Bs.
              </p>
              <p>
                <strong>Costo mantenimiento anual:</strong> {(numAutos * costoAnual).toFixed(0)} Bs.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
