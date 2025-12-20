import { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import Enunciado from '../utils/Enunciado';
import FormulasPoisson from '../utils/FormulasPoisson';
import FormulasUniforme from '../utils/FormulasUniforme';
import TablaEstacionamiento from '../utils/TablaEstacionamiento.tsx';

interface IteracionEstacionamiento {
  i: number;
  r1_llegada: number;
  tiempoEntreLlegadas: number;
  tiempoLlegada: number;
  lugaresOcupados: number;
  puedeEntrar: boolean;
  lugarAsignado: number | null;
  r2_servicio: number | null;
  tiempoPermanencia: number | null;
  tiempoSalida: number | null;
}

export default function Ejercicio7Estacionamiento() {
  const [numClientes, setNumClientes] = useState('100');
  const [lambdaLlegadas, setLambdaLlegadas] = useState('10'); // clientes por hora
  const [limInfPermanencia, setLimInfPermanencia] = useState('10'); // minutos
  const [limSupPermanencia, setLimSupPermanencia] = useState('30'); // minutos
  const [iteraciones, setIteraciones] = useState<IteracionEstacionamiento[]>([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  // Parámetros del problema
  const capacidadEstacionamiento = 6;

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
    const n = parseInt(numClientes) || 100;
    const lambda = parseFloat(lambdaLlegadas) || 10;
    const lambdaPorMinuto = lambda / 60;
    const limInf = parseFloat(limInfPermanencia) || 10;
    const limSup = parseFloat(limSupPermanencia) || 30;

    const rng = createLCG(1234);
    const resultados: IteracionEstacionamiento[] = [];

    // Estado de los lugares: array con tiempo de salida de cada auto
    // Si el tiempo de salida es 0, el lugar está disponible
    const tiempoSalidaLugares = Array(capacidadEstacionamiento).fill(0);
    let tiempoLlegadaAnterior = 0;

    for (let i = 1; i <= n; i++) {
      // Generar tiempo entre llegadas (Poisson -> Exponencial)
      const r1 = rng();
      const tiempoEntreLlegadas = -Math.log(r1) / lambdaPorMinuto;
      const tiempoLlegada = tiempoLlegadaAnterior + tiempoEntreLlegadas;

      // Actualizar estado de los lugares: liberar lugares cuyo tiempo de salida ya pasó
      for (let j = 0; j < capacidadEstacionamiento; j++) {
        if (tiempoSalidaLugares[j] > 0 && tiempoSalidaLugares[j] <= tiempoLlegada) {
          tiempoSalidaLugares[j] = 0; // Liberar el lugar
        }
      }

      // Contar lugares ocupados
      const lugaresOcupados = tiempoSalidaLugares.filter(t => t > 0).length;

      // Verificar si puede entrar
      const puedeEntrar = lugaresOcupados < capacidadEstacionamiento;

      let lugarAsignado = null;
      let r2_servicio = null;
      let tiempoPermanencia = null;
      let tiempoSalida = null;

      if (puedeEntrar) {
        // Encontrar primer lugar disponible
        const lugarIdx = tiempoSalidaLugares.findIndex(t => t === 0);
        lugarAsignado = lugarIdx + 1; // Lugares numerados desde 1

        // Generar tiempo de permanencia (Uniforme)
        r2_servicio = rng();
        tiempoPermanencia = limInf + (limSup - limInf) * r2_servicio;
        tiempoSalida = tiempoLlegada + tiempoPermanencia;

        // Ocupar el lugar
        tiempoSalidaLugares[lugarIdx] = tiempoSalida;
      }

      resultados.push({
        i,
        r1_llegada: r1,
        tiempoEntreLlegadas,
        tiempoLlegada,
        lugaresOcupados,
        puedeEntrar,
        lugarAsignado,
        r2_servicio,
        tiempoPermanencia,
        tiempoSalida
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
    setNumClientes('100');
    setLambdaLlegadas('10');
    setLimInfPermanencia('10');
    setLimSupPermanencia('30');
  };

  // Calcular respuestas
  const clientesAtendidos = iteraciones.filter(it => it.puedeEntrar).length;
  const clientesPerdidos = iteraciones.filter(it => !it.puedeEntrar).length;
  
  const porcentajePerdidos = iteraciones.length > 0 
    ? (clientesPerdidos / iteraciones.length) * 100 
    : 0;

  const probabilidadLugar = iteraciones.length > 0
    ? (clientesAtendidos / iteraciones.length) * 100
    : 0;

  let sumaEspaciosDisponibles = 0;
  iteraciones.forEach(it => {
    sumaEspaciosDisponibles += (capacidadEstacionamiento - it.lugaresOcupados);
  });
  const espaciosDisponiblesPromedio = iteraciones.length > 0
    ? sumaEspaciosDisponibles / iteraciones.length
    : 0;
  const porcentajeEspaciosDisponibles = (espaciosDisponiblesPromedio / capacidadEstacionamiento) * 100;

  const lambda = parseFloat(lambdaLlegadas) || 10;
  const limInf = parseFloat(limInfPermanencia) || 10;
  const limSup = parseFloat(limSupPermanencia) || 30;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Enunciado */}
        <Enunciado
          titulo="Ejercicio 7: Sistema de Estacionamiento con Capacidad Limitada"
          descripcion="Una tienda pequeña tiene un lote de estacionamiento con 6 lugares disponibles. Los clientes llegan en forma aleatoria de acuerdo a un proceso Poisson a una razón media de 10 clientes por hora, y se van inmediatamente si no existen lugares disponibles en el estacionamiento. El tiempo que un auto permanece en el estacionamiento sigue una distribución uniforme entre 10 y 30 minutos."
          preguntas={[
            '¿Qué porcentaje de los clientes es perdido por no tener más lugares disponibles?',
            '¿Cuál es la probabilidad de encontrar un lugar disponible en el estacionamiento?',
            '¿Cuál es el porcentaje promedio de espacios disponibles?'
          ]}
          datos={[
            { label: 'Capacidad del estacionamiento', valor: '6 lugares' },
            { label: 'Llegadas (Poisson)', valor: '10 clientes/hora' },
            { label: 'Tiempo de permanencia (Uniforme)', valor: 'Entre 10 y 30 minutos' },
            { label: 'Política', valor: 'Cliente se va si no hay espacio' }
          ]}
        />

        {/* Diagrama del sistema */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Diagrama del Sistema</h3>
          <div className="space-y-4">
            {/* Flujo */}
            <div className="flex items-center justify-center gap-6 p-6 bg-blue-50 rounded-lg">
              <div className="text-center">
                <div className="bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl mb-2">
                  λ
                </div>
                <p className="text-sm text-gray-700 font-semibold">Llegadas<br/>(Poisson)</p>
              </div>

              <div className="flex-1 border-t-4 border-dashed border-blue-400"></div>

              <div className="text-center">
                <div className="bg-yellow-500 text-white rounded-lg p-4 font-bold text-lg">
                  ¿Hay lugar?
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="border-t-4 border-green-500 w-16"></div>
                  <span className="text-green-700 font-semibold text-sm">SÍ</span>
                  <div className="border-t-4 border-green-500 w-16"></div>
                  <div className="bg-green-500 text-white rounded-lg px-4 py-2">
                    Entra
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="border-t-4 border-red-500 w-16"></div>
                  <span className="text-red-700 font-semibold text-sm">NO</span>
                  <div className="border-t-4 border-red-500 w-16"></div>
                  <div className="bg-red-500 text-white rounded-lg px-4 py-2">
                    Se va
                  </div>
                </div>
              </div>
            </div>

            {/* Estacionamiento visual */}
            <div className="bg-gray-100 rounded-lg p-6">
              <p className="text-center font-bold text-gray-700 mb-4">Estacionamiento (6 lugares)</p>
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <div key={num} className="bg-white border-2 border-gray-400 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-gray-600">{num}</p>
                  </div>
                ))}
              </div>
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
                  Tiempo Mínimo Permanencia (min)
                </label>
                <input
                  type="number"
                  value={limInfPermanencia}
                  onChange={(e) => setLimInfPermanencia(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  min="0"
                  step="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Tiempo Máximo Permanencia (min)
                </label>
                <input
                  type="number"
                  value={limSupPermanencia}
                  onChange={(e) => setLimSupPermanencia(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  min="0"
                  step="1"
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
            <TablaEstacionamiento 
              iteraciones={iteraciones} 
              capacidad={capacidadEstacionamiento}
              mostrarTotales={true} 
            />

            {/* Respuestas */}
            <div className="bg-green-50 rounded-lg shadow-lg p-6 border-2 border-black">
              <h3 className="text-2xl font-bold text-black mb-4">Respuestas al Problema</h3>
              
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border-l-4 border-black">
                  <p className="font-semibold text-gray-700 mb-2">
                    a) ¿Qué porcentaje de los clientes es perdido por no tener más lugares disponibles?
                  </p>
                  <p className="text-3xl font-bold text-black">
                    {porcentajePerdidos.toFixed(2)}%
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    De {iteraciones.length} clientes que llegaron, {clientesPerdidos} no pudieron entrar por falta de espacio.
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border-l-4 border-black">
                  <p className="font-semibold text-gray-700 mb-2">
                    b) ¿Cuál es la probabilidad de encontrar un lugar disponible en el estacionamiento?
                  </p>
                  <p className="text-3xl font-bold text-black">
                    {probabilidadLugar.toFixed(2)}%
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    {clientesAtendidos} clientes de {iteraciones.length} encontraron lugar disponible.
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border-l-4 border-black">
                  <p className="font-semibold text-gray-700 mb-2">
                    c) ¿Cuál es el porcentaje promedio de espacios disponibles?
                  </p>
                  <p className="text-3xl font-bold text-black">
                    {porcentajeEspaciosDisponibles.toFixed(2)}%
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    En promedio hay {espaciosDisponiblesPromedio.toFixed(2)} lugares disponibles de {capacidadEstacionamiento} totales.
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