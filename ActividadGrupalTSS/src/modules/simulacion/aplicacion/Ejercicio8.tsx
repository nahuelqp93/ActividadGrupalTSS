import { useState } from 'react';

interface Evento {
  camion: number;
  rLlegada: number;
  tellMinutos: number;
  llegadaMinutos: number;
  inicioServMinutos: number;
  tEsperaMinutos: number;
  rServicio: number;
  tsMinutos: number;
  terminaServMinutos: number;
}

interface ResultadoEquipo {
  tamanoEquipo: number;
  eventos: Evento[];
  tiempoEsperaTotal: number;
  tiempoEsperaPromedio: number;
  costoEspera: number;
  costoEquipo: number;
  costoTotal: number;
}

export default function Ejercicio8() {
  const [lambdaCamiones, setLambdaCamiones] = useState('3');
  const [horasTurno, setHorasTurno] = useState('8');
  const [tiempoMinServicio, setTiempoMinServicio] = useState('6');
  const [tiempoMaxServicio, setTiempoMaxServicio] = useState('15');
  const [costoHoraEspera, setCostoHoraEspera] = useState('50');
  const [costoHoraDescarga, setCostoHoraDescarga] = useState('25');
  const [seed] = useState(1234);
  const [resultados, setResultados] = useState<ResultadoEquipo[]>([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);

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

  const generarTiempoExponencial = (r: number, lambda: number): number => {
    return -Math.log(1 - r) / lambda;
  };

  const generarTiempoUniforme = (r: number, min: number, max: number): number => {
    return min + r * (max - min);
  };

  const simularParaEquipo = (tamanoEquipo: number, rng: () => number) => {
    const eventos: Evento[] = [];
    const tiempoTurnoMinutos = parseFloat(horasTurno) * 60;
    let tiempoAcumuladoLlegada = 0;
    let tiempoFinServicioAnterior = 0;
    let numeroCamion = 1;

    while (tiempoAcumuladoLlegada < tiempoTurnoMinutos) {
      const rLlegada = rng();
      const tiempoEntreLL = generarTiempoExponencial(rLlegada, parseFloat(lambdaCamiones) / 60);
      tiempoAcumuladoLlegada += tiempoEntreLL;

      if (tiempoAcumuladoLlegada >= tiempoTurnoMinutos) break;

      const inicioServ = Math.max(tiempoAcumuladoLlegada, tiempoFinServicioAnterior);
      const tEspera = inicioServ - tiempoAcumuladoLlegada;

      const rServicio = rng();
      const ts = generarTiempoUniforme(
        rServicio,
        parseFloat(tiempoMinServicio),
        parseFloat(tiempoMaxServicio)
      ) / tamanoEquipo;
      const terminaServ = inicioServ + ts;

      eventos.push({
        camion: numeroCamion,
        rLlegada: parseFloat(rLlegada.toFixed(3)),
        tellMinutos: parseFloat(tiempoEntreLL.toFixed(1)),
        llegadaMinutos: parseFloat(tiempoAcumuladoLlegada.toFixed(1)),
        inicioServMinutos: parseFloat(inicioServ.toFixed(1)),
        tEsperaMinutos: parseFloat(tEspera.toFixed(1)),
        rServicio: parseFloat(rServicio.toFixed(3)),
        tsMinutos: parseFloat(ts.toFixed(1)),
        terminaServMinutos: parseFloat(terminaServ.toFixed(1))
      });

      tiempoFinServicioAnterior = terminaServ;
      numeroCamion++;
    }

    const tiempoEsperaTotal = eventos.reduce((sum, e) => sum + e.tEsperaMinutos, 0);
    const tiempoEsperaPromedio = tiempoEsperaTotal / eventos.length;
    const costoEspera = (tiempoEsperaTotal / 60) * parseFloat(costoHoraEspera);
    const costoEquipo = parseFloat(horasTurno) * parseFloat(costoHoraDescarga) * tamanoEquipo;
    const costoTotal = costoEspera + costoEquipo;

    return {
      tamanoEquipo,
      eventos,
      tiempoEsperaTotal,
      tiempoEsperaPromedio,
      costoEspera,
      costoEquipo,
      costoTotal
    };
  };

  const simular = () => {
    const rng = createLCG(seed);
    const resultadosTemp: ResultadoEquipo[] = [];

    for (let n = 1; n <= 3; n++) {
      const rngCopia = createLCG(seed);
      const resultado = simularParaEquipo(n, rngCopia);
      resultadosTemp.push(resultado);
    }

    setResultados(resultadosTemp);
    setMostrarResultados(true);
  };

  const obtenerMejorOpcion = () => {
    if (resultados.length === 0) return null;
    return resultados.reduce((min, curr) => 
      curr.costoTotal < min.costoTotal ? curr : min
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Ejercicio 8: Optimización de Equipo de Descarga
      </h1>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6">
        <h2 className="text-xl font-bold mb-3">Descripción del Problema</h2>
        <p className="mb-2">
          Una empresa debe decidir el tamaño óptimo del equipo de descarga para minimizar
          el costo total (costo de espera de camiones + costo del equipo).
        </p>
        <p className="mb-2">
          <strong>Llegadas:</strong> Distribución exponencial con tasa λ camiones/hora
        </p>
        <p className="mb-2">
          <strong>Servicio:</strong> Distribución uniforme entre [min, max] minutos, dividido por el tamaño del equipo
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold mb-3">Parámetros de Llegada</h3>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">
              Tasa de llegada (λ camiones/hora)
            </label>
            <input
              type="number"
              step="0.1"
              value={lambdaCamiones}
              onChange={(e) => setLambdaCamiones(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">
              Duración del turno (horas)
            </label>
            <input
              type="number"
              value={horasTurno}
              onChange={(e) => setHorasTurno(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold mb-3">Parámetros de Servicio</h3>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">
              Tiempo mínimo de servicio (min)
            </label>
            <input
              type="number"
              value={tiempoMinServicio}
              onChange={(e) => setTiempoMinServicio(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">
              Tiempo máximo de servicio (min)
            </label>
            <input
              type="number"
              value={tiempoMaxServicio}
              onChange={(e) => setTiempoMaxServicio(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold mb-3">Costos</h3>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">
              Costo de espera ($/hora)
            </label>
            <input
              type="number"
              value={costoHoraEspera}
              onChange={(e) => setCostoHoraEspera(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">
              Costo equipo descarga ($/hora por persona)
            </label>
            <input
              type="number"
              value={costoHoraDescarga}
              onChange={(e) => setCostoHoraDescarga(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      <button
        onClick={simular}
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md mb-6"
      >
        Simular
      </button>

      {mostrarResultados && resultados.length > 0 && (
        <>
          <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-6">
            <h3 className="text-xl font-bold mb-3">Resumen de Costos</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border p-3">Tamaño Equipo</th>
                    <th className="border p-3">Camiones Atendidos</th>
                    <th className="border p-3">Tiempo Espera Total (min)</th>
                    <th className="border p-3">Tiempo Espera Promedio (min)</th>
                    <th className="border p-3">Costo Espera ($)</th>
                    <th className="border p-3">Costo Equipo ($)</th>
                    <th className="border p-3">Costo Total ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {resultados.map((resultado) => {
                    const esMejor = resultado === obtenerMejorOpcion();
                    return (
                      <tr 
                        key={resultado.tamanoEquipo}
                        className={esMejor ? 'bg-yellow-100 font-bold' : 'bg-white'}
                      >
                        <td className="border p-2 text-center">{resultado.tamanoEquipo}</td>
                        <td className="border p-2 text-center">{resultado.eventos.length}</td>
                        <td className="border p-2 text-center">{resultado.tiempoEsperaTotal.toFixed(1)}</td>
                        <td className="border p-2 text-center">{resultado.tiempoEsperaPromedio.toFixed(2)}</td>
                        <td className="border p-2 text-center">${resultado.costoEspera.toFixed(2)}</td>
                        <td className="border p-2 text-center">${resultado.costoEquipo.toFixed(2)}</td>
                        <td className="border p-2 text-center">${resultado.costoTotal.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {obtenerMejorOpcion() && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded">
                <p className="text-lg font-bold text-yellow-800">
                  ✓ Mejor opción: Equipo de {obtenerMejorOpcion()!.tamanoEquipo} persona(s) 
                  con costo total de ${obtenerMejorOpcion()!.costoTotal.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {resultados.map((resultado) => (
            <div key={resultado.tamanoEquipo} className="mb-6">
              <h3 className="text-xl font-bold mb-3">
                Simulación con Equipo de {resultado.tamanoEquipo} persona(s)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border p-2">Camión</th>
                      <th className="border p-2">R Llegada</th>
                      <th className="border p-2">T.Entre LL (min)</th>
                      <th className="border p-2">Llegada (min)</th>
                      <th className="border p-2">Inicio Serv (min)</th>
                      <th className="border p-2">T.Espera (min)</th>
                      <th className="border p-2">R Servicio</th>
                      <th className="border p-2">T.Servicio (min)</th>
                      <th className="border p-2">Termina Serv (min)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.eventos.map((evento, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="border p-2 text-center">{evento.camion}</td>
                        <td className="border p-2 text-center">{evento.rLlegada}</td>
                        <td className="border p-2 text-center">{evento.tellMinutos}</td>
                        <td className="border p-2 text-center">{evento.llegadaMinutos}</td>
                        <td className="border p-2 text-center">{evento.inicioServMinutos}</td>
                        <td className="border p-2 text-center">{evento.tEsperaMinutos}</td>
                        <td className="border p-2 text-center">{evento.rServicio}</td>
                        <td className="border p-2 text-center">{evento.tsMinutos}</td>
                        <td className="border p-2 text-center">{evento.terminaServMinutos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
