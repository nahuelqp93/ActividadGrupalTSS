import { useState } from 'react';
import Enunciado from '../utils/Enunciado';
import FormulasBinomial from '../utils/FormulasBinomial';
import FormulasPoisson from '../utils/FormulasPoisson';

const SEMILLA_LCG = 3456;

interface IteracionEstrategia1 {
  dia: number;
  demandaDiaria: number;
  inventarioIni: number;
  vendidos: number;
  faltante: number;
  pedido: number;
  tiempoEntrega: number;
  inventarioFinal: number;
  diaEntrega: number;
  diaPedido: number;
  costoInventario: number;
  costoFaltante: number;
  costoOrden: number;
  costoTotal: number;
}

interface IteracionEstrategia2 {
  dia: number;
  demandaDiaria: number;
  inventarioIni: number;
  vendidos: number;
  faltante: number;
  pedido: number;
  tiempoEntrega: number;
  inventarioFinal: number;
  diaEntrega: number;
  estado: string;
  costoInventario: number;
  costoFaltante: number;
  costoOrden: number;
  costoTotal: number;
}

interface Entrega {
  dia: number;
  cantidad: number;
}

export default function SimulacionInventarioPoliticas() {
  const [n, setN] = useState(6);
  const [p, setP] = useState(0.5);
  const [lambda, setLambda] = useState(3);
  const [costoMantener, setCostoMantener] = useState(1);
  const [costoFaltante, setCostoFaltante] = useState(10);
  const [costoOrdenar, setCostoOrdenar] = useState(50);
  const [diasSimular, setDiasSimular] = useState(30);

  const [estrategia1, setEstrategia1] = useState<IteracionEstrategia1[]>([]);
  const [estrategia2, setEstrategia2] = useState<IteracionEstrategia2[]>([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [costoTotalE1, setCostoTotalE1] = useState(0);
  const [costoTotalE2, setCostoTotalE2] = useState(0);

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

  const factorial = (num: number): number => {
    if (num <= 1) return 1;
    return num * factorial(num - 1);
  };

  const combinaciones = (n: number, k: number): number => {
    if (k > n) return 0;
    return factorial(n) / (factorial(k) * factorial(n - k));
  };

  const probBinomial = (k: number, nVal: number, pVal: number): number => {
    return combinaciones(nVal, k) * Math.pow(pVal, k) * Math.pow(1 - pVal, nVal - k);
  };

  const calcularDemandaBinomial = (r: number): number => {
    let acumulada = 0;
    for (let k = 0; k <= n; k++) {
      acumulada += probBinomial(k, n, p);
      if (r <= acumulada) return k;
    }
    return n;
  };

  const probPoisson = (k: number, lambdaVal: number): number => {
    return (Math.pow(lambdaVal, k) * Math.exp(-lambdaVal)) / factorial(k);
  };

  const calcularTiempoEntregaPoisson = (r: number): number => {
    let acumulada = 0;
    let k = 0;
    const maxK = 20;
    while (k <= maxK) {
      acumulada += probPoisson(k, lambda);
      if (r <= acumulada) return k;
      k++;
    }
    return maxK;
  };

  const simularEstrategia1 = (rng: () => number) => {
    const resultados: IteracionEstrategia1[] = [];
    let inventarioFinalAnt = 30;
    let diaPedidoAnt = 9;
    const pedidosProgramados: Entrega[] = [];

    for (let dia = 1; dia <= diasSimular; dia++) {
      const r1 = rng();
      const demanda = calcularDemandaBinomial(r1);
      
      let inventarioIni = inventarioFinalAnt;
      const entregasHoy = pedidosProgramados
        .filter(p => p.dia === dia)
        .reduce((sum, p) => sum + p.cantidad, 0);
      inventarioIni += entregasHoy;

      const vendidos = Math.min(demanda, inventarioIni);
      const faltante = Math.max(0, demanda - inventarioIni);

      const pedido = dia === diaPedidoAnt ? 30 - inventarioIni : 0;

      const r2 = rng();
      const tiempoEntrega = pedido === 0 ? 0 : calcularTiempoEntregaPoisson(r2);

      let inventarioFinal = inventarioIni - vendidos;
      if (pedido > 0 && tiempoEntrega === 0) {
        inventarioFinal += pedido;
      }

      const diaEntrega = pedido === 0 ? 0 : dia + tiempoEntrega;
      if (pedido > 0) {
        pedidosProgramados.push({ dia: diaEntrega, cantidad: pedido });
      }

      const diaPedido = dia === diaPedidoAnt ? diaPedidoAnt + 8 : diaPedidoAnt;

      const costoInventario = inventarioFinal * costoMantener;
      const costoFalt = faltante * costoFaltante;
      const costoOrden = pedido === 0 ? 0 : costoOrdenar;
      const costoTotal = costoInventario + costoFalt + costoOrden;

      resultados.push({
        dia,
        demandaDiaria: demanda,
        inventarioIni,
        vendidos,
        faltante,
        pedido,
        tiempoEntrega,
        inventarioFinal,
        diaEntrega,
        diaPedido,
        costoInventario,
        costoFaltante: costoFalt,
        costoOrden,
        costoTotal
      });

      inventarioFinalAnt = inventarioFinal;
      diaPedidoAnt = diaPedido;
    }

    return resultados;
  };

  const simularEstrategia2 = (rng: () => number) => {
    const resultados: IteracionEstrategia2[] = [];
    let inventarioFinalAnt = 30;
    const pedidosProgramados: Entrega[] = [];

    for (let dia = 1; dia <= diasSimular; dia++) {
      const r1 = rng();
      const demanda = calcularDemandaBinomial(r1);

      let inventarioIni = inventarioFinalAnt;
      const entregasHoy = pedidosProgramados
        .filter(p => p.dia === dia)
        .reduce((sum, p) => sum + p.cantidad, 0);
      inventarioIni += entregasHoy;

      const vendidos = Math.min(demanda, inventarioIni);
      const faltante = Math.max(0, demanda - inventarioIni);

      let estado: string;
      if (dia === 1) {
        estado = 'puede pedir';
      } else {
        const maxDiaEntrega = Math.max(
          ...pedidosProgramados.map(p => p.dia),
          0
        );
        estado = maxDiaEntrega > dia ? 'no puede pedir' : 'puede pedir';
      }

      const pedido = inventarioIni < 10 && estado === 'puede pedir' ? 30 - inventarioIni : 0;

      const r2 = rng();
      const tiempoEntrega = pedido === 0 ? 0 : calcularTiempoEntregaPoisson(r2);

      let inventarioFinal = inventarioIni - vendidos;
      if (pedido > 0 && tiempoEntrega === 0) {
        inventarioFinal += pedido;
      }

      const diaEntrega = pedido === 0 ? 0 : dia + tiempoEntrega;
      if (pedido > 0) {
        pedidosProgramados.push({ dia: diaEntrega, cantidad: pedido });
      }

      const costoInventario = inventarioFinal * costoMantener;
      const costoFalt = faltante * costoFaltante;
      const costoOrden = pedido === 0 ? 0 : costoOrdenar;
      const costoTotal = costoInventario + costoFalt + costoOrden;

      resultados.push({
        dia,
        demandaDiaria: demanda,
        inventarioIni,
        vendidos,
        faltante,
        pedido,
        tiempoEntrega,
        inventarioFinal,
        diaEntrega,
        estado,
        costoInventario,
        costoFaltante: costoFalt,
        costoOrden,
        costoTotal
      });

      inventarioFinalAnt = inventarioFinal;
    }

    return resultados;
  };

  const simular = () => {
    const rng1 = createLCG(SEMILLA_LCG);
    const rng2 = createLCG(SEMILLA_LCG);

    const resultadosE1 = simularEstrategia1(rng1);
    const resultadosE2 = simularEstrategia2(rng2);

    const costoE1 = resultadosE1.reduce((sum, r) => sum + r.costoTotal, 0);
    const costoE2 = resultadosE2.reduce((sum, r) => sum + r.costoTotal, 0);

    setEstrategia1(resultadosE1);
    setEstrategia2(resultadosE2);
    setCostoTotalE1(costoE1);
    setCostoTotalE2(costoE2);
    setMostrarResultados(true);
  };

  const mejorEstrategia = costoTotalE1 < costoTotalE2 ? 'Estrategia 1' : costoTotalE2 < costoTotalE1 ? 'Estrategia 2' : 'Ambas tienen el mismo costo';

  return (
    <div className="min-h-screen bg-white p-6 text-black">
      <div className="max-w-7xl mx-auto space-y-6">
        <Enunciado
          titulo="Comparación de Políticas de Inventario"
          descripcion="La simulación compara dos estrategias de gestión de inventario: Estrategia 1 (pedidos cada 8 días) vs Estrategia 2 (pedido cuando inventario < 10). Se busca determinar cuál política es la mas económica."
          preguntas={[
            'Costo total de cada estrategia',
            'Estrategia con menor costo',
            'Diferencia de costos entre estrategias'
          ]}
          datos={[
            { label: 'Demanda', valor: `Binomial(n=${n}, p=${p})` },
            { label: 'Tiempo entrega', valor: `Poisson(λ=${lambda})` },
            { label: 'Costo mantener', valor: `${costoMantener}$ por unidad` },
            { label: 'Costo faltante', valor: `${costoFaltante}$ por unidad` },
            { label: 'Costo ordenar', valor: `${costoOrdenar}$ por orden` }
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormulasBinomial n={n} p={p} />
          <FormulasPoisson lambda={lambda} unidad="días" />
        </div>

        <div className="border p-4 space-y-4">
          <h3 className="font-semibold text-lg">Parámetros de simulación</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <label>
              n (Binomial)
              <input
                type="number"
                value={n}
                onChange={e => setN(+e.target.value)}
                className="border p-1 w-full"
              />
            </label>

            <label>
              p (Probabilidad)
              <input
                type="number"
                step="0.01"
                value={p}
                onChange={e => setP(+e.target.value)}
                className="border p-1 w-full"
              />
            </label>

            <label>
              λ (Poisson)
              <input
                type="number"
                value={lambda}
                onChange={e => setLambda(+e.target.value)}
                className="border p-1 w-full"
              />
            </label>

            <label>
              Costo mantener ($)
              <input
                type="number"
                value={costoMantener}
                onChange={e => setCostoMantener(+e.target.value)}
                className="border p-1 w-full"
              />
            </label>

            <label>
              Costo faltante ($)
              <input
                type="number"
                value={costoFaltante}
                onChange={e => setCostoFaltante(+e.target.value)}
                className="border p-1 w-full"
              />
            </label>

            <label>
              Costo ordenar ($)
              <input
                type="number"
                value={costoOrdenar}
                onChange={e => setCostoOrdenar(+e.target.value)}
                className="border p-1 w-full"
              />
            </label>

            <label>
              Días a simular
              <input
                type="number"
                value={diasSimular}
                onChange={e => setDiasSimular(+e.target.value)}
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
              <h3 className="font-semibold text-lg mb-3">Estrategia 1 - Pedidos cada 8 días</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="p-2 border">Día</th>
                      <th className="p-2 border">Demanda</th>
                      <th className="p-2 border">Inv. Ini</th>
                      <th className="p-2 border">Vendidos</th>
                      <th className="p-2 border">Faltante</th>
                      <th className="p-2 border">Pedido</th>
                      <th className="p-2 border">T. Entrega</th>
                      <th className="p-2 border">Inv. Final</th>
                      <th className="p-2 border">Día Entrega</th>
                      <th className="p-2 border">Día Pedido</th>
                      <th className="p-2 border">C. Inv</th>
                      <th className="p-2 border">C. Falt</th>
                      <th className="p-2 border">C. Orden</th>
                      <th className="p-2 border">C. Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estrategia1.map((it, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-2 border text-center">{it.dia}</td>
                        <td className="p-2 border text-center">{it.demandaDiaria}</td>
                        <td className="p-2 border text-center">{it.inventarioIni}</td>
                        <td className="p-2 border text-center">{it.vendidos}</td>
                        <td className="p-2 border text-center">{it.faltante}</td>
                        <td className="p-2 border text-center">{it.pedido}</td>
                        <td className="p-2 border text-center">{it.tiempoEntrega}</td>
                        <td className="p-2 border text-center">{it.inventarioFinal}</td>
                        <td className="p-2 border text-center">{it.diaEntrega}</td>
                        <td className="p-2 border text-center">{it.diaPedido}</td>
                        <td className="p-2 border text-center">{it.costoInventario}</td>
                        <td className="p-2 border text-center">{it.costoFaltante}</td>
                        <td className="p-2 border text-center">{it.costoOrden}</td>
                        <td className="p-2 border text-center font-semibold">{it.costoTotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border p-4 space-y-2">
              <h3 className="font-semibold text-lg mb-3">Estrategia 2 - Pedido cuando inventario {'<'} 10</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="p-2 border">Día</th>
                      <th className="p-2 border">Demanda</th>
                      <th className="p-2 border">Inv. Ini</th>
                      <th className="p-2 border">Vendidos</th>
                      <th className="p-2 border">Faltante</th>
                      <th className="p-2 border">Pedido</th>
                      <th className="p-2 border">T. Entrega</th>
                      <th className="p-2 border">Inv. Final</th>
                      <th className="p-2 border">Día Entrega</th>
                      <th className="p-2 border">Estado</th>
                      <th className="p-2 border">C. Inv</th>
                      <th className="p-2 border">C. Falt</th>
                      <th className="p-2 border">C. Orden</th>
                      <th className="p-2 border">C. Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estrategia2.map((it, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-2 border text-center">{it.dia}</td>
                        <td className="p-2 border text-center">{it.demandaDiaria}</td>
                        <td className="p-2 border text-center">{it.inventarioIni}</td>
                        <td className="p-2 border text-center">{it.vendidos}</td>
                        <td className="p-2 border text-center">{it.faltante}</td>
                        <td className="p-2 border text-center">{it.pedido}</td>
                        <td className="p-2 border text-center">{it.tiempoEntrega}</td>
                        <td className="p-2 border text-center">{it.inventarioFinal}</td>
                        <td className="p-2 border text-center">{it.diaEntrega}</td>
                        <td className="p-2 border text-center">{it.estado}</td>
                        <td className="p-2 border text-center">{it.costoInventario}</td>
                        <td className="p-2 border text-center">{it.costoFaltante}</td>
                        <td className="p-2 border text-center">{it.costoOrden}</td>
                        <td className="p-2 border text-center font-semibold">{it.costoTotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border p-4 text-sm space-y-2">
              <p>
                <strong>Costo total Estrategia 1:</strong> ${costoTotalE1.toFixed(2)}
              </p>
              <p>
                <strong>Costo total Estrategia 2:</strong> ${costoTotalE2.toFixed(2)}
              </p>
              <p>
                <strong>Menor costo:</strong> {mejorEstrategia}
              </p>
              <p>
                <strong>Diferencia:</strong> ${Math.abs(costoTotalE1 - costoTotalE2).toFixed(2)}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
