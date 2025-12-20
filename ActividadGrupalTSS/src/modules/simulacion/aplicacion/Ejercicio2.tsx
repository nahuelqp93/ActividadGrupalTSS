import { useState } from 'react';
import {  Play, RotateCcw } from 'lucide-react';
import Enunciado from '../utils/Enunciado';
import FormulasPoisson from '../utils/FormulasPoisson';
import FormulasUniforme from '../utils/FormulasUniforme';
import TablaMultiServidor from '../utils/TablaMultiservidor';

interface IteracionMultiServidor {
  i: number;
  r1_llegada: number;
  tiempoEntreLlegadas: number;
  tiempoLlegada: number;
  cajeroAsignado: number;
  r2_servicio: number;
  tiempoServicio: number;
  inicioServicio: number;
  finServicio: number;
  tiempoEspera: number;
  tiempoTotalSistema: number;
  clientesEnSistema: number;
}

export default function Ejercicio2Banco() {
  const [numClientes, setNumClientes] = useState('50');
  const [lambdaLlegadas, setLambdaLlegadas] = useState('40'); // clientes por hora
  const [limInfServicio, setLimInfServicio] = useState('0'); // minutos
  const [limSupServicio, setLimSupServicio] = useState('1'); // minutos
  const [iteraciones, setIteraciones] = useState<IteracionMultiServidor[]>([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  // Parámetros del problema
  const numCajeros = 3;

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

  const simular = () => {
    const n = parseInt(numClientes) || 50;
    const lambda = parseFloat(lambdaLlegadas) || 40;
    const lambdaPorMinuto = lambda / 60; // convertir a por minuto
    const limInf = parseFloat(limInfServicio) || 0;
    const limSup = parseFloat(limSupServicio) || 1;

    const rng = createLCG(1234);
    const resultados: IteracionMultiServidor[] = [];

    // Estado de los cajeros: array con tiempo de fin de servicio de cada cajero
    const finServicioCajeros = Array(numCajeros).fill(0);
    let tiempoLlegadaAnterior = 0;

    for (let i = 1; i <= n; i++) {
      // Generar tiempo entre llegadas (Poisson -> Exponencial)
      const r1 = rng();
      const tiempoEntreLlegadas = -Math.log(r1) / lambdaPorMinuto;
      const tiempoLlegada = tiempoLlegadaAnterior + tiempoEntreLlegadas;

      // Encontrar el cajero que se libera primero
      const cajeroDisponible = finServicioCajeros.indexOf(Math.min(...finServicioCajeros));
      const cajeroAsignado = cajeroDisponible + 1; // Cajeros numerados desde 1

      // Servicio Uniforme
      const r2 = rng();
      const tiempoServicio = limInf + (limSup - limInf) * r2;
      
      // El cliente empieza a ser atendido cuando:
      // 1) Llega (tiempoLlegada)
      // 2) El cajero está libre (finServicioCajeros[cajeroDisponible])
      const inicioServicio = Math.max(tiempoLlegada, finServicioCajeros[cajeroDisponible]);
      const finServicio = inicioServicio + tiempoServicio;
      const tiempoEspera = inicioServicio - tiempoLlegada;

      // Actualizar el tiempo de fin de servicio del cajero
      finServicioCajeros[cajeroDisponible] = finServicio;

      // Tiempo total en el sistema
      const tiempoTotalSistema = finServicio - tiempoLlegada;

      // Calcular cuántos clientes hay en el sistema en este momento
      // (clientes que llegaron antes y aún no han terminado)
      let clientesEnSistema = 0;
      for (let j = 0; j < resultados.length; j++) {
        const prevCliente = resultados[j];
        // Si el cliente anterior salió después de que este llegó, está en el sistema
        if (prevCliente.finServicio > tiempoLlegada) {
          clientesEnSistema++;
        }
      }
      clientesEnSistema++; // Contar el cliente actual

      resultados.push({
        i,
        r1_llegada: r1,
        tiempoEntreLlegadas,
        tiempoLlegada,
        cajeroAsignado,
        r2_servicio: r2,
        tiempoServicio,
        inicioServicio,
        finServicio,
        tiempoEspera,
        tiempoTotalSistema,
        clientesEnSistema
      });

      // Actualizar para siguiente iteración
      tiempoLlegadaAnterior = tiempoLlegada;
    }

    setIteraciones(resultados);
    setMostrarResultados(true);
  };

  const reiniciar = () => {
    setIteraciones([]);
    setMostrarResultados(false);
    setNumClientes('50');
    setLambdaLlegadas('40');
    setLimInfServicio('0');
    setLimSupServicio('1');
  };

  // Calcular respuestas
  const tiempoPromedio = iteraciones.length > 0
    ? iteraciones.reduce((sum, it) => sum + it.tiempoTotalSistema, 0) / iteraciones.length
    : 0;

  const clientesPromedioEnSistema = iteraciones.length > 0
    ? iteraciones.reduce((sum, it) => sum + it.clientesEnSistema, 0) / iteraciones.length
    : 0;

  const lambda = parseFloat(lambdaLlegadas) || 40;
  const limInf = parseFloat(limInfServicio) || 0;
  const limSup = parseFloat(limSupServicio) || 1;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Enunciado */}
        <Enunciado
          titulo="Ejercicio 2: Sistema Bancario con Múltiples Cajeros"
          descripcion="Un banco emplea 3 cajeros para servir a sus clientes. Los clientes arriban de acuerdo a un proceso Poisson a una razón media de 40 por hora. Si un cliente encuentra todos los cajeros ocupados, entonces se incorpora a la cola que alimenta a todos los cajeros. El tiempo que dura la transacción entre un cajero y un cliente sigue una distribución uniforme entre 0 y 1 minuto."
          preguntas={[
            '¿Cuál es el tiempo promedio en el sistema?',
            '¿Cuál es la cantidad promedio de clientes en el sistema?'
          ]}
          datos={[
            { label: 'Número de cajeros', valor: '3 servidores en paralelo' },
            { label: 'Llegadas (Poisson)', valor: '40 clientes/hora' },
            { label: 'Servicio (Uniforme)', valor: 'Entre 0 y 1 minuto' },
            { label: 'Tipo de cola', valor: 'Una sola cola para todos los cajeros' }
          ]}
        />

        {/* Diagrama del sistema */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Diagrama del Sistema</h3>
          <div className="flex items-center justify-center gap-8 p-6 bg-blue-50 rounded-lg">
            <div className="text-center">
              <div className="bg-white text-black rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl mb-2">
                λ
              </div>
              <p className="text-sm text-gray-700 font-semibold">Llegadas<br/>(Poisson)</p>
            </div>

            <div className="flex-1 border-t-4 border-dashed border-blue-400"></div>

            <div className="bg-yellow-100 rounded-lg p-4 border-2 border-yellow-400">
              <p className="text-center font-bold text-gray-800 mb-2">COLA ÚNICA</p>
              <p className="text-xs text-gray-600 text-center">Los clientes esperan aquí</p>
            </div>

            <div className="flex-1 border-t-4 border-dashed border-green-400"></div>

            <div className="flex flex-col gap-3">
              {[1, 2, 3].map(num => (
                <div key={num} className="flex items-center gap-2">
                  <div className="bg-green-500 text-white rounded-lg w-12 h-12 flex items-center justify-center font-bold">
                    {num}
                  </div>
                  <p className="text-xs text-gray-700">Cajero {num}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fórmulas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormulasPoisson lambda={lambda} />
          <FormulasUniforme a={limInf} b={limSup} />
        </div>

        {/* Controles de Simulación */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Controles de Simulación</h3>
          
          <div className="space-y-4">
            {/* Parámetros del sistema */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Media de Llegadas (clientes/hora)
                </label>
                <input
                  type="number"
                  value={lambdaLlegadas}
                  onChange={(e) => setLambdaLlegadas(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  min="1"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Límite Inferior Servicio (min)
                </label>
                <input
                  type="number"
                  value={limInfServicio}
                  onChange={(e) => setLimInfServicio(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Límite Superior Servicio (min)
                </label>
                <input
                  type="number"
                  value={limSupServicio}
                  onChange={(e) => setLimSupServicio(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            {/* Control de simulación */}
            <div className="flex items-end gap-4 flex-wrap">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Número de Clientes a Simular
                </label>
                <input
                  type="number"
                  value={numClientes}
                  onChange={(e) => setNumClientes(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md w-40"
                  min="1"
                  max="1000"
                />
              </div>

              <button
                onClick={simular}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                <Play size={20} />
                Iniciar Simulación
              </button>

              {iteraciones.length > 0 && (
                <button
                  onClick={reiniciar}
                  className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  <RotateCcw size={20} />
                  Reiniciar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Resultados */}
        {mostrarResultados && iteraciones.length > 0 && (
          <>
            <TablaMultiServidor 
              iteraciones={iteraciones} 
              numServidores={numCajeros}
              mostrarTotales={true} 
            />

            {/* Respuestas */}
            <div className="bg-green-50 rounded-lg shadow-lg p-6 border-2">
              <h3 className="text-2xl font-bold text-black mb-4">Respuestas al Problema</h3>
              
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border-l-4 border-black">
                  <p className="font-semibold text-gray-700 mb-2">1. ¿Cuál es el tiempo promedio en el sistema?</p>
                  <p className="text-3xl font-bold text-black">
                    {tiempoPromedio.toFixed(2)} minutos
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border-l-4 border-black">
                  <p className="font-semibold text-gray-700 mb-2">2. ¿Cuál es la cantidad promedio de clientes en el sistema?</p>
                  <p className="text-3xl font-bold text-black">
                    {clientesPromedioEnSistema.toFixed(2)} clientes
                  </p>
                </div>

              
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}