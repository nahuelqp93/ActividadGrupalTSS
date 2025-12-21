import { useState } from 'react';
import {  BookOpen, Calculator, Car, Play } from 'lucide-react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface IteracionEstacionamiento {
  i: number;
  R1: string;
  tiempoEntreLlegadas: number;
  tiempoLlegada: number;
  lugaresOcupados: number;
  lugaresDisponibles: number;
  aceptado: boolean;
  R2: string;
  tiempoEstacionamiento: number;
  tiempoSalida: number;
}

interface Vehiculo {
  cliente: number;
  tiempoSalida: number;
}

export default function EjercicioEstacionamiento() {
  const [simulacion, setSimulacion] = useState<IteracionEstacionamiento[]>([]);
  const [mostrarSimulacion, setMostrarSimulacion] = useState(false);
  const [numClientes] = useState(40);

  // Parámetros del problema
  const capacidad = 6; // lugares disponibles
  const lambdaLlegadas = 10; // clientes por hora
  const lambdaPorMinuto = lambdaLlegadas / 60; // convertir a por minuto
  const limInfEstacionamiento = 10; // minutos
  const limSupEstacionamiento = 30; // minutos

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
  const simularEstacionamiento = () => {
    const rng = createLCG(1234);
    const resultados: IteracionEstacionamiento[] = [];
    
    // Array de vehículos en el estacionamiento
    const vehiculosEstacionados: Vehiculo[] = [];
    let tiempoLlegadaAnterior = 0;

    for (let i = 1; i <= numClientes; i++) {
      // PASO 1-3: Generar tiempo entre llegadas (Poisson -> Exponencial)
      const R1 = rng();
      const tiempoEntreLlegadas = -Math.log(R1) / lambdaPorMinuto;
      const tiempoLlegada = tiempoLlegadaAnterior + tiempoEntreLlegadas;

      // PASO 4: Liberar lugares de vehículos que ya salieron
      const vehiculosRestantes: Vehiculo[] = [];
      for (const vehiculo of vehiculosEstacionados) {
        if (vehiculo.tiempoSalida > tiempoLlegada) {
          vehiculosRestantes.push(vehiculo);
        }
      }
      vehiculosEstacionados.length = 0;
      vehiculosEstacionados.push(...vehiculosRestantes);

      // PASO 5: Calcular lugares ocupados y disponibles
      const lugaresOcupados = vehiculosEstacionados.length;
      const lugaresDisponibles = capacidad - lugaresOcupados;

      // PASO 6: Verificar si hay lugar disponible
      const aceptado = lugaresDisponibles > 0;

      let tiempoEstacionamiento = 0;
      let tiempoSalida = 0;
      let R2String = '-';

      if (aceptado) {
        // PASO 7-8: Generar tiempo de estacionamiento
        const R2 = rng();
        R2String = R2.toFixed(4);
        tiempoEstacionamiento = limInfEstacionamiento + 
          (limSupEstacionamiento - limInfEstacionamiento) * R2;
        tiempoSalida = tiempoLlegada + tiempoEstacionamiento;

        // PASO 9: Agregar vehículo al estacionamiento
        vehiculosEstacionados.push({
          cliente: i,
          tiempoSalida
        });
      }

      resultados.push({
        i,
        R1: R1.toFixed(4),
        tiempoEntreLlegadas,
        tiempoLlegada,
        lugaresOcupados,
        lugaresDisponibles,
        aceptado,
        R2: R2String,
        tiempoEstacionamiento,
        tiempoSalida
      });

      // Actualizar para siguiente iteración
      tiempoLlegadaAnterior = tiempoLlegada;
    }

    setSimulacion(resultados);
    setMostrarSimulacion(true);
  };

  // Cálculos de resultados
  const clientesAceptados = simulacion.filter(it => it.aceptado).length;
  const clientesPerdidos = simulacion.length - clientesAceptados;
  const porcentajePerdidos = simulacion.length > 0
    ? (clientesPerdidos / simulacion.length) * 100
    : 0;

  const probabilidadLugarDisponible = simulacion.length > 0
    ? (clientesAceptados / simulacion.length) * 100
    : 0;

  const promedioLugaresDisponibles = simulacion.length > 0
    ? simulacion.reduce((sum, it) => sum + it.lugaresDisponibles, 0) / simulacion.length
    : 0;

  const porcentajeEspaciosDisponibles = (promedioLugaresDisponibles / capacidad) * 100;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Ejercicio 3: Estacionamiento con Capacidad Limitada
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Simulación de sistema con pérdida de clientes por falta de espacio
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <Car size={32} className="text-blue-600" />
          </div>
        </div>

        {/* Enunciado */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-blue-600"/>
            Enunciado del Problema
          </h2>
          <p className="text-slate-700 leading-relaxed">
            Una tienda pequeña tiene un lote de estacionamiento con <strong>{capacidad} lugares disponibles</strong>. 
            Los clientes llegan en forma aleatoria de acuerdo a un <strong>proceso Poisson</strong> a una 
            razón media de <strong>{lambdaLlegadas} clientes por hora</strong>, y se van <strong>inmediatamente 
            si no existen lugares disponibles</strong> en el estacionamiento. El tiempo que un auto permanece 
            en el estacionamiento sigue una <strong>distribución uniforme entre {limInfEstacionamiento} y {limSupEstacionamiento} minutos</strong>.
          </p>
          
          <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
            <p className="font-bold text-yellow-900 mb-2">Preguntas:</p>
            <ol className="list-decimal list-inside space-y-1 text-slate-700">
              <li>¿Qué porcentaje de los clientes es perdido por no tener más lugares disponibles?</li>
              <li>¿Cuál es la probabilidad de encontrar un lugar disponible en el estacionamiento?</li>
              <li>¿Cuál es el porcentaje promedio de espacios disponibles?</li>
            </ol>
          </div>
        </div>

        {/* Diagrama del Sistema */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Diagrama del Sistema</h2>
          <div className="space-y-4">
            {/* Flujo */}
            <div className="flex items-center justify-center gap-6 p-6 bg-slate-50 rounded-lg">
              {/* Llegadas */}
              <div className="text-center">
                <div className="bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl mb-2">
                  λ
                </div>
                <p className="text-xs text-slate-700 font-semibold">Llegadas<br/>(Poisson)</p>
                <p className="text-xs text-slate-600 mt-1">{lambdaLlegadas}/hora</p>
              </div>

              <div className="flex-1 border-t-4 border-dashed border-blue-400"></div>

              {/* Verificación */}
              <div className="bg-yellow-100 rounded-lg p-4 border-2 border-yellow-400">
                <p className="text-center font-bold text-slate-800 mb-1">¿HAY LUGAR?</p>
                <div className="flex gap-2 text-xs mt-2">
                  <span className="text-green-700 font-semibold">SÍ → Entra</span>
                  <span className="text-red-700 font-semibold">NO → Se va</span>
                </div>
              </div>

              <div className="flex-1 border-t-4 border-dashed border-green-400"></div>

              {/* Estacionamiento */}
              <div className="text-center">
                <div className="bg-green-500 text-white rounded-lg p-4 font-bold text-lg mb-2">
                  Estacionamiento
                </div>
                <p className="text-xs text-slate-700 font-semibold">Capacidad: {capacidad} lugares</p>
                <p className="text-xs text-slate-600 mt-1">Uniforme [{limInfEstacionamiento}, {limSupEstacionamiento}] min</p>
              </div>
            </div>

            {/* Representación visual de lugares */}
            <div className="bg-slate-100 p-4 rounded-lg">
              <p className="text-center text-sm font-semibold text-slate-700 mb-3">
                Lugares del Estacionamiento
              </p>
              <div className="grid grid-cols-6 gap-3 max-w-2xl mx-auto">
                {Array.from({ length: capacidad }, (_, i) => (
                  <div key={i} className="bg-white border-2 border-slate-300 rounded-lg p-3 text-center">
                    <Car size={24} className="mx-auto text-slate-400" />
                    <p className="text-xs text-slate-600 mt-1">Lugar {i + 1}</p>
                  </div>
                ))}
              </div>
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

            {/* Capacidad */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-bold text-green-900 mb-3 text-sm">Capacidad</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Lugares totales:</span>
                  <span className="font-bold">{capacidad} lugares</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Política:</span>
                  <span className="font-bold">Pérdidas</span>
                </div>
              </div>
              <div className="mt-3 p-2 bg-white rounded text-xs">
                <p className="text-slate-600">
                  Si ocupados = {capacidad} → Cliente se va
                </p>
              </div>
            </div>

            {/* Estacionamiento */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-bold text-purple-900 mb-3 text-sm">Tiempo de Estacionamiento</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Mínimo:</span>
                  <span className="font-bold">{limInfEstacionamiento} minutos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Máximo:</span>
                  <span className="font-bold">{limSupEstacionamiento} minutos</span>
                </div>
              </div>
              <div className="mt-3 p-2 bg-white rounded text-xs">
                <BlockMath math="T_{estac} = a + (b-a) \cdot R_2" />
              </div>
            </div>
          </div>
        </div>

        {/* Pasos de la Simulación */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Pasos de la Simulación</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
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
                <p className="font-bold text-blue-900 text-sm">Paso 3: Calcular tiempo de llegada</p>
                <p className="text-xs text-slate-600 mt-1">
                  Tiempo_Llegada = Tiempo_Llegada_Anterior + Tiempo_Entre_Llegadas
                </p>
              </div>

              {/* Paso 4 */}
              <div className="p-3 bg-orange-50 rounded border-l-4 border-orange-500">
                <p className="font-bold text-orange-900 text-sm">Paso 4: Liberar lugares de vehículos que salieron</p>
                <p className="text-xs text-slate-600 mt-1">
                  Eliminar vehículos cuyo Tiempo_Salida ≤ Tiempo_Llegada_Actual
                </p>
              </div>

              {/* Paso 5 */}
              <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                <p className="font-bold text-green-900 text-sm">Paso 5: Calcular lugares disponibles</p>
                <p className="text-xs text-slate-600 mt-1">
                  Lugares_Ocupados = cantidad de vehículos en estacionamiento
                </p>
                <p className="text-xs text-slate-600">
                  Lugares_Disponibles = {capacidad} - Lugares_Ocupados
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Paso 6 */}
              <div className="p-3 bg-red-50 rounded border-l-4 border-red-500">
                <p className="font-bold text-red-900 text-sm">Paso 6: Verificar si hay lugar disponible</p>
                <p className="text-xs text-slate-600 mt-1">
                  Si Lugares_Disponibles {'>'} 0 → Cliente aceptado
                </p>
                <p className="text-xs text-slate-600">
                  Si Lugares_Disponibles = 0 → Cliente perdido (se va)
                </p>
              </div>

              {/* Paso 7 */}
              <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-500">
                <p className="font-bold text-purple-900 text-sm">Paso 7: Si hay lugar, generar R₂</p>
                <p className="text-xs text-slate-600 mt-1">
                  R₂ ← GeneradorCongruencialMixto()
                </p>
              </div>

              {/* Paso 8 */}
              <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-500">
                <p className="font-bold text-purple-900 text-sm">Paso 8: Calcular tiempo de estacionamiento</p>
                <p className="text-xs text-slate-600 mt-1">
                  Tiempo_Estacionamiento = {limInfEstacionamiento} + ({limSupEstacionamiento}-{limInfEstacionamiento}) × R₂
                </p>
              </div>

              {/* Paso 9 */}
              <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                <p className="font-bold text-green-900 text-sm">Paso 9: Agregar vehículo al estacionamiento</p>
                <p className="text-xs text-slate-600 mt-1">
                  Tiempo_Salida = Tiempo_Llegada + Tiempo_Estacionamiento
                </p>
                <p className="text-xs text-slate-600">
                  Registrar vehículo con su Tiempo_Salida
                </p>
              </div>

              {/* Paso 10 */}
              <div className="p-3 bg-slate-100 rounded border-l-4 border-slate-500">
                <p className="font-bold text-slate-900 text-sm">Paso 10: Repetir para todos los clientes</p>
                <p className="text-xs text-slate-600 mt-1">
                  Volver al Paso 1 para el siguiente cliente
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Simulador */}
        <div className="bg-slate-900 text-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Simulador</h3>
            <Calculator size={24} className="text-slate-400" />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="p-3 bg-slate-800 border border-slate-700 rounded">
              <label className="block text-sm text-slate-400 mb-1">Capacidad del estacionamiento:</label>
              <p className="text-2xl font-bold text-white">{capacidad} lugares</p>
            </div>
            <div className="p-3 bg-slate-800 border border-slate-700 rounded">
              <label className="block text-sm text-slate-400 mb-1">Clientes a simular:</label>
              <p className="text-2xl font-bold text-white">{numClientes} clientes</p>
            </div>
          </div>
          
          <button 
            onClick={simularEstacionamiento}
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
                  Tabla de Simulación - Sistema con Capacidad Limitada
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-700 text-white">
                    <tr>
                      <th rowSpan={2} className="px-2 py-2 border border-slate-600">Cliente</th>
                      <th colSpan={3} className="px-2 py-2 border border-slate-600 bg-blue-600">Llegadas</th>
                      <th colSpan={2} className="px-2 py-2 border border-slate-600 bg-green-600">Estado del Estacionamiento</th>
                      <th rowSpan={2} className="px-2 py-2 border border-slate-600 bg-red-600">
                        ¿Aceptado?
                      </th>
                      <th colSpan={3} className="px-2 py-2 border border-slate-600 bg-purple-600">Si Aceptado</th>
                    </tr>
                    <tr>
                      {/* Llegadas */}
                      <th className="px-2 py-2 border border-slate-600 text-[10px] bg-blue-500">R₁</th>
                      <th className="px-2 py-2 border border-slate-600 text-[10px] bg-blue-500">Entre<br/>Llegadas</th>
                      <th className="px-2 py-2 border border-slate-600 text-[10px] bg-blue-500">T. Llegada</th>
                      
                      {/* Estado */}
                      <th className="px-2 py-2 border border-slate-600 text-[10px] bg-green-500">Ocupados</th>
                      <th className="px-2 py-2 border border-slate-600 text-[10px] bg-green-500">Disponibles</th>
                      
                      {/* Si aceptado */}
                      <th className="px-2 py-2 border border-slate-600 text-[10px] bg-purple-500">R₂</th>
                      <th className="px-2 py-2 border border-slate-600 text-[10px] bg-purple-500">T. Estac.</th>
                      <th className="px-2 py-2 border border-slate-600 text-[10px] bg-purple-500">T. Salida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simulacion.map((iter, idx) => (
                      <tr key={idx} className={
                        !iter.aceptado ? 'bg-red-50' : (idx % 2 === 0 ? 'bg-gray-50' : 'bg-white')
                      }>
                        <td className="px-2 py-2 border text-center font-semibold">{iter.i}</td>
                        
                        {/* Llegadas */}
                        <td className="px-2 py-2 border text-center font-mono text-blue-600">{iter.R1}</td>
                        <td className="px-2 py-2 border text-center font-mono">{iter.tiempoEntreLlegadas.toFixed(2)}</td>
                        <td className="px-2 py-2 border text-center font-mono font-bold text-blue-700">
                          {iter.tiempoLlegada.toFixed(2)}
                        </td>
                        
                        {/* Estado */}
                        <td className="px-2 py-2 border text-center font-mono font-bold text-orange-700">
                          {iter.lugaresOcupados}
                        </td>
                        <td className="px-2 py-2 border text-center font-mono font-bold text-green-700">
                          {iter.lugaresDisponibles}
                        </td>
                        
                        {/* Aceptado */}
                        <td className="px-2 py-2 border text-center">
                          {iter.aceptado ? (
                            <span className="inline-block px-2 py-1 rounded bg-green-500 text-white font-bold text-[10px]">
                              SÍ
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-1 rounded bg-red-500 text-white font-bold text-[10px]">
                              NO
                            </span>
                          )}
                        </td>
                        
                        {/* Si aceptado */}
                        <td className="px-2 py-2 border text-center font-mono text-purple-600">
                          {iter.aceptado ? iter.R2 : '-'}
                        </td>
                        <td className="px-2 py-2 border text-center font-mono">
                          {iter.aceptado ? iter.tiempoEstacionamiento.toFixed(2) : '-'}
                        </td>
                        <td className="px-2 py-2 border text-center font-mono font-bold text-purple-700">
                          {iter.aceptado ? iter.tiempoSalida.toFixed(2) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-100 font-bold">
                    <tr>
                      <td colSpan={4} className="px-2 py-2 border text-right">Totales:</td>
                      <td colSpan={2} className="px-2 py-2 border text-center text-green-700">
                        Promedio: {promedioLugaresDisponibles.toFixed(2)} lugares
                      </td>
                      <td className="px-2 py-2 border text-center">
                        <span className="text-green-700">{clientesAceptados} SÍ</span>
                        {' / '}
                        <span className="text-red-700">{clientesPerdidos} NO</span>
                      </td>
                      <td colSpan={3} className="px-2 py-2 border"></td>
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
                <div className="bg-white rounded-lg p-4 border-l-4 border-red-500">
                  <p className="font-semibold text-slate-700 mb-2">
                    a) ¿Qué porcentaje de los clientes es perdido por no tener más lugares disponibles?
                  </p>
                  <div className="flex items-center gap-4">
                    <p className="text-3xl font-bold text-red-700">
                      {porcentajePerdidos.toFixed(2)}%
                    </p>
                    <div className="text-sm text-slate-600">
                      <p>{clientesPerdidos} clientes perdidos de {simulacion.length} total</p>
                    </div>
                  </div>
                </div>

                {/* Respuesta 2 */}
                <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                  <p className="font-semibold text-slate-700 mb-2">
                    b) ¿Cuál es la probabilidad de encontrar un lugar disponible en el estacionamiento?
                  </p>
                  <div className="flex items-center gap-4">
                    <p className="text-3xl font-bold text-green-700">
                      {probabilidadLugarDisponible.toFixed(2)}%
                    </p>
                    <div className="text-sm text-slate-600">
                      <p>{clientesAceptados} clientes aceptados de {simulacion.length} total</p>
                    </div>
                  </div>
                </div>

                {/* Respuesta 3 */}
                <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                  <p className="font-semibold text-slate-700 mb-2">
                    c) ¿Cuál es el porcentaje promedio de espacios disponibles?
                  </p>
                  <div className="flex items-center gap-4">
                    <p className="text-3xl font-bold text-blue-700">
                      {porcentajeEspaciosDisponibles.toFixed(2)}%
                    </p>
                    <div className="text-sm text-slate-600">
                      <p>Promedio: {promedioLugaresDisponibles.toFixed(2)} lugares disponibles de {capacidad} totales</p>
                    </div>
                  </div>
                </div>

                {/* Análisis adicional */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-3">Análisis Adicional:</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">Tasa de utilización promedio:</p>
                      <p className="font-semibold text-slate-800">
                        {(100 - porcentajeEspaciosDisponibles).toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600">Lugares ocupados (promedio):</p>
                      <p className="font-semibold text-slate-800">
                        {(capacidad - promedioLugaresDisponibles).toFixed(2)} lugares
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-white rounded">
                    <p className="text-xs text-slate-600 mb-2">
                      <strong>Interpretación:</strong>
                    </p>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                      <li>
                        Si el porcentaje de pérdidas es alto ({'>'} 10%), considerar ampliar el estacionamiento
                      </li>
                      <li>
                        Una utilización promedio entre 70-85% indica un buen balance entre servicio y capacidad
                      </li>
                      <li>
                        La probabilidad de encontrar lugar refleja la satisfacción potencial del cliente
                      </li>
                    </ul>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs text-slate-500">
                      <strong>Nota:</strong> En un sistema M/M/c/c (con pérdidas), la probabilidad de bloqueo 
                      se puede calcular teóricamente usando la fórmula de Erlang B.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}