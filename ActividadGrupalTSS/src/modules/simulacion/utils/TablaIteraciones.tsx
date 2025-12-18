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

interface TablaIteracionesProps {
  iteraciones: IteracionCola[];
  mostrarTotales?: boolean;
  maxFilas?: number;
}

export default function TablaIteraciones({
  iteraciones,
  mostrarTotales = true,
  maxFilas = 50,
}: TablaIteracionesProps) {
  const filasMostradas = iteraciones.slice(0, maxFilas);

  const promedios =
    iteraciones.length > 0
      ? {
          tiempoEntreLlegadas:
            iteraciones.reduce((s, i) => s + i.tiempoEntreLlegadas, 0) /
            iteraciones.length,
          tiempoServicio1:
            iteraciones.reduce((s, i) => s + i.tiempoServicio1, 0) /
            iteraciones.length,
          tiempoEspera1:
            iteraciones.reduce((s, i) => s + i.tiempoEspera1, 0) /
            iteraciones.length,
          tiempoServicio2:
            iteraciones.reduce((s, i) => s + i.tiempoServicio2, 0) /
            iteraciones.length,
          tiempoEspera2:
            iteraciones.reduce((s, i) => s + i.tiempoEspera2, 0) /
            iteraciones.length,
          tiempoTotalSistema:
            iteraciones.reduce((s, i) => s + i.tiempoTotalSistema, 0) /
            iteraciones.length,
        }
      : null;

  return (
    <div className="bg-white border border-gray-300 p-4">
      <h3 className="text-lg font-semibold mb-4 text-black">
        Tabla de Simulación – Sistema de Colas en Serie
      </h3>

      {mostrarTotales && promedios && (
        <div className="mb-4 text-sm text-black space-y-1">
          <p>
            Tiempo promedio en el sistema:{' '}
            <strong>{promedios.tiempoTotalSistema.toFixed(2)}</strong>
          </p>
          <p>
            Tiempo promedio de espera Estación 1:{' '}
            <strong>{promedios.tiempoEspera1.toFixed(2)}</strong>
          </p>
          <p>
            Tiempo promedio de espera Estación 2:{' '}
            <strong>{promedios.tiempoEspera2.toFixed(2)}</strong>
          </p>
          <p>
            Clientes simulados:{' '}
            <strong>{iteraciones.length}</strong>
          </p>
        </div>
      )}

      {iteraciones.length > maxFilas && (
        <p className="text-xs text-gray-700 mb-2">
          Se muestran las primeras {maxFilas} iteraciones de{' '}
          {iteraciones.length}.
        </p>
      )}

      <div className="overflow-x-auto border border-gray-400">
        <table className="w-full text-xs border-collapse">
          <thead className="bg-gray-100 text-black">
            <tr>
              <th className="border border-gray-400 px-2 py-1">Cliente</th>
              <th className="border border-gray-400 px-2 py-1">R1</th>
              <th className="border border-gray-400 px-2 py-1">Entre llegadas</th>
              <th className="border border-gray-400 px-2 py-1">Llegada</th>

              <th className="border border-gray-400 px-2 py-1">R2</th>
              <th className="border border-gray-400 px-2 py-1">Serv. 1</th>
              <th className="border border-gray-400 px-2 py-1">Inicio</th>
              <th className="border border-gray-400 px-2 py-1">Fin</th>
              <th className="border border-gray-400 px-2 py-1">Espera</th>

              <th className="border border-gray-400 px-2 py-1">R3</th>
              <th className="border border-gray-400 px-2 py-1">Serv. 2</th>
              <th className="border border-gray-400 px-2 py-1">Inicio</th>
              <th className="border border-gray-400 px-2 py-1">Fin</th>
              <th className="border border-gray-400 px-2 py-1">Espera</th>

              <th className="border border-gray-400 px-2 py-1">
                Tiempo total
              </th>
            </tr>
          </thead>

          <tbody>
            {filasMostradas.map((it) => (
              <tr key={it.i}>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  {it.i}
                </td>

                <td className="border border-gray-300 px-2 py-1 text-center">
                  {it.r1_llegada.toFixed(4)}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  {it.tiempoEntreLlegadas.toFixed(2)}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  {it.tiempoLlegada.toFixed(2)}
                </td>

                <td className="border border-gray-300 px-2 py-1 text-center">
                  {it.r2_servicio1.toFixed(4)}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  {it.tiempoServicio1.toFixed(2)}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  {it.inicioServicio1.toFixed(2)}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  {it.finServicio1.toFixed(2)}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  {it.tiempoEspera1.toFixed(2)}
                </td>

                <td className="border border-gray-300 px-2 py-1 text-center">
                  {it.r3_servicio2.toFixed(4)}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  {it.tiempoServicio2.toFixed(2)}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  {it.inicioServicio2.toFixed(2)}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  {it.finServicio2.toFixed(2)}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  {it.tiempoEspera2.toFixed(2)}
                </td>

                <td className="border border-gray-300 px-2 py-1 text-center font-semibold">
                  {it.tiempoTotalSistema.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>

          {mostrarTotales && promedios && (
            <tfoot className="bg-gray-200 font-semibold">
              <tr>
                <td className="border border-gray-400 px-2 py-1">Promedio</td>
                <td className="border border-gray-400 px-2 py-1">-</td>
                <td className="border border-gray-400 px-2 py-1">
                  {promedios.tiempoEntreLlegadas.toFixed(2)}
                </td>
                <td className="border border-gray-400 px-2 py-1">-</td>

                <td className="border border-gray-400 px-2 py-1">-</td>
                <td className="border border-gray-400 px-2 py-1">
                  {promedios.tiempoServicio1.toFixed(2)}
                </td>
                <td className="border border-gray-400 px-2 py-1">-</td>
                <td className="border border-gray-400 px-2 py-1">-</td>
                <td className="border border-gray-400 px-2 py-1">
                  {promedios.tiempoEspera1.toFixed(2)}
                </td>

                <td className="border border-gray-400 px-2 py-1">-</td>
                <td className="border border-gray-400 px-2 py-1">
                  {promedios.tiempoServicio2.toFixed(2)}
                </td>
                <td className="border border-gray-400 px-2 py-1">-</td>
                <td className="border border-gray-400 px-2 py-1">-</td>
                <td className="border border-gray-400 px-2 py-1">
                  {promedios.tiempoEspera2.toFixed(2)}
                </td>

                <td className="border border-gray-400 px-2 py-1">
                  {promedios.tiempoTotalSistema.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
