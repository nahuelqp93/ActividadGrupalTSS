import { useState } from 'react';

interface Evento {
  barco: number;
  rLlegada: number;
  tellHoras: number;
  llegadaHoras: number;
  inicioDescargaHoras: number;
  tEsperaHoras: number;
  rDescarga: number;
  tDescargaHoras: number;
  terminaDescargaHoras: number;
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

export default function Ejercicio9() {
  const [lambdaBarcos, setLambdaBarcos] = useState('10');
  const [diasSimulacion, setDiasSimulacion] = useState('30');
  const [tiempoMinDescarga, setTiempoMinDescarga] = useState('10');
  const [tiempoMaxDescarga, setTiempoMaxDescarga] = useState('16');
  const [costoHoraEspera, setCostoHoraEspera] = useState('1000');
  const [costoHoraDescarga, setCostoHoraDescarga] = useState('200');
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
    const horasSimulacion = parseFloat(diasSimulacion) * 24;
    let tiempoAcumuladoLlegada = 0;
    let tiempoFinDescargaAnterior = 0;
    let numeroBarco = 1;

    while (tiempoAcumuladoLlegada < horasSimulacion) {
      const rLlegada = rng();
      const tiempoEntreLL = generarTiempoExponencial(rLlegada, parseFloat(lambdaBarcos) / 24);
      tiempoAcumuladoLlegada += tiempoEntreLL;

      if (tiempoAcumuladoLlegada >= horasSimulacion) break;

      const inicioDescarga = Math.max(tiempoAcumuladoLlegada, tiempoFinDescargaAnterior);
      const tEspera = inicioDescarga - tiempoAcumuladoLlegada;

      const rDescarga = rng();
      const tDescarga = generarTiempoUniforme(
        rDescarga,
        parseFloat(tiempoMinDescarga),
        parseFloat(tiempoMaxDescarga)
      ) / tamanoEquipo;
      const terminaDescarga = inicioDescarga + tDescarga;

      eventos.push({
        barco: numeroBarco,
        rLlegada: parseFloat(rLlegada.toFixed(4)),
        tellHoras: parseFloat(tiempoEntreLL.toFixed(2)),
        llegadaHoras: parseFloat(tiempoAcumuladoLlegada.toFixed(2)),
        inicioDescargaHoras: parseFloat(inicioDescarga.toFixed(2)),
        tEsperaHoras: parseFloat(tEspera.toFixed(2)),
        rDescarga: parseFloat(rDescarga.toFixed(4)),
        tDescargaHoras: parseFloat(tDescarga.toFixed(2)),
        terminaDescargaHoras: parseFloat(terminaDescarga.toFixed(2))
      });

      tiempoFinDescargaAnterior = terminaDescarga;
      numeroBarco++;
    }

    const tiempoEsperaTotal = eventos.reduce((sum, e) => sum + e.tEsperaHoras, 0);
    const tiempoEsperaPromedio = eventos.length > 0 ? tiempoEsperaTotal / eventos.length : 0;
    const costoEspera = tiempoEsperaTotal * parseFloat(costoHoraEspera);
    const costoEquipo = parseFloat(diasSimulacion) * 24 * parseFloat(costoHoraDescarga) * tamanoEquipo;
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
    const resultadosTemp: ResultadoEquipo[] = [];

    for (let n = 1; n <= 5; n++) {
      const rng = createLCG(seed);
      const resultado = simularParaEquipo(n, rng);
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
        Ejercicio 9: Optimización de Equipo de Descarga Portuaria
      </h1>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6">
        <h2 className="text-xl font-bold mb-3">Descripción del Problema</h2>
        <p className="mb-2">
          Un puerto debe determinar el tamaño óptimo del equipo de descarga para minimizar
          el costo total (costo de espera de barcos + costo del equipo).
        </p>
        <p className="mb-2">
          <strong>Llegadas:</strong> Distribución exponencial con tasa λ barcos/día
        </p>
        <p className="mb-2">
          <strong>Descarga:</strong> Distribución uniforme entre [min, max] horas, dividido por el tamaño del equipo
        </p>
        <p className="mb-2">
          <strong>Objetivo:</strong> Encontrar el equipo que minimice el costo total durante el período de simulación
        </p>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-6">
        <h3 className="text-lg font-bold mb-2">Teoría del Método</h3>
        <div className="space-y-2 text-sm">
          <p><strong>1. Simulación de eventos discretos:</strong></p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Generación de tiempos entre llegadas: T = -ln(1-R) / λ</li>
            <li>Generación de tiempos de servicio: T = min + R(max - min)</li>
            <li>Efecto del tamaño del equipo: T_servicio_efectivo = T_base / N</li>
          </ul>
          <p><strong>2. Cálculo de costos:</strong></p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Costo de espera = Σ(tiempo_espera) × costo_por_hora</li>
            <li>Costo del equipo = días × 24 × costo_por_hora × tamaño_equipo</li>
            <li>Costo total = costo_espera + costo_equipo</li>
          </ul>
          <p><strong>3. Trade-off:</strong> Equipos grandes reducen espera pero aumentan costo operativo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold mb-3">Parámetros de Llegada</h3>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">
              Tasa de llegada (λ barcos/día)
            </label>
            <input
              type="number"
              step="0.1"
              value={lambdaBarcos}
              onChange={(e) => setLambdaBarcos(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">
              Días de simulación
            </label>
            <input
              type="number"
              value={diasSimulacion}
              onChange={(e) => setDiasSimulacion(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold mb-3">Parámetros de Descarga</h3>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">
              Tiempo mínimo de descarga (horas)
            </label>
            <input
              type="number"
              value={tiempoMinDescarga}
              onChange={(e) => setTiempoMinDescarga(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">
              Tiempo máximo de descarga (horas)
            </label>
            <input
              type="number"
              value={tiempoMaxDescarga}
              onChange={(e) => setTiempoMaxDescarga(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold mb-3">Costos</h3>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">
              Costo de espera de barco ($/hora)
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
            <h3 className="text-xl font-bold mb-3">Resumen de Costos por Tamaño de Equipo</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border p-3">Tamaño Equipo</th>
                    <th className="border p-3">Barcos Atendidos</th>
                    <th className="border p-3">Tiempo Espera Total (h)</th>
                    <th className="border p-3">Tiempo Espera Promedio (h)</th>
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
                        <td className="border p-2 text-center">{resultado.tiempoEsperaTotal.toFixed(2)}</td>
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
                <p className="text-sm text-gray-700 mt-2">
                  Este tamaño de equipo minimiza el costo total durante {diasSimulacion} días de operación.
                </p>
              </div>
            )}
          </div>

          {resultados.map((resultado) => (
            <div key={resultado.tamanoEquipo} className="mb-6">
              <h3 className="text-xl font-bold mb-3">
                Detalle: Equipo de {resultado.tamanoEquipo} persona(s)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border p-2">Barco</th>
                      <th className="border p-2">R Llegada</th>
                      <th className="border p-2">T.Entre LL (h)</th>
                      <th className="border p-2">Llegada (h)</th>
                      <th className="border p-2">Inicio Desc (h)</th>
                      <th className="border p-2">T.Espera (h)</th>
                      <th className="border p-2">R Descarga</th>
                      <th className="border p-2">T.Descarga (h)</th>
                      <th className="border p-2">Termina Desc (h)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.eventos.slice(0, 20).map((evento, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="border p-2 text-center">{evento.barco}</td>
                        <td className="border p-2 text-center">{evento.rLlegada}</td>
                        <td className="border p-2 text-center">{evento.tellHoras}</td>
                        <td className="border p-2 text-center">{evento.llegadaHoras}</td>
                        <td className="border p-2 text-center">{evento.inicioDescargaHoras}</td>
                        <td className="border p-2 text-center">{evento.tEsperaHoras}</td>
                        <td className="border p-2 text-center">{evento.rDescarga}</td>
                        <td className="border p-2 text-center">{evento.tDescargaHoras}</td>
                        <td className="border p-2 text-center">{evento.terminaDescargaHoras}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {resultado.eventos.length > 20 && (
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    Mostrando primeros 20 de {resultado.eventos.length} barcos atendidos
                  </p>
                )}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
