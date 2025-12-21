import { useState } from 'react';
import {  BookOpen, Calculator, Users, Play } from 'lucide-react';
import { BlockMath} from 'react-katex';
import 'katex/dist/katex.min.css';

interface IteracionCola {
  i: number;
  R1: string;
  tiempoEntreLlegadas: number;
  tiempoLlegada: number;
  R2: string;
  tiempoServicio1: number;
  inicioServicio1: number;
  finServicio1: number;
  tiempoEspera1: number;
  R3: string;
  tiempoServicio2: number;
  inicioServicio2: number;
  finServicio2: number;
  tiempoEspera2: number;
  tiempoTotalSistema: number;
}

export default function EjercicioColasSerie() {
  const [simulacion, setSimulacion] = useState<IteracionCola[]>([]);
  const [mostrarSimulacion, setMostrarSimulacion] = useState(false);
  const [numClientes] = useState(20);

  // Parámetros del problema
  const lambdaLlegadas = 20; // clientes por hora
  const lambdaPorMinuto = lambdaLlegadas / 60; // convertir a por minuto
  const mediaServicio1 = 2; // minutos
  const limInfServicio2 = 1; // minutos
  const limSupServicio2 = 2; // minutos

  // Generador LCG
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

  // Simulación
  const simularColas = () => {
    const rng = createLCG(1234);
    const resultados: IteracionCola[] = [];
    
    let tiempoLlegadaAnterior = 0;
    let finServicio1Anterior = 0;
    let finServicio2Anterior = 0;

    for (let i = 1; i <= numClientes; i++) {
      // PASO 1-3: Generar tiempo entre llegadas (Poisson -> Exponencial)
      const R1 = rng();
      const tiempoEntreLlegadas = -Math.log(R1) / lambdaPorMinuto;
      const tiempoLlegada = tiempoLlegadaAnterior + tiempoEntreLlegadas;

      // PASO 4-6: Servicio en Estación 1 (Exponencial)
      const R2 = rng();
      const tiempoServicio1 = -mediaServicio1 * Math.log(R2);
      const inicioServicio1 = Math.max(tiempoLlegada, finServicio1Anterior);
      const finServicio1 = inicioServicio1 + tiempoServicio1;
      const tiempoEspera1 = inicioServicio1 - tiempoLlegada;

      // PASO 7-9: Servicio en Estación 2 (Uniforme)
      const R3 = rng();
      const tiempoServicio2 = limInfServicio2 + (limSupServicio2 - limInfServicio2) * R3;
      const inicioServicio2 = Math.max(finServicio1, finServicio2Anterior);
      const finServicio2 = inicioServicio2 + tiempoServicio2;
      const tiempoEspera2 = inicioServicio2 - finServicio1;

      // PASO 10: Tiempo total en el sistema
      const tiempoTotalSistema = finServicio2 - tiempoLlegada;

      resultados.push({
        i,
        R1: R1.toFixed(4),
        tiempoEntreLlegadas,
        tiempoLlegada,
        R2: R2.toFixed(4),
        tiempoServicio1,
        inicioServicio1,
        finServicio1,
        tiempoEspera1,
        R3: R3.toFixed(4),
        tiempoServicio2,
        inicioServicio2,
        finServicio2,
        tiempoEspera2,
        tiempoTotalSistema
      });

      // Actualizar para siguiente iteración
      tiempoLlegadaAnterior = tiempoLlegada;
      finServicio1Anterior = finServicio1;
      finServicio2Anterior = finServicio2;
    }

    setSimulacion(resultados);
    setMostrarSimulacion(true);
  };

  // Cálculos de resultados
  const tiempoPromedioSistema = simulacion.length > 0
    ? simulacion.reduce((sum, it) => sum + it.tiempoTotalSistema, 0) / simulacion.length
    : 0;

  const tiempoPromedioEspera1 = simulacion.length > 0
    ? simulacion.reduce((sum, it) => sum + it.tiempoEspera1, 0) / simulacion.length
    : 0;

  const tiempoPromedioEspera2 = simulacion.length > 0
    ? simulacion.reduce((sum, it) => sum + it.tiempoEspera2, 0) / simulacion.length
    : 0;

  const colaMaxima1 = simulacion.length > 0
    ? Math.max(...simulacion.map(it => it.tiempoEspera1))
    : 0;

  const colaMaxima2 = simulacion.length > 0
    ? Math.max(...simulacion.map(it => it.tiempoEspera2))
    : 0;

  const colaMayor = tiempoPromedioEspera1 > tiempoPromedioEspera2 ? 'Estación 1' : 'Estación 2';

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

       

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Ejercicio 1: Sistema de Colas en Serie
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Simulación de dos estaciones secuenciales con llegadas Poisson
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <Users size={32} className="text-blue-600" />
          </div>
        </div>

        {/* Enunciado */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-blue-600"/>
            Enunciado del Problema
          </h2>
          <p className="text-slate-700 leading-relaxed">
            Se tiene un sistema de colas formado por <strong>dos estaciones en serie</strong>. 
            Los clientes atendidos en la primera estación pasan en seguida a formar cola en la segunda.
          </p>
          <ul className="mt-3 space-y-2 text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Estación 1:</strong> Llegadas con distribución Poisson (λ = 20 clientes/hora) 
              y servicio exponencial (μ = 2 minutos promedio)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">•</span>
              <span><strong>Estación 2:</strong> Servicio con distribución uniforme entre 1 y 2 minutos</span>
            </li>
          </ul>
          
          <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
            <p className="font-bold text-yellow-900 mb-2">Preguntas:</p>
            <ol className="list-decimal list-inside space-y-1 text-slate-700">
              <li>¿Cuál es el tiempo promedio en el sistema?</li>
              <li>¿Cuál de las dos colas que se forman es mayor?</li>
            </ol>
          </div>
        </div>

        {/* Diagrama del Sistema */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Diagrama del Sistema</h2>
          <div className="flex items-center justify-center gap-6 p-6 bg-slate-50 rounded-lg">
            {/* Llegadas */}
            <div className="text-center">
              <div className="bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl mb-2">
                λ
              </div>
              <p className="text-xs text-slate-700 font-semibold">Llegadas<br/>(Poisson)</p>
              <p className="text-xs text-slate-600 mt-1">20/hora</p>
            </div>

            <div className="flex-1 border-t-4 border-dashed border-blue-400"></div>

            {/* Estación 1 */}
            <div className="text-center">
              <div className="bg-green-500 text-white rounded-lg p-4 font-bold text-lg mb-2">
                Estación 1
              </div>
              <p className="text-xs text-slate-700 font-semibold">Servicio<br/>(Exponencial)</p>
              <p className="text-xs text-slate-600 mt-1">μ = 2 min</p>
            </div>

            <div className="flex-1 border-t-4 border-dashed border-green-400"></div>

            {/* Estación 2 */}
            <div className="text-center">
              <div className="bg-purple-500 text-white rounded-lg p-4 font-bold text-lg mb-2">
                Estación 2
              </div>
              <p className="text-xs text-slate-700 font-semibold">Servicio<br/>(Uniforme)</p>
              <p className="text-xs text-slate-600 mt-1">[1, 2] min</p>
            </div>

            <div className="flex-1 border-t-4 border-dashed border-purple-400"></div>

            {/* Salida */}
            <div className="text-center">
              <div className="bg-slate-600 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl mb-2">
                →
              </div>
              <p className="text-xs text-slate-700 font-semibold">Salida</p>
            </div>
          </div>
        </div>

        {/* Datos del Problema */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Parámetros del Sistema</h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            {/* Llegadas */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-3 text-sm">Llegadas (Poisson)</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Tasa (λ):</span>
                  <span className="font-bold">{lambdaLlegadas} clientes/hora</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tasa por minuto:</span>
                  <span className="font-bold">{lambdaPorMinuto.toFixed(4)}/min</span>
                </div>
              </div>
              <div className="mt-3 p-2 bg-white rounded text-xs">
                <BlockMath math="T_{llegada} = -\frac{\ln(R_1)}{\lambda}" />
              </div>
            </div>

            {/* Estación 1 */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-bold text-green-900 mb-3 text-sm">Estación 1 (Exponencial)</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Media (μ):</span>
                  <span className="font-bold">{mediaServicio1} minutos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Distribución:</span>
                  <span className="font-bold">Exponencial</span>
                </div>
              </div>
              <div className="mt-3 p-2 bg-white rounded text-xs">
                <BlockMath math="T_{servicio1} = -\mu \ln(R_2)" />
              </div>
            </div>

            {/* Estación 2 */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-bold text-purple-900 mb-3 text-sm">Estación 2 (Uniforme)</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Límite inferior:</span>
                  <span className="font-bold">{limInfServicio2} minuto</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Límite superior:</span>
                  <span className="font-bold">{limSupServicio2} minutos</span>
                </div>
              </div>
              <div className="mt-3 p-2 bg-white rounded text-xs">
                <BlockMath math="T_{servicio2} = a + (b-a) \cdot R_3" />
              </div>
            </div>
          </div>
        </div>

        {/* Pasos de la Simulación */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Pasos de la Simulación</h2>
          
          <div className="space-y-3">
            {/* Paso 1 */}
            <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
              <p className="font-bold text-blue-900 text-sm">Paso 1: Generar número aleatorio R₁</p>
              <p className="text-xs text-slate-600 mt-1">
                R₁ ← GeneradorCongruencialMixto()
              </p>
            </div>

            {/* Paso 2 */}
            <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
              <p className="font-bold text-blue-900 text-sm">Paso 2: Calcular tiempo entre llegadas</p>
              <p className="text-xs text-slate-600 mt-1">
                Tiempo_Entre_Llegadas = -ln(R₁) / λ
              </p>
            </div>

            {/* Paso 3 */}
            <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
              <p className="font-bold text-blue-900 text-sm">Paso 3: Calcular tiempo de llegada acumulado</p>
              <p className="text-xs text-slate-600 mt-1">
                Tiempo_Llegada = Tiempo_Llegada_Anterior + Tiempo_Entre_Llegadas
              </p>
            </div>

            {/* Paso 4 */}
            <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
              <p className="font-bold text-green-900 text-sm">Paso 4: Generar número aleatorio R₂ para Estación 1</p>
              <p className="text-xs text-slate-600 mt-1">
                R₂ ← GeneradorCongruencialMixto()
              </p>
            </div>

            {/* Paso 5 */}
            <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
              <p className="font-bold text-green-900 text-sm">Paso 5: Calcular tiempo de servicio en Estación 1</p>
              <p className="text-xs text-slate-600 mt-1">
                Tiempo_Servicio₁ = -μ × ln(R₂) = -2 × ln(R₂)
              </p>
            </div>

            {/* Paso 6 */}
            <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
              <p className="font-bold text-green-900 text-sm">Paso 6: Determinar inicio y fin de servicio en Estación 1</p>
              <p className="text-xs text-slate-600 mt-1">
                Inicio_Servicio₁ = max(Tiempo_Llegada, Fin_Servicio₁_Anterior)
              </p>
              <p className="text-xs text-slate-600">
                Fin_Servicio₁ = Inicio_Servicio₁ + Tiempo_Servicio₁
              </p>
            </div>

            {/* Paso 7 */}
            <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-500">
              <p className="font-bold text-purple-900 text-sm">Paso 7: Generar número aleatorio R₃ para Estación 2</p>
              <p className="text-xs text-slate-600 mt-1">
                R₃ ← GeneradorCongruencialMixto()
              </p>
            </div>

            {/* Paso 8 */}
            <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-500">
              <p className="font-bold text-purple-900 text-sm">Paso 8: Calcular tiempo de servicio en Estación 2</p>
              <p className="text-xs text-slate-600 mt-1">
                Tiempo_Servicio₂ = 1 + (2-1) × R₃
              </p>
            </div>

            {/* Paso 9 */}
            <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-500">
              <p className="font-bold text-purple-900 text-sm">Paso 9: Determinar inicio y fin de servicio en Estación 2</p>
              <p className="text-xs text-slate-600 mt-1">
                Inicio_Servicio₂ = max(Fin_Servicio₁, Fin_Servicio₂_Anterior)
              </p>
              <p className="text-xs text-slate-600">
                Fin_Servicio₂ = Inicio_Servicio₂ + Tiempo_Servicio₂
              </p>
            </div>

            {/* Paso 10 */}
            <div className="p-3 bg-orange-50 rounded border-l-4 border-orange-500">
              <p className="font-bold text-orange-900 text-sm">Paso 10: Calcular tiempo total en el sistema</p>
              <p className="text-xs text-slate-600 mt-1">
                Tiempo_Total_Sistema = Fin_Servicio₂ - Tiempo_Llegada
              </p>
            </div>

            {/* Paso 11 */}
            <div className="p-3 bg-slate-100 rounded border-l-4 border-slate-500">
              <p className="font-bold text-slate-900 text-sm">Paso 11: Repetir para todos los clientes</p>
              <p className="text-xs text-slate-600 mt-1">
                Volver al Paso 1 para el siguiente cliente
              </p>
            </div>
          </div>
        </div>

        {/* Simulador */}
        <div className="bg-slate-900 text-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Simulador</h3>
            <Calculator size={24} className="text-slate-400" />
          </div>
          
          <div className="p-3 bg-slate-800 border border-slate-700 rounded mb-6">
            <label className="block text-sm text-slate-400 mb-1">Número de clientes a simular:</label>
            <p className="text-2xl font-bold text-white">{numClientes} clientes</p>
          </div>
          
          <button 
            onClick={simularColas}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all flex justify-center items-center gap-2 shadow-md active:scale-95"
          >
            <Play size={20} />
            Iniciar Simulación con {numClientes} Clientes
          </button>
        </div>

        {/* Tabla de Resultados */}
        {mostrarSimulacion && simulacion.length > 0 && (
          <>
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                  Tabla de Simulación - Sistema en Serie
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-700 text-white">
                    <tr>
                      <th rowSpan={2} className="px-2 py-2 border border-slate-600">Cliente</th>
                      <th colSpan={3} className="px-2 py-2 border border-slate-600 bg-black">Llegadas</th>
                      <th colSpan={5} className="px-2 py-2 border border-slate-600 bg-black">Estación 1</th>
                      <th colSpan={5} className="px-2 py-2 border border-slate-600 bg-black">Estación 2</th>
                      <th rowSpan={2} className="px-2 py-2 border border-slate-600 bg-black">
                        Tiempo<br/>Total
                      </th>
                    </tr>
                    <tr>
                      {/* Llegadas */}
                      <th className="px-2 py-2 border border-slate-600 text-[10px] bg-blue-500">R₁</th>
                      <th className="px-2 py-2 border border-slate-600 text-[10px] bg-blue-500">Entre<br/>Llegadas</th>
                      <th className="px-2 py-2 border border-slate-600 text-[10px] bg-blue-500">T. Llegada</th>
                      
                      {/* Estación 1 */}
                      <th className="px-2 py-2 border border-slate-600 text-[10px] bg-green-500">R₂</th>
                      <th className="px-2 py-2 border border-slate-600 text-[10px] bg-green-500">T. Servicio</th>
                      <th className="px-2 py-2 border border-slate-600 text-[10px] bg-green-500">Inicio</th>
                      <th className="px-2 py-2 border border-slate-600 text-[10px] bg-green-500">Fin</th>
                      <th className="px-2 py-2 border border-slate-600 text-[10px] bg-green-500">Espera</th>
                      
                      {/* Estación 2 */}
                      <th className="px-2 py-2 border border-slate-600 text-[10px] bg-purple-500">R₃</th>
                      <th className="px-2 py-2 border border-slate-600 text-[10px] bg-purple-500">T. Servicio</th>
                      <th className="px-2 py-2 border border-slate-600 text-[10px] bg-purple-500">Inicio</th>
                      <th className="px-2 py-2 border border-slate-600 text-[10px] bg-purple-500">Fin</th>
                      <th className="px-2 py-2 border border-slate-600 text-[10px] bg-purple-500">Espera</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simulacion.map((iter, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-2 py-2 border text-center font-semibold">{iter.i}</td>
                        
                        {/* Llegadas */}
                        <td className="px-2 py-2 border text-center font-mono text-blue-600">{iter.R1}</td>
                        <td className="px-2 py-2 border text-center font-mono">{iter.tiempoEntreLlegadas.toFixed(2)}</td>
                        <td className="px-2 py-2 border text-center font-mono font-bold text-blue-700">
                          {iter.tiempoLlegada.toFixed(2)}
                        </td>
                        
                        {/* Estación 1 */}
                        <td className="px-2 py-2 border text-center font-mono text-green-600">{iter.R2}</td>
                        <td className="px-2 py-2 border text-center font-mono">{iter.tiempoServicio1.toFixed(2)}</td>
                        <td className="px-2 py-2 border text-center font-mono">{iter.inicioServicio1.toFixed(2)}</td>
                        <td className="px-2 py-2 border text-center font-mono font-bold text-green-700">
                          {iter.finServicio1.toFixed(2)}
                        </td>
                        <td className="px-2 py-2 border text-center font-mono">{iter.tiempoEspera1.toFixed(2)}</td>
                        
                        {/* Estación 2 */}
                        <td className="px-2 py-2 border text-center font-mono text-purple-600">{iter.R3}</td>
                        <td className="px-2 py-2 border text-center font-mono">{iter.tiempoServicio2.toFixed(2)}</td>
                        <td className="px-2 py-2 border text-center font-mono">{iter.inicioServicio2.toFixed(2)}</td>
                        <td className="px-2 py-2 border text-center font-mono font-bold text-purple-700">
                          {iter.finServicio2.toFixed(2)}
                        </td>
                        <td className="px-2 py-2 border text-center font-mono">{iter.tiempoEspera2.toFixed(2)}</td>
                        
                        {/* Total */}
                        <td className="px-2 py-2 border text-center font-mono font-bold text-orange-700">
                          {iter.tiempoTotalSistema.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-100 font-bold">
                    <tr>
                      <td colSpan={8} className="px-2 py-2 border text-right">Promedios:</td>
                      <td className="px-2 py-2 border text-center text-green-700">
                        {tiempoPromedioEspera1.toFixed(2)}
                      </td>
                      <td colSpan={4} className="px-2 py-2 border"></td>
                      <td className="px-2 py-2 border text-center text-purple-700">
                        {tiempoPromedioEspera2.toFixed(2)}
                      </td>
                      <td className="px-2 py-2 border text-center text-orange-700">
                        {tiempoPromedioSistema.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Respuestas */}
            <div className="bg-green-50 p-6 rounded-lg shadow-lg border-2 border-green-300">
              <h3 className="text-2xl font-bold text-green-900 mb-4">Respuestas al Problema</h3>
              
              <div className="space-y-4">
                {/* Respuesta 1 */}
                <div className="bg-white rounded-lg p-4 border-l-4 border-orange-500">
                  <p className="font-semibold text-slate-700 mb-2">
                    1. ¿Cuál es el tiempo promedio en el sistema?
                  </p>
                  <p className="text-3xl font-bold text-orange-700">
                    {tiempoPromedioSistema.toFixed(2)} minutos
                  </p>
                  <p className="text-sm text-slate-600 mt-2">
                    Este es el tiempo promedio que un cliente pasa desde que llega al sistema 
                    hasta que sale completamente de la Estación 2.
                  </p>
                </div>

                {/* Respuesta 2 */}
                <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
                  <p className="font-semibold text-slate-700 mb-2">
                    2. ¿Cuál de las dos colas que se forman es mayor?
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="p-3 bg-green-50 rounded border border-green-200">
                      <p className="text-sm text-slate-600">Cola Estación 1</p>
                      <p className="text-2xl font-bold text-green-700">
                        {tiempoPromedioEspera1.toFixed(2)} min
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Tiempo promedio de espera</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded border border-purple-200">
                      <p className="text-sm text-slate-600">Cola Estación 2</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {tiempoPromedioEspera2.toFixed(2)} min
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Tiempo promedio de espera</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-purple-900 mt-4">
                    La cola mayor es: {colaMayor}
                  </p>
                </div>

                {/* Análisis adicional */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-3">Análisis Adicional:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">Espera máxima Estación 1:</p>
                      <p className="font-semibold text-slate-800">{colaMaxima1.toFixed(2)} minutos</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Espera máxima Estación 2:</p>
                      <p className="font-semibold text-slate-800">{colaMaxima2.toFixed(2)} minutos</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-3">
                    <strong>Nota:</strong> En un sistema en serie, el tiempo total es la suma de los 
                    tiempos en ambas estaciones más los tiempos de espera en cada cola.
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