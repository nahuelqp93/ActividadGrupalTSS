import { useState } from 'react';
import { RefreshCcw, BookOpen, Package } from 'lucide-react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export default function Ejercicio25Inventario() {
  const [simulacion1, setSimulacion1] = useState<any[]>([]);
  const [simulacion2, setSimulacion2] = useState<any[]>([]);
  const [resumen, setResumen] = useState<any>(null);
  const [diasSimular] = useState(50);
  
  // Parámetros del problema
  const INVENTARIO_OBJETIVO = 30;
  const COSTO_FALTANTE = 10;
  const COSTO_ORDEN = 50;
  const PUNTO_REORDEN = 10;
  const PERIODO_REVISION = 8;
  
  // Tabla de demanda Binomial(n=6, p=0.5)
  const tablaDemanda = [
    { valor: 0, prob: 0.0156, acumulada: 0.0156, rango: [0, 0.0156] },
    { valor: 1, prob: 0.0938, acumulada: 0.1094, rango: [0.0156, 0.1094] },
    { valor: 2, prob: 0.2344, acumulada: 0.3438, rango: [0.1094, 0.3438] },
    { valor: 3, prob: 0.3125, acumulada: 0.6563, rango: [0.3438, 0.6563] },
    { valor: 4, prob: 0.2344, acumulada: 0.8907, rango: [0.6563, 0.8907] },
    { valor: 5, prob: 0.0938, acumulada: 0.9845, rango: [0.8907, 0.9845] },
    { valor: 6, prob: 0.0156, acumulada: 1.0000, rango: [0.9845, 1.0000] }
  ];

  // Tabla de tiempo de entrega Poisson(λ=3)
  const tablaTiempoEntrega = [
    { valor: 0, prob: 0.0498, acumulada: 0.0498, rango: [0, 0.0498] },
    { valor: 1, prob: 0.1494, acumulada: 0.1992, rango: [0.0498, 0.1992] },
    { valor: 2, prob: 0.2240, acumulada: 0.4232, rango: [0.1992, 0.4232] },
    { valor: 3, prob: 0.2240, acumulada: 0.6472, rango: [0.4232, 0.6472] },
    { valor: 4, prob: 0.1680, acumulada: 0.8152, rango: [0.6472, 0.8152] },
    { valor: 5, prob: 0.1008, acumulada: 0.9160, rango: [0.8152, 0.9160] },
    { valor: 6, prob: 0.0504, acumulada: 0.9664, rango: [0.9160, 0.9664] },
    { valor: 7, prob: 0.0216, acumulada: 0.9880, rango: [0.9664, 0.9880] },
    { valor: 8, prob: 0.0081, acumulada: 0.9961, rango: [0.9880, 0.9961] },
    { valor: 9, prob: 0.0027, acumulada: 0.9988, rango: [0.9961, 0.9988] },
    { valor: 10, prob: 0.0008, acumulada: 0.9996, rango: [0.9988, 0.9996] },
    { valor: 11, prob: 0.0002, acumulada: 1.0000, rango: [0.9996, 1.0000] }
  ];

  const obtenerDemanda = (r: number): number => {
    for (const row of tablaDemanda) {
      if (r >= row.rango[0] && r < row.rango[1]) {
        return row.valor;
      }
    }
    return tablaDemanda[tablaDemanda.length - 1].valor;
  };

  const obtenerTiempoEntrega = (r: number): number => {
    for (const row of tablaTiempoEntrega) {
      if (r >= row.rango[0] && r < row.rango[1]) {
        return row.valor;
      }
    }
    return tablaTiempoEntrega[tablaTiempoEntrega.length - 1].valor;
  };

  // Política 1: Ordenar cada 8 días hasta 30
  const simularPolitica1 = () => {
    const resultados = [];
    let inventarioFinalAnt = INVENTARIO_OBJETIVO;
    let diaPedidoAnt = 9;
    const pedidosProgramados: Array<{diaEntrega: number, cantidad: number}> = [];

    for (let dia = 1; dia <= diasSimular; dia++) {
      const R1 = Math.random();
      const demanda = obtenerDemanda(R1);
      
      // Calcular inventario inicial del día
      let invInicial = inventarioFinalAnt;
      
      // Sumar entregas de hoy
      const entregasHoy = pedidosProgramados
        .filter(p => p.diaEntrega === dia)
        .reduce((sum, p) => sum + p.cantidad, 0);
      invInicial += entregasHoy;
      
      // Vendidos y faltantes
      const vendidos = Math.min(demanda, invInicial);
      const faltante = Math.max(0, demanda - invInicial);
      
      // Calcular pedido
      let pedido = 0;
      let diaPedido = diaPedidoAnt;
      
      if (dia === diaPedidoAnt) {
        pedido = INVENTARIO_OBJETIVO - invInicial;
        diaPedido = diaPedidoAnt + PERIODO_REVISION;
      }
      
      // Calcular tiempo de entrega
      let tiempoEntrega = 0;
      let R2 = 0;
      let diaEntrega = 0;
      
      if (pedido > 0) {
        R2 = Math.random();
        tiempoEntrega = obtenerTiempoEntrega(R2);
        diaEntrega = dia + tiempoEntrega;
        pedidosProgramados.push({ diaEntrega, cantidad: pedido });
      }
      
      // Inventario final
      let inventarioFinal = invInicial - vendidos;
      
      // Si tiempo_entrega es 0, el pedido llega inmediatamente
      if (pedido > 0 && tiempoEntrega === 0) {
        inventarioFinal += pedido;
      }
      
      // Costos
      const costoInventario = inventarioFinal;
      const costoFaltante = faltante * COSTO_FALTANTE;
      const costoOrden = pedido > 0 ? COSTO_ORDEN : 0;
      const costoTotal = costoInventario + costoFaltante + costoOrden;
      
      resultados.push({
        dia,
        R1: R1.toFixed(4),
        demanda,
        inventarioInicial: invInicial,
        vendidos,
        faltante,
        pedido,
        diaPedido,
        R2: pedido > 0 ? R2.toFixed(4) : '-',
        tiempoEntrega: pedido > 0 ? tiempoEntrega : '-',
        diaEntrega: pedido > 0 ? diaEntrega : '-',
        inventarioFinal,
        costoInventario,
        costoFaltante,
        costoOrden,
        costoTotal
      });
      
      inventarioFinalAnt = inventarioFinal;
      diaPedidoAnt = diaPedido;
    }
    
    return resultados;
  };

  // Política 2: Ordenar cuando inventario ≤ 10
  const simularPolitica2 = () => {
    const resultados = [];
    let inventarioFinalAnt = INVENTARIO_OBJETIVO;
    const pedidosProgramados: Array<{diaEntrega: number, cantidad: number}> = [];

    for (let dia = 1; dia <= diasSimular; dia++) {
      const R1 = Math.random();
      const demanda = obtenerDemanda(R1);
      
      // Calcular inventario inicial del día
      let invInicial = inventarioFinalAnt;
      
      // Sumar entregas de hoy
      const entregasHoy = pedidosProgramados
        .filter(p => p.diaEntrega === dia)
        .reduce((sum, p) => sum + p.cantidad, 0);
      invInicial += entregasHoy;
      
      // Vendidos y faltantes
      const vendidos = Math.min(demanda, invInicial);
      const faltante = Math.max(0, demanda - invInicial);
      
      // Determinar si puede pedir
      let puedePedir = "Puede pedir";
      
      if (dia === 1) {
        puedePedir = "Puede pedir";
      } else {
        const maxDiaEntrega = Math.max(...pedidosProgramados.map(p => p.diaEntrega), 0);
        if (maxDiaEntrega > dia) {
          puedePedir = "No puede pedir";
        }
      }
      
      // Calcular pedido
      let pedido = 0;
      let tiempoEntrega = 0;
      let R2 = 0;
      let diaEntrega = 0;
      
      if (invInicial < PUNTO_REORDEN && puedePedir === "Puede pedir") {
        pedido = INVENTARIO_OBJETIVO - invInicial;
      }
      
      // Calcular tiempo de entrega
      if (pedido > 0) {
        R2 = Math.random();
        tiempoEntrega = obtenerTiempoEntrega(R2);
        diaEntrega = dia + tiempoEntrega;
        pedidosProgramados.push({ diaEntrega, cantidad: pedido });
      }
      
      // Inventario final
      let inventarioFinal = invInicial - vendidos;
      
      // Si tiempo_entrega es 0, el pedido llega inmediatamente
      if (pedido > 0 && tiempoEntrega === 0) {
        inventarioFinal += pedido;
      }
      
      // Costos
      const costoInventario = inventarioFinal;
      const costoFaltante = faltante * COSTO_FALTANTE;
      const costoOrden = pedido > 0 ? COSTO_ORDEN : 0;
      const costoTotal = costoInventario + costoFaltante + costoOrden;
      
      resultados.push({
        dia,
        R1: R1.toFixed(4),
        demanda,
        inventarioInicial: invInicial,
        vendidos,
        faltante,
        puedePedir,
        pedido,
        R2: pedido > 0 ? R2.toFixed(4) : '-',
        tiempoEntrega: pedido > 0 ? tiempoEntrega : '-',
        diaEntrega: pedido > 0 ? diaEntrega : '-',
        inventarioFinal,
        costoInventario,
        costoFaltante,
        costoOrden,
        costoTotal
      });
      
      inventarioFinalAnt = inventarioFinal;
    }
    
    return resultados;
  };

  const simular = () => {
    const res1 = simularPolitica1();
    const res2 = simularPolitica2();
    
    const costoTotal1 = res1.reduce((sum, r) => sum + r.costoTotal, 0);
    const costoTotal2 = res2.reduce((sum, r) => sum + r.costoTotal, 0);
    
    setSimulacion1(res1);
    setSimulacion2(res2);
    setResumen({
      costoTotal1,
      costoTotal2,
      mejorPolitica: costoTotal1 < costoTotal2 ? 'Política 1' : 'Política 2',
      diferencia: Math.abs(costoTotal1 - costoTotal2)
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
           <div>
             <h1 className="text-2xl font-bold text-slate-900">Ejercicio 2.6: Políticas de Inventario</h1>
             <p className="text-slate-600 text-sm mt-1">Simulación Monte Carlo para comparar estrategias de reabastecimiento</p>
           </div>
           <div className="p-4 bg-blue-50 rounded-lg">
             <Package size={32} className="text-blue-600" />
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-blue-600"/>
            Datos del Problema
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3 text-sm">
              <h3 className="font-bold text-slate-700 mb-3">Parámetros Económicos</h3>
              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <div className="flex justify-between mb-2">
                  <span>Inventario objetivo:</span>
                  <span className="font-bold">30 unidades</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Costo de mantener:</span>
                  <span className="font-bold">$1 por unidad/día</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Costo de faltante:</span>
                  <span className="font-bold">$10 por unidad</span>
                </div>
                <div className="flex justify-between">
                  <span>Costo de ordenar:</span>
                  <span className="font-bold">$50 por orden</span>
                </div>
              </div>

              <h3 className="font-bold text-slate-700 mb-2 mt-4">Políticas a Comparar</h3>
              <div className="space-y-2">
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <p className="font-semibold text-blue-900">Política 1:</p>
                  <p className="text-xs text-slate-600">Ordenar cada 8 días hasta tener 30 artículos</p>
                </div>
                <div className="bg-purple-50 p-3 rounded border border-purple-200">
                  <p className="font-semibold text-purple-900">Política 2:</p>
                  <p className="text-xs text-slate-600">Ordenar hasta 30 cuando inventario ≤ 10</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-slate-700 mb-2 text-sm">Demanda diaria (Binomial n=6, p=0.5)</h3>
                <div className="overflow-x-auto max-h-40 overflow-y-auto">
                  <table className="w-full text-xs border border-slate-200">
                    <thead className="bg-slate-100 sticky top-0">
                      <tr>
                        <th className="px-2 py-1 border">Valor</th>
                        <th className="px-2 py-1 border">Prob.</th>
                        <th className="px-2 py-1 border">Rango</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tablaDemanda.map((row, idx) => (
                        <tr key={idx}>
                          <td className="px-2 py-1 border text-center">{row.valor}</td>
                          <td className="px-2 py-1 border text-center">{row.prob.toFixed(4)}</td>
                          <td className="px-2 py-1 border text-center text-xs">{row.rango[0].toFixed(4)} - {row.rango[1].toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-700 mb-2 text-sm">Tiempo entrega (Poisson λ=3)</h3>
                <div className="overflow-x-auto max-h-40 overflow-y-auto">
                  <table className="w-full text-xs border border-slate-200">
                    <thead className="bg-slate-100 sticky top-0">
                      <tr>
                        <th className="px-2 py-1 border">Días</th>
                        <th className="px-2 py-1 border">Prob.</th>
                        <th className="px-2 py-1 border">Rango</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tablaTiempoEntrega.map((row, idx) => (
                        <tr key={idx}>
                          <td className="px-2 py-1 border text-center">{row.valor}</td>
                          <td className="px-2 py-1 border text-center">{row.prob.toFixed(4)}</td>
                          <td className="px-2 py-1 border text-center text-xs">{row.rango[0].toFixed(4)} - {row.rango[1].toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- PASOS DE LAS POLÍTICAS --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Pasos de las Simulaciones</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Política 1 */}
            <div className="space-y-3">
              <h3 className="font-bold text-blue-700 mb-3 text-sm">POLÍTICA 1: Ordenar cada 8 días</h3>
              
              <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                <p className="font-bold text-blue-900 text-sm">Paso 1: Generar R1</p>
                <p className="text-xs text-slate-600 mt-1">R1 ← generadorCongruencialMixto()</p>
              </div>
              
              <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                <p className="font-bold text-blue-900 text-sm">Paso 2: Calcular demanda</p>
                <p className="text-xs text-slate-600 mt-1 mb-2">Usar tabla Binomial(n=6, p=0.5):</p>
                <BlockMath math="Demanda \rightarrow binomial(n=6, \; p=0.5)" />
                <BlockMath math="P(X=k) = \binom{n}{k} p^k (1-p)^{n-k}, \; k=0,1,2,3,4,5,6" />
                <p className="text-xs text-slate-600 mt-2">
                  n = número de ensayos = 6<br/>
                  k = número de éxitos<br/>
                  p = probabilidad de éxito = 0.50
                </p>
                <BlockMath math="\binom{n}{k} = \frac{n!}{k!(n-k)!} = \frac{6!}{k!(6-k)!}" />
                <div className="mt-3 space-y-2 text-xs">
                  <p className="font-semibold text-blue-800">Ejemplos de cálculo:</p>
                  <div className="bg-white p-2 rounded">
                    <p className="font-semibold">Para K = 0:</p>
                    <BlockMath math="P(X=0) = \binom{6}{0} 0.50^0 (1-0.50)^{6-0} = \frac{6!}{0!(6-0)!} \times 0.50^0 \times (1-0.50)^{6-0} = 0.0156" />
                  </div>
                  <div className="bg-white p-2 rounded">
                    <p className="font-semibold">Para K = 1:</p>
                    <BlockMath math="P(X=1) = \binom{6}{1} 0.50^1 (1-0.50)^{6-1} = \frac{6!}{1!(6-1)!} \times 0.50^1 \times (1-0.50)^{6-1} = 0.0938" />
                  </div>
                  <div className="bg-white p-2 rounded">
                    <p className="font-semibold">Para K = 2:</p>
                    <BlockMath math="P(X=2) = \binom{6}{2} 0.50^2 (1-0.50)^{6-2} = \frac{6!}{2!(6-2)!} \times 0.50^2 \times (1-0.50)^{6-2} = 0.2344" />
                  </div>
                </div>
                <div className="mt-3 p-3 bg-blue-100 rounded">
                  <p className="font-semibold text-blue-900 text-xs mb-2">Entonces:</p>
                  <div className="text-xs space-y-1 font-mono text-blue-800">
                    <p>R1 &lt; 0.0156 → Demanda = 0</p>
                    <p>0.0156 &lt; R1 &lt; 0.1094 → Demanda = 1</p>
                    <p>0.1094 &lt; R1 &lt; 0.3438 → Demanda = 2</p>
                    <p>0.3438 &lt; R1 &lt; 0.6563 → Demanda = 3</p>
                    <p>0.6563 &lt; R1 &lt; 0.8907 → Demanda = 4</p>
                    <p>0.8907 &lt; R1 &lt; 0.9845 → Demanda = 5</p>
                    <p>0.9845 &lt; R1 &lt; 1 → Demanda = 6</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                <p className="font-bold text-blue-900 text-sm">Paso 3: Calculamos el inventario inicial del día</p>
                <div className="text-xs text-slate-700 mt-2 space-y-2 font-mono">
                  <div className="ml-2">
                    <p className="font-semibold">Si (Día == 1)</p>
                    <div className="ml-4 space-y-1">
                      <p><span className="font-semibold underline">Inventario_inicial</span> = 30</p>
                      <p><span className="font-semibold underline">Día_Entrega</span> = 0</p>
                    </div>
                  </div>
                  
                  <div className="ml-2">
                    <p className="font-semibold">Sino</p>
                    <div className="ml-4 space-y-2">
                      <div>
                        <p className="font-semibold">Si (Día == <span className="underline">Día_entrega</span>)</p>
                        <div className="ml-4 space-y-1">
                          <p><span className="font-semibold underline">Inventario_inicial</span> = <span className="underline">Inventario_Final</span> + Pedido</p>
                          <p><span className="font-semibold underline">Día_entrega</span> = 0</p>
                        </div>
                      </div>
                      
                      <div className="ml-0">
                        <p className="font-semibold">Sino</p>
                        <div className="ml-4">
                          <p><span className="font-semibold underline">Inventario_inicial</span> = Inventario_Final</p>
                        </div>
                      </div>
                      
                      <p className="text-red-600 font-semibold ml-0">Finsi</p>
                    </div>
                  </div>
                  
                  <p className="text-red-600 font-semibold">Finsi</p>
                </div>
              </div>
              
              <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                <p className="font-bold text-green-900 text-sm">Paso 4: Calcular vendidos</p>
                <p className="text-xs text-slate-600 mt-1">Vendidos = Mínimo(Demanda, Inv_inicial)</p>
              </div>
              
              <div className="p-3 bg-red-50 rounded border-l-4 border-red-500">
                <p className="font-bold text-red-900 text-sm">Paso 5: Calcular faltantes</p>
                <p className="text-xs text-slate-600 mt-1">Faltante = Máximo(0, Demanda - Inv_inicial)</p>
              </div>
              
              <div className="p-3 bg-orange-50 rounded border-l-4 border-orange-500">
                <p className="font-bold text-orange-900 text-sm">Paso 6: Calculamos la cantidad de nuestro pedido para este día:</p>
                <div className="text-xs text-slate-700 mt-2 space-y-2 font-mono">
                  <div className="ml-2">
                    <p className="font-semibold">Si (Día == 1)</p>
                    <div className="ml-4 space-y-1">
                      <p><span className="font-semibold">Pedido</span> = 0</p>
                      <p><span className="font-semibold">Día_pedido</span> = 9</p>
                    </div>
                  </div>
                  
                  <div className="ml-2">
                    <p className="font-semibold">Sino</p>
                    <div className="ml-4 space-y-2">
                      <div>
                        <p className="font-semibold">Si (Día == Día_pedido)</p>
                        <div className="ml-4 space-y-1">
                          <p><span className="font-semibold">Pedido</span> = 30 - <span className="underline">Inventario_inicial</span></p>
                          <p><span className="font-semibold">Día_pedido</span> = Día + 8</p>
                        </div>
                      </div>
                      
                      <div className="ml-0">
                        <p className="font-semibold">Sino</p>
                        <div className="ml-4">
                          <p><span className="font-semibold">Pedido</span> = 0</p>
                        </div>
                      </div>
                      
                      <p className="text-red-600 font-semibold ml-0">Finsi</p>
                    </div>
                  </div>
                  
                  <p className="text-red-600 font-semibold">Finsi</p>
                </div>
              </div>
              
              <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-500">
                <p className="font-bold text-purple-900 text-sm">Paso 7: Generar R2 (si hay pedido)</p>
                <p className="text-xs text-slate-600 mt-1">R2 ← Math.random()</p>
              </div>
              
              <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-500">
                <p className="font-bold text-purple-900 text-sm">Paso 8: Calcular tiempo de entrega</p>
                <p className="text-xs text-slate-600 mt-1 mb-2">Si el pedido es mayor a 0 entonces calculamos el tiempo de entrega.</p>
                <p className="text-xs text-slate-600 mb-2">Para generar el tiempo de entrega debemos usar la fórmula de Poisson la cual es la siguiente:</p>
                <BlockMath math="Tiempo\_entrega \rightarrow Poisson(\lambda=3)" />
                <BlockMath math="P(X=k) = \frac{\lambda^k \times e^{-\lambda}}{k!}, \; k=0,1,2,..." />
                <p className="text-xs text-slate-600 mt-2">
                  λ = Tiempo promedio de entrega de un artículo = 3<br/>
                  k = Tiempo de entrega en días
                </p>
                <div className="mt-3 space-y-2 text-xs">
                  <p className="font-semibold text-purple-800">Ejemplos de cálculo:</p>
                  <div className="bg-white p-2 rounded">
                    <p className="font-semibold">Para K = 0:</p>
                    <BlockMath math="P(X=0) = \frac{3^0 \times e^{-3}}{0!} = 0.0498" />
                  </div>
                  <div className="bg-white p-2 rounded">
                    <p className="font-semibold">Para K = 1:</p>
                    <BlockMath math="P(X=1) = \frac{3^1 \times e^{-3}}{1!} = 0.1494" />
                  </div>
                  <div className="bg-white p-2 rounded">
                    <p className="font-semibold">Para K = 2:</p>
                    <BlockMath math="P(X=2) = \frac{3^2 \times e^{-3}}{2!} = 0.2240" />
                  </div>
                </div>
                <div className="mt-3 p-3 bg-purple-100 rounded">
                  <p className="font-semibold text-purple-900 text-xs mb-2">Entonces:</p>
                  <div className="text-xs space-y-1 font-mono text-purple-800">
                    <p>R2 &lt; 0.0498 → Tiempo_entrega = 0</p>
                    <p>0.0498 &lt; R2 &lt; 0.1992 → Tiempo_entrega = 1</p>
                    <p>0.1992 &lt; R2 &lt; 0.4232 → Tiempo_entrega = 2</p>
                    <p>0.4232 &lt; R2 &lt; 0.6472 → Tiempo_entrega = 3</p>
                    <p>0.6472 &lt; R2 &lt; 0.8152 → Tiempo_entrega = 4</p>
                    <p>0.8152 &lt; R2 &lt; 0.9160 → Tiempo_entrega = 5</p>
                    <p>0.9160 &lt; R2 &lt; 0.9664 → Tiempo_entrega = 6</p>
                    <p>0.9664 &lt; R2 &lt; 0.9880 → Tiempo_entrega = 7</p>
                    <p>0.9880 &lt; R2 &lt; 0.9961 → Tiempo_entrega = 8</p>
                    <p>0.9961 &lt; R2 &lt; 0.9988 → Tiempo_entrega = 9</p>
                    <p>0.9988 &lt; R2 &lt; 0.9996 → Tiempo_entrega = 10</p>
                    <p>0.9996 &lt; R2 &lt; 1 → Tiempo_entrega = 11</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-3">Si (pedido {'>'} 0): Día_entrega = Día + Tiempo_entrega</p>
              </div>
              
              <div className="p-3 bg-slate-50 rounded border-l-4 border-slate-500">
                <p className="font-bold text-slate-900 text-sm">Paso 9: Calcular inventario final</p>
                <p className="text-xs text-slate-600 mt-1">Inv_final = Inv_inicial - Vendidos</p>
              </div>
              
              <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-500">
                <p className="font-bold text-yellow-900 text-sm">Paso 10: Calcular costos</p>
                <p className="text-xs text-slate-600 mt-1">
                  C_inventario = Inv_final<br/>
                  C_faltante = Faltante × 10<br/>
                  C_orden = Pedido {'>'} 0 ? 50 : 0<br/>
                  C_total = C_inventario + C_faltante + C_orden
                </p>
              </div>
              
              <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                <p className="font-bold text-green-900 text-sm">Paso 11: Repetir los pasos anteriores igual a la cantidad de dias que queramos simular</p>

              </div>
            </div>

            {/* Política 2 */}
            <div className="space-y-3">
              <h3 className="font-bold text-purple-700 mb-3 text-sm">POLÍTICA 2: Ordenar cuando inventario ≤ 10</h3>
              
              <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-500">
                <p className="font-bold text-purple-900 text-sm">Paso 1: Generar R1</p>
                <p className="text-xs text-slate-600 mt-1">R1 ← generadorCongruencialMixto()</p>
              </div>
              
              <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-500">
                <p className="font-bold text-purple-900 text-sm">Paso 2: Calcular demanda</p>
                <p className="text-xs text-slate-600 mt-1 mb-2">Usar tabla Binomial(n=6, p=0.5):</p>
                <BlockMath math="Demanda \rightarrow binomial(n=6, \; p=0.5)" />
                <BlockMath math="P(X=k) = \binom{n}{k} p^k (1-p)^{n-k}, \; k=0,1,2,3,4,5,6" />
                <p className="text-xs text-slate-600 mt-2">
                  n = número de ensayos = 6<br/>
                  k = número de éxitos<br/>
                  p = probabilidad de éxito = 0.50
                </p>
                <BlockMath math="\binom{n}{k} = \frac{n!}{k!(n-k)!} = \frac{6!}{k!(6-k)!}" />
                <div className="mt-3 space-y-2 text-xs">
                  <p className="font-semibold text-purple-800">Ejemplos de cálculo:</p>
                  <div className="bg-white p-2 rounded">
                    <p className="font-semibold">Para K = 0:</p>
                    <BlockMath math="P(X=0) = \binom{6}{0} 0.50^0 (1-0.50)^{6-0} = \frac{6!}{0!(6-0)!} \times 0.50^0 \times (1-0.50)^{6-0} = 0.0156" />
                  </div>
                  <div className="bg-white p-2 rounded">
                    <p className="font-semibold">Para K = 1:</p>
                    <BlockMath math="P(X=1) = \binom{6}{1} 0.50^1 (1-0.50)^{6-1} = \frac{6!}{1!(6-1)!} \times 0.50^1 \times (1-0.50)^{6-1} = 0.0938" />
                  </div>
                  <div className="bg-white p-2 rounded">
                    <p className="font-semibold">Para K = 2:</p>
                    <BlockMath math="P(X=2) = \binom{6}{2} 0.50^2 (1-0.50)^{6-2} = \frac{6!}{2!(6-2)!} \times 0.50^2 \times (1-0.50)^{6-2} = 0.2344" />
                  </div>
                </div>
                <div className="mt-3 p-3 bg-purple-100 rounded">
                  <p className="font-semibold text-purple-900 text-xs mb-2">Entonces:</p>
                  <div className="text-xs space-y-1 font-mono text-purple-800">
                    <p>R1 &lt; 0.0156 → Demanda = 0</p>
                    <p>0.0156 &lt; R1 &lt; 0.1094 → Demanda = 1</p>
                    <p>0.1094 &lt; R1 &lt; 0.3438 → Demanda = 2</p>
                    <p>0.3438 &lt; R1 &lt; 0.6563 → Demanda = 3</p>
                    <p>0.6563 &lt; R1 &lt; 0.8907 → Demanda = 4</p>
                    <p>0.8907 &lt; R1 &lt; 0.9845 → Demanda = 5</p>
                    <p>0.9845 &lt; R1 &lt; 1 → Demanda = 6</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-500">
                <p className="font-bold text-purple-900 text-sm">Paso 3: Calculamos el inventario inicial del día</p>
                <div className="text-xs text-slate-700 mt-2 space-y-2 font-mono">
                  <div className="ml-2">
                    <p className="font-semibold">Si (Día == 1)</p>
                    <div className="ml-4 space-y-1">
                      <p><span className="font-semibold underline">Inventario_inicial</span> = 30</p>
                      <p><span className="font-semibold underline">Día_Entrega</span> = 0</p>
                    </div>
                  </div>
                  
                  <div className="ml-2">
                    <p className="font-semibold">Sino</p>
                    <div className="ml-4 space-y-2">
                      <div>
                        <p className="font-semibold">Si (Día == <span className="underline">Día_entrega</span>)</p>
                        <div className="ml-4 space-y-1">
                          <p><span className="font-semibold underline">Inventario_inicial</span> = <span className="underline">Inventario_Final</span> + Pedido</p>
                          <p><span className="font-semibold underline">Día_entrega</span> = 0</p>
                        </div>
                      </div>
                      
                      <div className="ml-0">
                        <p className="font-semibold">Sino</p>
                        <div className="ml-4">
                          <p><span className="font-semibold underline">Inventario_inicial</span> = Inventario_Final</p>
                        </div>
                      </div>
                      
                      <p className="text-red-600 font-semibold ml-0">Finsi</p>
                    </div>
                  </div>
                  
                  <p className="text-red-600 font-semibold">Finsi</p>
                </div>
              </div>
              
              <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                <p className="font-bold text-green-900 text-sm">Paso 4: Calcular vendidos</p>
                <p className="text-xs text-slate-600 mt-1">Vendidos = Mínimo(Demanda, Inv_inicial)</p>
              </div>
              
              <div className="p-3 bg-red-50 rounded border-l-4 border-red-500">
                <p className="font-bold text-red-900 text-sm">Paso 5: Calcular faltantes</p>
                <p className="text-xs text-slate-600 mt-1">Faltante = Máximo(0, Demanda - Inv_inicial)</p>
              </div>
              
              <div className="p-3 bg-orange-50 rounded border-l-4 border-orange-500">
                <p className="font-bold text-orange-900 text-sm">Paso 6: Determinamos si podemos realizar un pedido:</p>
                <div className="text-xs text-slate-700 mt-2 space-y-2 font-mono">
                  <div className="ml-2">
                    <p className="font-semibold">Si (<span className="underline">Día_entrega</span> {'>'} Día)</p>
                    <div className="ml-4">
                      <p>Estado = "no puede pedir"</p>
                    </div>
                  </div>
                  
                  <div className="ml-2">
                    <p className="font-semibold">Sino</p>
                    <div className="ml-4">
                      <p>Estado = "Puede pedir"</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-orange-50 rounded border-l-4 border-orange-500">
                <p className="font-bold text-orange-900 text-sm">Paso 7: Calculamos el pedido:</p>
                <div className="text-xs text-slate-700 mt-2 space-y-2 font-mono">
                  <div className="ml-2">
                    <p className="font-semibold">Si (<span className="underline">Inventario_inicial</span> {'<'} 10 <span className="font-bold">and</span> Estado == "Puede pedir")</p>
                    <div className="ml-4">
                      <p>Pedido = 30 - <span className="underline">Inventario_inicial</span></p>
                    </div>
                  </div>
                  
                  <div className="ml-2">
                    <p className="font-semibold">Sino</p>
                    <div className="ml-4">
                      <p>Pedido = 0</p>
                    </div>
                  </div>
                  
                  <p className="text-red-600 font-semibold">Finsi</p>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                <p className="font-bold text-blue-900 text-sm">Paso 8: Generar R2 (si hay pedido)</p>
                <p className="text-xs text-slate-600 mt-1">R2 ← Math.random()</p>
              </div>
              
              <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                <p className="font-bold text-blue-900 text-sm">Paso 9: Calcular tiempo de entrega</p>
                <p className="text-xs text-slate-600 mt-1 mb-2">Si el pedido es mayor a 0 entonces calculamos el tiempo de entrega.</p>
                <p className="text-xs text-slate-600 mb-2">Para generar el tiempo de entrega debemos usar la fórmula de Poisson la cual es la siguiente:</p>
                <BlockMath math="Tiempo\_entrega \rightarrow Poisson(\lambda=3)" />
                <BlockMath math="P(X=k) = \frac{\lambda^k \times e^{-\lambda}}{k!}, \; k=0,1,2,..." />
                <p className="text-xs text-slate-600 mt-2">
                  λ = Tiempo promedio de entrega de un artículo = 3<br/>
                  k = Tiempo de entrega en días
                </p>
                <div className="mt-3 space-y-2 text-xs">
                  <p className="font-semibold text-blue-800">Ejemplos de cálculo:</p>
                  <div className="bg-white p-2 rounded">
                    <p className="font-semibold">Para K = 0:</p>
                    <BlockMath math="P(X=0) = \frac{3^0 \times e^{-3}}{0!} = 0.0498" />
                  </div>
                  <div className="bg-white p-2 rounded">
                    <p className="font-semibold">Para K = 1:</p>
                    <BlockMath math="P(X=1) = \frac{3^1 \times e^{-3}}{1!} = 0.1494" />
                  </div>
                  <div className="bg-white p-2 rounded">
                    <p className="font-semibold">Para K = 2:</p>
                    <BlockMath math="P(X=2) = \frac{3^2 \times e^{-3}}{2!} = 0.2240" />
                  </div>
                </div>
                <div className="mt-3 p-3 bg-blue-100 rounded">
                  <p className="font-semibold text-blue-900 text-xs mb-2">Entonces:</p>
                  <div className="text-xs space-y-1 font-mono text-blue-800">
                    <p>R2 &lt; 0.0498 → Tiempo_entrega = 0</p>
                    <p>0.0498 &lt; R2 &lt; 0.1992 → Tiempo_entrega = 1</p>
                    <p>0.1992 &lt; R2 &lt; 0.4232 → Tiempo_entrega = 2</p>
                    <p>0.4232 &lt; R2 &lt; 0.6472 → Tiempo_entrega = 3</p>
                    <p>0.6472 &lt; R2 &lt; 0.8152 → Tiempo_entrega = 4</p>
                    <p>0.8152 &lt; R2 &lt; 0.9160 → Tiempo_entrega = 5</p>
                    <p>0.9160 &lt; R2 &lt; 0.9664 → Tiempo_entrega = 6</p>
                    <p>0.9664 &lt; R2 &lt; 0.9880 → Tiempo_entrega = 7</p>
                    <p>0.9880 &lt; R2 &lt; 0.9961 → Tiempo_entrega = 8</p>
                    <p>0.9961 &lt; R2 &lt; 0.9988 → Tiempo_entrega = 9</p>
                    <p>0.9988 &lt; R2 &lt; 0.9996 → Tiempo_entrega = 10</p>
                    <p>0.9996 &lt; R2 &lt; 1 → Tiempo_entrega = 11</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-3">Si (Tiempo_entrega {'>'} 0):<br/>
                {'  '}Día_entrega = Día + Tiempo_entrega</p>
              </div>
              
              <div className="p-3 bg-slate-50 rounded border-l-4 border-slate-500">
                <p className="font-bold text-slate-900 text-sm">Paso 10: Calcular inventario final</p>
                <p className="text-xs text-slate-600 mt-1">Inv_final = Inv_inicial - Vendidos</p>
              </div>
              
              <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-500">
                <p className="font-bold text-yellow-900 text-sm">Paso 11: Calcular costos</p>
                <p className="text-xs text-slate-600 mt-1">
                  C_inventario = Inv_final<br/>
                  C_faltante = Faltante × 10<br/>
                  C_orden = Pedido {'>'} 0 ? 50 : 0<br/>
                  C_total = C_inventario + C_faltante + C_orden
                </p>
              </div>
              
              <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                <p className="font-bold text-green-900 text-sm">Paso 12: Repetir los pasos anteriores igual a la cantidad de dias que queramos simular</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border-2 border-orange-200">
            <p className="font-bold text-orange-900 mb-2">Resultado Final:</p>
            <p className="text-sm text-slate-700">La política más económica es aquella con el menor costo total después de simular n días.</p>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={simular}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <RefreshCcw size={20} />
            Simular {diasSimular} días
          </button>
        </div>

        {resumen && (
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl shadow-lg border-2 border-purple-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Comparación de Políticas</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-slate-600">Costo Total Política 1</p>
                <p className="text-2xl font-bold text-blue-600">${Math.round(resumen.costoTotal1).toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">Ordenar cada 8 días</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-slate-600">Costo Total Política 2</p>
                <p className="text-2xl font-bold text-purple-600">${Math.round(resumen.costoTotal2).toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">Ordenar cuando inv ≤ 10</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-slate-600">Política Más Económica</p>
                <p className="text-2xl font-bold text-green-600">{resumen.mejorPolitica}</p>
                <p className="text-xs text-slate-500 mt-1">Ahorro: ${Math.round(resumen.diferencia).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {simulacion1.length > 0 && (
          <>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
                <span className="font-bold text-blue-700 text-sm uppercase tracking-wider">
                  Política 1: Ordenar cada 8 días
                </span>
              </div>
              
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-600 border-b sticky top-0">
                    <tr>
                      <th className="px-2 py-2 font-medium">Día</th>
                      <th className="px-2 py-2 font-medium">R₁</th>
                      <th className="px-2 py-2 font-medium">Demanda</th>
                      <th className="px-2 py-2 font-medium">Inv. Ini</th>
                      <th className="px-2 py-2 font-medium">Vendidos</th>
                      <th className="px-2 py-2 font-medium">Faltante</th>
                      <th className="px-2 py-2 font-medium">Pedido</th>
                      <th className="px-2 py-2 font-medium">R₂</th>
                      <th className="px-2 py-2 font-medium">T. Entrega</th>
                      <th className="px-2 py-2 font-medium">Inv. Final</th>
                      <th className="px-2 py-2 font-medium">C. Inv</th>
                      <th className="px-2 py-2 font-medium">C. Falt</th>
                      <th className="px-2 py-2 font-medium">C. Orden</th>
                      <th className="px-2 py-2 font-medium">C. Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {simulacion1.map((row) => (
                      <tr key={row.dia} className="hover:bg-slate-50">
                        <td className="px-2 py-2 font-mono">{row.dia}</td>
                        <td className="px-2 py-2 font-mono text-blue-600">{row.R1}</td>
                        <td className="px-2 py-2 font-mono">{row.demanda}</td>
                        <td className="px-2 py-2 font-mono">{row.inventarioInicial}</td>
                        <td className="px-2 py-2 font-mono text-green-600">{row.vendidos}</td>
                        <td className="px-2 py-2 font-mono text-red-600">{row.faltante}</td>
                        <td className="px-2 py-2 font-mono text-orange-600">{row.pedido}</td>
                        <td className="px-2 py-2 font-mono text-blue-600">{row.R2}</td>
                        <td className="px-2 py-2 font-mono">{row.tiempoEntrega}</td>
                        <td className="px-2 py-2 font-mono font-bold">{row.inventarioFinal}</td>
                        <td className="px-2 py-2 font-mono">{row.costoInventario}</td>
                        <td className="px-2 py-2 font-mono">{row.costoFaltante}</td>
                        <td className="px-2 py-2 font-mono">{row.costoOrden}</td>
                        <td className="px-2 py-2 font-mono font-bold text-purple-700">{row.costoTotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-purple-50 px-4 py-3 border-b border-purple-200">
                <span className="font-bold text-purple-700 text-sm uppercase tracking-wider">
                  Política 2: Ordenar cuando inventario ≤ 10
                </span>
              </div>
              
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-600 border-b sticky top-0">
                    <tr>
                      <th className="px-2 py-2 font-medium">Día</th>
                      <th className="px-2 py-2 font-medium">R₁</th>
                      <th className="px-2 py-2 font-medium">Demanda</th>
                      <th className="px-2 py-2 font-medium">Inv. Ini</th>
                      <th className="px-2 py-2 font-medium">Vendidos</th>
                      <th className="px-2 py-2 font-medium">Faltante</th>
                      <th className="px-2 py-2 font-medium">Estado</th>
                      <th className="px-2 py-2 font-medium">Pedido</th>
                      <th className="px-2 py-2 font-medium">R₂</th>
                      <th className="px-2 py-2 font-medium">T. Entrega</th>
                      <th className="px-2 py-2 font-medium">Inv. Final</th>
                      <th className="px-2 py-2 font-medium">C. Inv</th>
                      <th className="px-2 py-2 font-medium">C. Falt</th>
                      <th className="px-2 py-2 font-medium">C. Orden</th>
                      <th className="px-2 py-2 font-medium">C. Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {simulacion2.map((row) => (
                      <tr key={row.dia} className="hover:bg-slate-50">
                        <td className="px-2 py-2 font-mono">{row.dia}</td>
                        <td className="px-2 py-2 font-mono text-blue-600">{row.R1}</td>
                        <td className="px-2 py-2 font-mono">{row.demanda}</td>
                        <td className="px-2 py-2 font-mono">{row.inventarioInicial}</td>
                        <td className="px-2 py-2 font-mono text-green-600">{row.vendidos}</td>
                        <td className="px-2 py-2 font-mono text-red-600">{row.faltante}</td>
                        <td className="px-2 py-2 text-xs">{row.puedePedir}</td>
                        <td className="px-2 py-2 font-mono text-orange-600">{row.pedido}</td>
                        <td className="px-2 py-2 font-mono text-blue-600">{row.R2}</td>
                        <td className="px-2 py-2 font-mono">{row.tiempoEntrega}</td>
                        <td className="px-2 py-2 font-mono font-bold">{row.inventarioFinal}</td>
                        <td className="px-2 py-2 font-mono">{row.costoInventario}</td>
                        <td className="px-2 py-2 font-mono">{row.costoFaltante}</td>
                        <td className="px-2 py-2 font-mono">{row.costoOrden}</td>
                        <td className="px-2 py-2 font-mono font-bold text-purple-700">{row.costoTotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
