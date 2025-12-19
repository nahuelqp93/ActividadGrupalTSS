interface IteracionMultiServidor {
  i: number;                    // Número de cliente
  
  // Llegadas
  r1_llegada: number;           // Random para tiempo entre llegadas
  tiempoEntreLlegadas: number;  // Tiempo entre llegadas calculado
  tiempoLlegada: number;        // Tiempo de llegada acumulado
  
  // Servicio
  cajeroAsignado: number;       // Cajero que atiende (1, 2 o 3)
  r2_servicio: number;          // Random para servicio
  tiempoServicio: number;       // Tiempo de servicio
  inicioServicio: number;       // Inicio del servicio
  finServicio: number;          // Fin del servicio
  tiempoEspera: number;         // Tiempo en cola
  
  // Totales
  tiempoTotalSistema: number;   // Tiempo total en el sistema
  clientesEnSistema: number;    // Clientes en sistema en ese momento
}

interface TablaMultiServidorProps {
  iteraciones: IteracionMultiServidor[];
  numServidores: number;
  mostrarTotales?: boolean;
}

export default function TablaMultiServidor({ 
  iteraciones, 
  numServidores,
  mostrarTotales = true 
}: TablaMultiServidorProps) {
  // Calcular promedios
  const promedios = iteraciones.length > 0 ? {
    tiempoEntreLlegadas: iteraciones.reduce((sum, it) => sum + it.tiempoEntreLlegadas, 0) / iteraciones.length,
    tiempoServicio: iteraciones.reduce((sum, it) => sum + it.tiempoServicio, 0) / iteraciones.length,
    tiempoEspera: iteraciones.reduce((sum, it) => sum + it.tiempoEspera, 0) / iteraciones.length,
    tiempoTotalSistema: iteraciones.reduce((sum, it) => sum + it.tiempoTotalSistema, 0) / iteraciones.length,
    clientesEnSistema: iteraciones.reduce((sum, it) => sum + it.clientesEnSistema, 0) / iteraciones.length,
  } : null;

  // Calcular uso por cajero
  const usoCajeros = Array.from({ length: numServidores }, (_, idx) => {
    const cajero = idx + 1;
    const atendidos = iteraciones.filter(it => it.cajeroAsignado === cajero).length;
    return { cajero, atendidos };
  });

  return (
    <div className="bg-white rounded border border-gray-200 shadow-sm p-6 font-sans">
      <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
        <h3 className="text-xl font-bold text-gray-900">
          Reporte de Simulación: Sistema de Colas
        </h3>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {numServidores} Servidores Activos
        </span>
      </div>

      {/* Resumen de resultados (KPIs) */}
      {mostrarTotales && promedios && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 border border-gray-200 rounded hover:border-gray-400 transition-colors">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Tiempo Prom. Sistema</p>
            <p className="text-2xl font-bold text-gray-900">{promedios.tiempoTotalSistema.toFixed(2)} <span className="text-sm font-normal text-gray-500">min</span></p>
          </div>
          
          <div className="p-4 border border-gray-200 rounded hover:border-gray-400 transition-colors">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Clientes Prom. Sistema</p>
            <p className="text-2xl font-bold text-gray-900">{promedios.clientesEnSistema.toFixed(2)}</p>
          </div>

          <div className="p-4 border border-gray-200 rounded hover:border-gray-400 transition-colors">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Tiempo Prom. Espera</p>
            <p className="text-2xl font-bold text-gray-900">{promedios.tiempoEspera.toFixed(2)} <span className="text-sm font-normal text-gray-500">min</span></p>
          </div>

          <div className="p-4 border border-gray-200 rounded hover:border-gray-400 transition-colors">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Total Muestras</p>
            <p className="text-2xl font-bold text-gray-900">{iteraciones.length}</p>
          </div>
        </div>
      )}

      {/* Uso de cajeros */}
      {mostrarTotales && (
        <div className="mb-8">
          <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Distribución de Carga</h4>
          <div className="grid grid-cols-3 gap-0 border border-gray-200 rounded overflow-hidden divide-x divide-gray-200">
            {usoCajeros.map(({ cajero, atendidos }) => (
              <div key={cajero} className="bg-gray-50 p-4 text-center hover:bg-gray-100 transition-colors">
                <p className="text-xs text-gray-500 mb-1">Cajero {cajero}</p>
                <p className="text-lg font-bold text-gray-900">{atendidos}</p>
                <p className="text-[10px] text-gray-400 font-mono">
                  {((atendidos/iteraciones.length)*100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabla scrollable */}
      <div className="overflow-x-auto border border-gray-300 rounded-sm">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            {/* Fila Superior de Categorías */}
            <tr className="bg-gray-900 text-white">
              <th rowSpan={2} className="px-3 py-3 border-r border-gray-700 font-semibold w-16 text-center">
                #
              </th>
              <th colSpan={3} className="px-3 py-2 border-r border-gray-700 text-center font-bold tracking-wider">
                LLEGADAS
              </th>
              <th colSpan={6} className="px-3 py-2 border-r border-gray-700 text-center font-bold tracking-wider">
                SERVICIO
              </th>
              <th rowSpan={2} className="px-3 py-3 border-r border-gray-700 font-semibold text-center w-20">
                Total<br/>Sistema
              </th>
              <th rowSpan={2} className="px-3 py-3 font-semibold text-center w-20">
                Clientes<br/>Sistema
              </th>
            </tr>
            
            {/* Fila Inferior de Columnas */}
            <tr className="bg-gray-100 text-gray-600 border-b-2 border-gray-300">
              {/* Llegadas */}
              <th className="px-2 py-2 border-r border-gray-300 font-medium text-center">R₁</th>
              <th className="px-2 py-2 border-r border-gray-300 font-medium text-center">T. Entre</th>
              <th className="px-2 py-2 border-r border-gray-300 font-bold text-gray-800 text-center">T. Llegada</th>
              
              {/* Servicio */}
              <th className="px-2 py-2 border-r border-gray-300 font-medium text-center">Cajero</th>
              <th className="px-2 py-2 border-r border-gray-300 font-medium text-center">R₂</th>
              <th className="px-2 py-2 border-r border-gray-300 font-medium text-center">T. Serv.</th>
              <th className="px-2 py-2 border-r border-gray-300 font-medium text-center">Inicio</th>
              <th className="px-2 py-2 border-r border-gray-300 font-medium text-center">Fin</th>
              <th className="px-2 py-2 border-r border-gray-300 font-bold text-gray-800 text-center">Espera</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-200">
            {iteraciones.map((iter, idx) => (
              <tr key={idx} className={`hover:bg-gray-100 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="border-r border-gray-300 px-3 py-2 text-center font-mono text-gray-500">
                  {iter.i}
                </td>
                
                {/* Llegadas */}
                <td className="border-r border-gray-200 px-2 py-2 text-center font-mono text-gray-600">{iter.r1_llegada.toFixed(4)}</td>
                <td className="border-r border-gray-200 px-2 py-2 text-center font-mono text-gray-600">{iter.tiempoEntreLlegadas.toFixed(2)}</td>
                <td className="border-r border-gray-300 px-2 py-2 text-center font-mono font-bold text-gray-800">{iter.tiempoLlegada.toFixed(2)}</td>
                
                {/* Servicio */}
                <td className="border-r border-gray-200 px-2 py-2 text-center">
                  <span className="inline-block w-6 h-6 leading-6 rounded-sm bg-gray-800 text-white text-[10px] font-bold">
                    {iter.cajeroAsignado}
                  </span>
                </td>
                <td className="border-r border-gray-200 px-2 py-2 text-center font-mono text-gray-600">{iter.r2_servicio.toFixed(4)}</td>
                <td className="border-r border-gray-200 px-2 py-2 text-center font-mono text-gray-600">{iter.tiempoServicio.toFixed(2)}</td>
                <td className="border-r border-gray-200 px-2 py-2 text-center font-mono text-gray-600">{iter.inicioServicio.toFixed(2)}</td>
                <td className="border-r border-gray-300 px-2 py-2 text-center font-mono text-gray-600">{iter.finServicio.toFixed(2)}</td>
                <td className={`border-r border-gray-300 px-2 py-2 text-center font-mono font-bold ${iter.tiempoEspera > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
                  {iter.tiempoEspera.toFixed(2)}
                </td>
                
                {/* Totales */}
                <td className="border-r border-gray-300 px-2 py-2 text-center font-mono font-bold text-gray-900 bg-gray-50/50">
                  {iter.tiempoTotalSistema.toFixed(2)}
                </td>
                <td className="px-2 py-2 text-center font-mono font-semibold text-gray-700">
                  {iter.clientesEnSistema}
                </td>
              </tr>
            ))}
          </tbody>
          
          {/* Fila de promedios */}
          {mostrarTotales && promedios && (
            <tfoot className="bg-gray-100 border-t-2 border-gray-400 font-semibold text-gray-900">
              <tr>
                <td className="border-r border-gray-300 px-3 py-3 text-center text-[10px] uppercase tracking-wider">
                  Promedio
                </td>
                <td className="border-r border-gray-300 px-2 py-2 text-center text-gray-400">-</td>
                <td className="border-r border-gray-300 px-2 py-2 text-center font-mono">
                  {promedios.tiempoEntreLlegadas.toFixed(2)}
                </td>
                <td className="border-r border-gray-300 px-2 py-2 text-center text-gray-400">-</td>
                <td className="border-r border-gray-300 px-2 py-2 text-center text-gray-400">-</td>
                <td className="border-r border-gray-300 px-2 py-2 text-center text-gray-400">-</td>
                <td className="border-r border-gray-300 px-2 py-2 text-center font-mono">
                  {promedios.tiempoServicio.toFixed(2)}
                </td>
                <td className="border-r border-gray-300 px-2 py-2 text-center text-gray-400">-</td>
                <td className="border-r border-gray-300 px-2 py-2 text-center text-gray-400">-</td>
                <td className="border-r border-gray-300 px-2 py-2 text-center font-mono font-bold bg-gray-200">
                  {promedios.tiempoEspera.toFixed(2)}
                </td>
                <td className="border-r border-gray-300 px-2 py-2 text-center font-mono font-bold bg-gray-200">
                  {promedios.tiempoTotalSistema.toFixed(2)}
                </td>
                <td className="px-2 py-2 text-center font-mono font-bold bg-gray-200">
                  {promedios.clientesEnSistema.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 flex flex-wrap gap-4">
        <span><strong>R₁, R₂:</strong> Aleatorios Uniformes U(0,1)</span>
        <span><strong>Cajero:</strong> Servidor asignado</span>
        <span><strong>Espera:</strong> Tiempo en cola</span>
        <span><strong>Clientes:</strong> Cantidad en sistema</span>
      </div>
    </div>
  );
}