interface IteracionEstacionamiento {
  i: number;                      // Número de cliente
  
  // Llegadas
  r1_llegada: number;             // Random para tiempo entre llegadas
  tiempoEntreLlegadas: number;    // Tiempo entre llegadas calculado
  tiempoLlegada: number;          // Tiempo de llegada acumulado
  
  // Estado del sistema
  lugaresOcupados: number;        // Lugares ocupados al llegar
  puedeEntrar: boolean;           // Si encuentra lugar disponible
  
  // Servicio (solo si entra)
  lugarAsignado: number | null;   // Lugar asignado (1-6) o null si no entra
  r2_servicio: number | null;     // Random para tiempo de permanencia
  tiempoPermanencia: number | null; // Tiempo en el estacionamiento
  tiempoSalida: number | null;    // Tiempo en que sale
}

interface TablaEstacionamientoProps {
  iteraciones: IteracionEstacionamiento[];
  capacidad: number;
  mostrarTotales?: boolean;
}

export default function TablaEstacionamiento({ 
  iteraciones, 
  capacidad,
  mostrarTotales = true 
}: TablaEstacionamientoProps) {
  // Calcular estadísticas
  const clientesAtendidos = iteraciones.filter(it => it.puedeEntrar).length;
  const clientesPerdidos = iteraciones.filter(it => !it.puedeEntrar).length;
  const porcentajePerdidos = iteraciones.length > 0 
    ? (clientesPerdidos / iteraciones.length) * 100 
    : 0;
  const probabilidadLugar = iteraciones.length > 0
    ? (clientesAtendidos / iteraciones.length) * 100
    : 0;

  // Calcular espacios disponibles promedio
  let sumaEspaciosDisponibles = 0;
  iteraciones.forEach(it => {
    sumaEspaciosDisponibles += (capacidad - it.lugaresOcupados);
  });
  const espaciosDisponiblesPromedio = iteraciones.length > 0
    ? sumaEspaciosDisponibles / iteraciones.length
    : 0;
  const porcentajeEspaciosDisponibles = (espaciosDisponiblesPromedio / capacidad) * 100;

  // Calcular tiempo promedio de permanencia (solo clientes atendidos)
  const tiemposValidos = iteraciones
    .filter(it => it.tiempoPermanencia !== null)
    .map(it => it.tiempoPermanencia as number);
  const tiempoPromedioEstancia = tiemposValidos.length > 0
    ? tiemposValidos.reduce((sum, t) => sum + t, 0) / tiemposValidos.length
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Tabla de Simulación - Sistema de Estacionamiento (Capacidad: {capacidad} lugares)
      </h3>

      {/* Resumen de resultados */}
      {mostrarTotales && (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
    {/* Clientes Perdidos */}
    <div className="p-4 border border-gray-200 rounded hover:border-gray-400 transition-colors bg-white">
      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Clientes Perdidos</p>
      <p className="text-2xl font-bold text-gray-900">{porcentajePerdidos.toFixed(2)}%</p>
      <p className="text-[10px] text-gray-400 mt-1 font-mono">({clientesPerdidos} de {iteraciones.length})</p>
    </div>
    
    {/* Probabilidad Encontrar Lugar */}
    <div className="p-4 border border-gray-200 rounded hover:border-gray-400 transition-colors bg-white">
      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Prob. Encontrar Lugar</p>
      <p className="text-2xl font-bold text-gray-900">{probabilidadLugar.toFixed(2)}%</p>
      <p className="text-[10px] text-gray-400 mt-1 font-mono">({clientesAtendidos} atendidos)</p>
    </div>

    {/* Espacios Disponibles */}
    <div className="p-4 border border-gray-200 rounded hover:border-gray-400 transition-colors bg-white">
      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Espacios Disponibles</p>
      <p className="text-2xl font-bold text-gray-900">{porcentajeEspaciosDisponibles.toFixed(2)}%</p>
      <p className="text-[10px] text-gray-400 mt-1 font-mono">{espaciosDisponiblesPromedio.toFixed(2)} lugares prom.</p>
    </div>

    {/* Tiempo Promedio Estancia */}
    <div className="p-4 border border-gray-200 rounded hover:border-gray-400 transition-colors bg-white">
      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Tiempo Prom. Estancia</p>
      <p className="text-2xl font-bold text-gray-900">
        {tiempoPromedioEstancia.toFixed(2)} <span className="text-sm font-normal text-gray-500">min</span>
      </p>
      <p className="text-[10px] text-gray-400 mt-1 font-mono">Solo clientes atendidos</p>
    </div>
  </div>
)}

      {/* Tabla scrollable */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-xs">
          <thead className="bg-slate-700 text-white">
            <tr>
              <th rowSpan={2} className="border border-slate-600 px-2 py-3 sticky left-0 bg-slate-700 z-10">
                Cliente
              </th>
              <th colSpan={3} className="border border-slate-600 px-2 py-2 bg-black">
                Llegadas
              </th>
              <th colSpan={2} className="border border-slate-600 px-2 py-2 bg-black">
                Estado del Sistema
              </th>
              <th colSpan={4} className="border border-slate-600 px-2 py-2 bg-black">
                Servicio (si entra)
              </th>
            </tr>
            <tr>
              {/* Llegadas */}
              <th className="border border-slate-600 px-2 py-2 text-[10px] bg-gray-500">R₁</th>
              <th className="border border-slate-600 px-2 py-2 text-[10px] bg-gray-500">Entre<br/>Llegadas</th>
              <th className="border border-slate-600 px-2 py-2 text-[10px] bg-gray-500">T. Llegada</th>
              
              {/* Estado */}
              <th className="border border-slate-600 px-2 py-2 text-[10px] bg-gray-500">Lugares<br/>Ocupados</th>
              <th className="border border-slate-600 px-2 py-2 text-[10px] bg-gray-500">¿Entra?</th>
              
              {/* Servicio */}
              <th className="border border-slate-600 px-2 py-2 text-[10px] bg-gray-500">Lugar</th>
              <th className="border border-slate-600 px-2 py-2 text-[10px] bg-gray-500">R₂</th>
              <th className="border border-slate-600 px-2 py-2 text-[10px] bg-gray-500">T. Permanencia</th>
              <th className="border border-slate-600 px-2 py-2 text-[10px] bg-gray-500">T. Salida</th>
            </tr>
          </thead>
          <tbody>
            {iteraciones.map((iter, idx) => (
              <tr 
                key={idx} 
                className={
                  !iter.puedeEntrar 
                    ? 'bg-red-50' 
                    : idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                }
              >
                <td className="border border-gray-300 px-3 py-2 font-semibold text-center sticky left-0 bg-gray-100">
                  {iter.i}
                </td>
                
                {/* Llegadas */}
                <td className="border border-gray-300 px-2 py-2 text-center">{iter.r1_llegada.toFixed(4)}</td>
                <td className="border border-gray-300 px-2 py-2 text-center">{iter.tiempoEntreLlegadas.toFixed(2)}</td>
                <td className="border border-gray-300 px-2 py-2 text-center font-semibold text-blue-700">
                  {iter.tiempoLlegada.toFixed(2)}
                </td>
                
                {/* Estado */}
                <td className="border border-gray-300 px-2 py-2 text-center font-semibold">
                  {iter.lugaresOcupados} / {capacidad}
                </td>
                <td className="border border-gray-300 px-2 py-2 text-center">
                  <span className={`inline-block px-2 py-1 rounded text-white font-bold text-[10px] ${
                    iter.puedeEntrar ? 'bg-green-600' : 'bg-red-600'
                  }`}>
                    {iter.puedeEntrar ? 'SÍ' : 'NO'}
                  </span>
                </td>
                
                {/* Servicio */}
                <td className="border border-gray-300 px-2 py-2 text-center">
                  {iter.lugarAsignado !== null ? (
                    <span className="inline-block px-2 py-1 rounded bg-blue-500 text-white font-bold text-[10px]">
                      {iter.lugarAsignado}
                    </span>
                  ) : '-'}
                </td>
                <td className="border border-gray-300 px-2 py-2 text-center">
                  {iter.r2_servicio !== null ? iter.r2_servicio.toFixed(4) : '-'}
                </td>
                <td className="border border-gray-300 px-2 py-2 text-center">
                  {iter.tiempoPermanencia !== null ? iter.tiempoPermanencia.toFixed(2) : '-'}
                </td>
                <td className="border border-gray-300 px-2 py-2 text-center font-semibold text-green-700">
                  {iter.tiempoSalida !== null ? iter.tiempoSalida.toFixed(2) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Leyenda */}
      <div className="mt-4 text-xs text-gray-600 space-y-1">
        <p><strong>R₁, R₂:</strong> Números aleatorios uniformes U(0,1)</p>
        <p><strong>Lugares Ocupados:</strong> Número de lugares ocupados cuando el cliente llega</p>
        <p><strong>¿Entra?:</strong> Si el cliente encuentra lugar disponible (lugares ocupados &lt; capacidad)</p>
        <p><strong>Clientes en rojo:</strong> No pudieron entrar por falta de espacio</p>
      </div>
    </div>
  );
}