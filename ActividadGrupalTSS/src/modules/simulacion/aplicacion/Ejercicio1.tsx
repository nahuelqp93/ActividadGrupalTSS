import { useState } from 'react';
import Enunciado from '../utils/Enunciado';
import FormulasPoisson from '../utils/FormulasPoisson';
import FormulasExponencial from '../utils/FormulasExponencial';
import FormulasUniforme from '../utils/FormulasUniforme';
import TablaIteraciones from '../utils/TablaIteraciones';

const SEMILLA_LCG = 1234;

interface IteracionCola {
  i: number;
  r1_llegada: number;
  tiempoEntreLlegadas: number;
  tiempoLlegada: number;
  r2_servicio1: number;
  tiempoServicio1: number;
  inicioServicio1: number;
  finServicio1: number;
  tiempoEspera1: number;
  r3_servicio2: number;
  tiempoServicio2: number;
  inicioServicio2: number;
  finServicio2: number;
  tiempoEspera2: number;
  tiempoTotalSistema: number;
}

export default function SimulacionColas() {
  const [numClientes, setNumClientes] = useState(20);
  const [lambdaLlegadas, setLambdaLlegadas] = useState(20);
  const [mediaServicio1, setMediaServicio1] = useState(2);
  const [limInfServicio2, setLimInfServicio2] = useState(1);
  const [limSupServicio2, setLimSupServicio2] = useState(2);


  const [iteraciones, setIteraciones] = useState<IteracionCola[]>([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  const lambdaPorMinuto = lambdaLlegadas / 60;

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

  const simular = () => {
    const rng = createLCG(SEMILLA_LCG);
    const resultados: IteracionCola[] = [];

    let llegadaAnterior = 0;
    let fin1Anterior = 0;
    let fin2Anterior = 0;

    for (let i = 1; i <= numClientes; i++) {
      const r1 = rng();
      const tiempoEntreLlegadas = -Math.log(r1) / lambdaPorMinuto;
      const tiempoLlegada = llegadaAnterior + tiempoEntreLlegadas;

      const r2 = rng();
      const tiempoServicio1 = -mediaServicio1 * Math.log(r2);
      const inicioServicio1 = Math.max(tiempoLlegada, fin1Anterior);
      const finServicio1 = inicioServicio1 + tiempoServicio1;
      const tiempoEspera1 = inicioServicio1 - tiempoLlegada;

      const r3 = rng();
      const tiempoServicio2 =
        limInfServicio2 + (limSupServicio2 - limInfServicio2) * r3;
      const inicioServicio2 = Math.max(finServicio1, fin2Anterior);
      const finServicio2 = inicioServicio2 + tiempoServicio2;
      const tiempoEspera2 = inicioServicio2 - finServicio1;

      resultados.push({
        i,
        r1_llegada: r1,
        tiempoEntreLlegadas,
        tiempoLlegada,
        r2_servicio1: r2,
        tiempoServicio1,
        inicioServicio1,
        finServicio1,
        tiempoEspera1,
        r3_servicio2: r3,
        tiempoServicio2,
        inicioServicio2,
        finServicio2,
        tiempoEspera2,
        tiempoTotalSistema: finServicio2 - tiempoLlegada,
      });

      llegadaAnterior = tiempoLlegada;
      fin1Anterior = finServicio1;
      fin2Anterior = finServicio2;
    }

    setIteraciones(resultados);
    setMostrarResultados(true);
  };

  const tiempoPromedio =
    iteraciones.reduce((s, i) => s + i.tiempoTotalSistema, 0) /
    (iteraciones.length || 1);

  const maxEspera1 = Math.max(...iteraciones.map(i => i.tiempoEspera1), 0);
  const maxEspera2 = Math.max(...iteraciones.map(i => i.tiempoEspera2), 0);

  return (
    <div className="min-h-screen bg-white p-6 text-black">
      <div className="max-w-7xl mx-auto space-y-6">
        <Enunciado
          titulo="Sistema de colas en serie"
          descripcion="Se tiene un sistema de colas formado por dos estaciones en serie. Los clientes atendidos en la primera estación pasan en seguida a formar cola en la segunda. En la primera estación de servicio, la razón de llegadas sigue una distribución Poisson con media de 20 clientes por hora, y el tiempo de servicio sigue una distribución exponencial con media de 2 minutos por persona. En la segunda estación, el tiempo de servicio está uniformemente distribuido entre 1 y 2 minutos. Para esta información, ¿Cuál es el tiempo promedio en 
el sistema?, ¿Cuál de las dos colas que se forman es mayor?"
          preguntas={[
            'Tiempo promedio en el sistema',
            'Cola con mayor tiempo de espera',
          ]}
          datos={[
            { label: 'Llegadas (λ) Poisson', valor: `${lambdaLlegadas} clientes/hora` },
            { label: 'Servicio estación 1 Exponencial', valor: `${mediaServicio1} minutos` },
            {
              label: 'Servicio estación 2 Uniforme continua',
              valor: `[${limInfServicio2}, ${limSupServicio2}] minutos`,
            },
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormulasPoisson lambda={lambdaLlegadas} />
          <FormulasExponencial media={mediaServicio1} />
          <FormulasUniforme a={limInfServicio2} b={limSupServicio2} />
        </div>

        <div className="border p-4 space-y-4">
          <h3 className="font-semibold text-lg">Parámetros de simulación</h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <label>
              Clientes
              <input type="number" value={numClientes} onChange={e => setNumClientes(+e.target.value)} className="border p-1 w-full" />
            </label>

            <label>
              λ llegadas (hora)
              <input type="number" value={lambdaLlegadas} onChange={e => setLambdaLlegadas(+e.target.value)} className="border p-1 w-full" />
            </label>

            <label>
              Media servicio 1
              <input type="number" value={mediaServicio1} onChange={e => setMediaServicio1(+e.target.value)} className="border p-1 w-full" />
            </label>

            <label>
              Límite inferior serv. 2
              <input type="number" value={limInfServicio2} onChange={e => setLimInfServicio2(+e.target.value)} className="border p-1 w-full" />
            </label>

            <label>
              Límite superior serv. 2
              <input type="number" value={limSupServicio2} onChange={e => setLimSupServicio2(+e.target.value)} className="border p-1 w-full" />
            </label>

            
          </div>

          <button
  onClick={simular}
  className="rounded-md bg-slate-700 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-slate-800 active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 shadow-sm"
>
  Ejecutar simulación
</button>
        </div>

        {mostrarResultados && (
          <>
            <TablaIteraciones iteraciones={iteraciones} />
            <div className="border p-4 text-sm space-y-2">
              <p>
                Tiempo promedio en el sistema:{' '}
                <strong>{tiempoPromedio.toFixed(2)}</strong>
              </p>
              <p>
                Cola con mayor espera:{' '}
                <strong>{maxEspera1 > maxEspera2 ? 'Estación 1' : 'Estación 2'}</strong>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
