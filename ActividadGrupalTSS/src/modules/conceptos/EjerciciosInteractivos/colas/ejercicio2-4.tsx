import { useState } from 'react';
import { RefreshCcw, BookOpen, Calculator, Car } from 'lucide-react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export default function Ejercicio24Colas() {
  const [simulacion, setSimulacion] = useState<any[]>([]);
  const [resumenFinal, setResumenFinal] = useState<any>(null);
  const [numAutos] = useState(5);
  const diasSimular = 365; 
  
  // Generador simple
  const generarAleatorio = () => Math.random();

  // Datos del problema
  const COSTO_ANUAL_AUTO = 75000;
  const RENTA_DIARIA = 350;
  const COSTO_NO_DISPONIBLE = 200;
  const COSTO_OCIOSO = 50;

  // Tabla de demanda (autos rentados por día)
  const tablaDemanda = [
    { valor: 0, prob: 0.10, acumulada: 0.10, rango: [0, 0.10] },
    { valor: 1, prob: 0.10, acumulada: 0.20, rango: [0.10, 0.20] },
    { valor: 2, prob: 0.25, acumulada: 0.45, rango: [0.20, 0.45] },
    { valor: 3, prob: 0.30, acumulada: 0.75, rango: [0.45, 0.75] },
    { valor: 4, prob: 0.25, acumulada: 1.00, rango: [0.75, 1.00] }
  ];

  // Tabla de duración del alquiler (días rentados por auto)
  const tablaDuracion = [
    { valor: 1, prob: 0.40, acumulada: 0.40, rango: [0, 0.40] },
    { valor: 2, prob: 0.35, acumulada: 0.75, rango: [0.40, 0.75] },
    { valor: 3, prob: 0.15, acumulada: 0.90, rango: [0.75, 0.90] },
    { valor: 4, prob: 0.10, acumulada: 1.00, rango: [0.90, 1.00] }
  ];

  // Función para obtener demanda 
  const obtenerDemanda = (r1: number): number => {
    for (const row of tablaDemanda) {
      if (r1 >= row.rango[0] && r1 < row.rango[1]) {
        return row.valor;
      }
    }
    return tablaDemanda[tablaDemanda.length - 1].valor;
  };

  // Función para obtener días rentados
  const obtenerDiasRentados = (r2: number): number => {
    for (const row of tablaDuracion) {
      if (r2 >= row.rango[0] && r2 < row.rango[1]) {
        return row.valor;
      }
    }
    return tablaDuracion[tablaDuracion.length - 1].valor;
  };

  // Simulación
  const simularColas = () => {
    const resultados = [];
    const devoluciones: Array<{dia: number, cantidad: number}> = [];
    let ociososAyer = 0;

    for (let dia = 1; dia <= diasSimular; dia++) {
      // Generamos la demanda diaria
      const R1 = parseFloat(generarAleatorio().toFixed(2));
      const demanda = obtenerDemanda(R1);
      
      // Calculamos autos disponibles 
      let ocupadosIni = 0;
      let disponibles = 0;
      
      if (dia === 1) {
        ocupadosIni = 0;
        disponibles = numAutos;
      } else {
        // Suma de devoluciones del día actual
        const devolucionesDia = devoluciones
          .filter(d => d.dia === dia)
          .reduce((sum, d) => sum + d.cantidad, 0);
        disponibles = devolucionesDia + ociososAyer;
        ocupadosIni = numAutos - disponibles;
      }
      
      // Determinamos cuántos clientes son atendidos y cuántos se pierden
      const aceptados = Math.min(demanda, disponibles);
      const perdidos = Math.max(0, demanda - disponibles);
      
      // Los autos ociosos del día
      const ocioso = disponibles - aceptados;
      
      // Definimos cuántos días se rentan los autos aceptados
      const R2 = parseFloat(generarAleatorio().toFixed(2));
      let diasRentados = 0;
      let diaDevolucion = 0;
      
      if (aceptados > 0) {
        diasRentados = obtenerDiasRentados(R2);
        diaDevolucion = dia + diasRentados;
        // Registro del día de devolución de los autos
        devoluciones.push({dia: diaDevolucion, cantidad: aceptados});
      }
      
      // Calculamos ingresos y costos diarios
      const ingresoDia = aceptados * RENTA_DIARIA * diasRentados;
      const costoOcio = ocioso * COSTO_OCIOSO;
      const costoFalta = perdidos * COSTO_NO_DISPONIBLE;
      const beneficioDia = ingresoDia - costoOcio - costoFalta;
      
      resultados.push({
        dia,
        R1: R1.toFixed(2),
        demanda,
        ocupadosIni,
        disponibles,
        aceptados,
        perdidos,
        ociosos: ocioso,
        R2: R2.toFixed(2),
        diasRentados,
        ingresoDia,
        costoOcio,
        costoFalta,
        beneficioDia,
        diaDevolucion
      });
      
      ociososAyer = ocioso;
    }
    
    // Calcular resultado final
    const beneficioTotal = resultados.reduce((sum, row) => sum + row.beneficioDia, 0);
    const costoMantenimiento = numAutos * COSTO_ANUAL_AUTO;
    const utilidadTotal = beneficioTotal - costoMantenimiento;
    
    setSimulacion(resultados);
    setResumenFinal({
      beneficioTotal,
      costoMantenimiento,
      utilidadTotal,
      diasSimulados: diasSimular
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">

       
        <div className="flex items-center justify-between">
           <div>
             <h1 className="text-2xl font-bold text-slate-900">Ejercicio 2.4: Renta de Autos</h1>
             <p className="text-slate-600 text-sm mt-1">Simulación de Monte Carlo para optimización de inventario</p>
           </div>
           <div className="p-4 bg-blue-50 rounded-lg">
             <Car size={32} className="text-blue-600" />
           </div>
        </div>

       
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-blue-600"/>
            Datos del Problema
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
           
            <div className="space-y-3 text-sm">
              <h3 className="font-bold text-slate-700 mb-3">Parámetros Económicos</h3>
              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <div className="flex justify-between mb-2">
                  <span>Costo anual por auto:</span>
                  <span className="font-bold">Bs. 75,000</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Renta diaria por auto:</span>
                  <span className="font-bold">Bs. 350</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Costo por auto no disponible:</span>
                  <span className="font-bold">Bs. 200</span>
                </div>
                <div className="flex justify-between">
                  <span>Costo por auto ocioso:</span>
                  <span className="font-bold">Bs. 50</span>
                </div>
              </div>
            </div>

           
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-slate-700 mb-2 text-sm">Demanda diaria (# autos)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border border-slate-200">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-2 py-1 border">Valor</th>
                        <th className="px-2 py-1 border">Prob.</th>
                        <th className="px-2 py-1 border">Acum.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tablaDemanda.map((row, idx) => (
                        <tr key={idx}>
                          <td className="px-2 py-1 border text-center">{row.valor}</td>
                          <td className="px-2 py-1 border text-center">{row.prob.toFixed(2)}</td>
                          <td className="px-2 py-1 border text-center">{row.acumulada.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-700 mb-2 text-sm">Duración del alquiler (días)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border border-slate-200">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-2 py-1 border">Valor</th>
                        <th className="px-2 py-1 border">Prob.</th>
                        <th className="px-2 py-1 border">Acum.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tablaDuracion.map((row, idx) => (
                        <tr key={idx}>
                          <td className="px-2 py-1 border text-center">{row.valor}</td>
                          <td className="px-2 py-1 border text-center">{row.prob.toFixed(2)}</td>
                          <td className="px-2 py-1 border text-center">{row.acumulada.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Pasos de la Simulación</h2>
          
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                <p className="font-bold text-blue-900">Paso 1: Debemos generar un numero aleatorio R1:</p>
                <p className="text-xs text-slate-600 mt-1">R1 ← generadorCongruencialMixto()</p>
              </div>
              
              <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                <p className="font-bold text-blue-900">Paso 2: Debemos calcular la demanda del día:</p>
                <p className="text-xs text-slate-600 mt-1">R1  {'<'} 0.10 → Demanda = 0</p>
                <p className="text-xs text-slate-600 mt-1">0.10  {'<'} R1  {'<'} 0.20 → Demanda = 1</p>
                <p className="text-xs text-slate-600 mt-1">0.20  {'<'} R1  {'<'} 0.45 → Demanda = 2</p>
                <p className="text-xs text-slate-600 mt-1">0.45  {'<'} R1  {'<'} 0.75 → Demanda = 3</p>
                <p className="text-xs text-slate-600 mt-1">0.75  {'<'} R1  {'<'} 1.00 → Demanda = 4</p>
              </div>
              
              <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                <p className="font-bold text-green-900">Paso 3: Calculamos los autos disponibles del día </p>
                <p className="text-xs text-slate-600 mt-1">Disponibles = N°autos - rentados + devueltos</p>
              </div>
              
              <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                <p className="font-bold text-green-900">Paso 4: Calculamos los autos que se están rentando en el día</p>
                <p className="text-xs text-slate-600 mt-1">Aceptados = min(Demanda, Disponibles)</p>
              </div>
              
              <div className="p-3 bg-red-50 rounded border-l-4 border-red-500">
                <p className="font-bold text-red-900">Paso 5: Determinamos la cantidad de clientes que no logran rentar un auto debido a la falta de disponibilidad</p>
                <p className="text-xs text-slate-600 mt-1">Perdidos = max(0, Demanda - Disponibles)</p>
              </div>
              
              <div className="p-3 bg-orange-50 rounded border-l-4 border-orange-500">
                <p className="font-bold text-orange-900">Paso 6: Determinamos los autos que no fueron rentados en el día</p>
                <p className="text-xs text-slate-600 mt-1">Ociosos = Disponibles - Aceptados</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                <p className="font-bold text-blue-900">Paso 7: Generamos un número aleatorio R2</p>
                <p className="text-xs text-slate-600 mt-1">R2 ← generadorCongruencialMixto()</p>
              </div>
              
              <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                <p className="font-bold text-blue-900">Paso 8: Si Aceptados es mayor a 0 entonces calculamos los días que los autos serán rentados</p>
                <p className="text-xs text-slate-600 mt-1">R2 {'<'} 0.40 → Dias_Rentados = 1</p>
                <p className="text-xs text-slate-600 mt-1">0.40 {'<'} R2 {'<'} 0.75 → Dias_Rentados = 2</p>
                <p className="text-xs text-slate-600 mt-1">0.75 {'<'} R2 {'<'} 0.90 → Dias_Rentados = 3</p>
                <p className="text-xs text-slate-600 mt-1">0.90 {'<'} R2 {'<'} 1.00 → Dias_Rentados = 4</p>
              </div>
              
              <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                <p className="font-bold text-green-900">Paso 9: Calculamos los ingresos del día</p>
                <p className="text-xs text-slate-600 mt-1">Ingreso = Aceptados × 350 × Días_Rentados</p>
              </div>
              
              <div className="p-3 bg-orange-50 rounded border-l-4 border-orange-500">
                <p className="font-bold text-orange-900">Paso 10: Calculamos el costo del Ocio</p>
                <p className="text-xs text-slate-600 mt-1">Costo_Ocio = Ociosos × 50</p>
              </div>
              
              <div className="p-3 bg-red-50 rounded border-l-4 border-red-500">
                <p className="font-bold text-red-900">Paso 11: Calculamos el costo de los faltantes</p>
                <p className="text-xs text-slate-600 mt-1">Costo_Falta = Perdidos × 200</p>
              </div>
              
              <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-500">
                <p className="font-bold text-purple-900">Paso 12: Calculamos el beneficio del día</p>
                <p className="text-xs text-slate-600 mt-1">Beneficio = Ingreso - Costo_Ocio - Costo_Falta</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-slate-50 rounded border border-slate-300">
            <p className="font-bold text-slate-900">Paso 13: Repetimos los pasos por el número de días que se desee simular</p>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Simulador</h3>
            <Calculator size={24} className="text-slate-400" />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="p-3 bg-slate-800 border border-slate-700 rounded flex flex-col justify-center">
              <label className="block text-sm text-slate-400 mb-1">Número de autos:</label>
              <p className="text-2xl font-bold text-white">{numAutos} autos</p>
            </div>
            <div className="p-3 bg-slate-800 border border-slate-700 rounded flex flex-col justify-center">
              <label className="block text-sm text-slate-400 mb-1">Días de operación:</label>
              <p className="text-2xl font-bold text-white">365 días</p>
            </div>
          </div>
          
          <button 
            onClick={simularColas}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all flex justify-center items-center gap-2 shadow-md active:scale-95"
          >
            <RefreshCcw size={20} />
            Simular 365 Días con {numAutos} Autos
          </button>
        </div>

        {/* --- RESULTADO FINAL --- */}
        {resumenFinal && (
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl shadow-lg border-2 border-purple-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Resultado Final</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-slate-600">Beneficio Total (365 días)</p>
                <p className="text-2xl font-bold text-green-600">Bs. {Math.round(resumenFinal.beneficioTotal).toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-slate-600">Costo Mantenimiento Anual</p>
                <p className="text-2xl font-bold text-red-600">Bs. {Math.round(resumenFinal.costoMantenimiento).toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-slate-600">Utilidad Total</p>
                <p className={`text-2xl font-bold ${resumenFinal.utilidadTotal >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  Bs. {Math.round(resumenFinal.utilidadTotal).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-white rounded-lg">
              <BlockMath math={`Utilidad\\_Total = \\left(\\sum_{i=1}^{365} Beneficio\\_dia_i\\right) - N°\\_autos \\times 75000`} />
            </div>
          </div>
        )}

        {/* --- TABLA DE RESULTADOS --- */}
        {simulacion.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
              <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">Tabla de Simulación</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 border-b">
                  <tr>
                    <th className="px-2 py-2 font-medium">Día</th>
                    <th className="px-2 py-2 font-medium">R₁</th>
                    <th className="px-2 py-2 font-medium">Demanda</th>
                    <th className="px-2 py-2 font-medium">Ocup. Ini</th>
                    <th className="px-2 py-2 font-medium">Disp.</th>
                    <th className="px-2 py-2 font-medium">Acept.</th>
                    <th className="px-2 py-2 font-medium">Perdidos</th>
                    <th className="px-2 py-2 font-medium">Ociosos</th>
                    <th className="px-2 py-2 font-medium">R₂</th>
                    <th className="px-2 py-2 font-medium">Días Rent.</th>
                    <th className="px-2 py-2 font-medium">Ingreso</th>
                    <th className="px-2 py-2 font-medium">C. Ocio</th>
                    <th className="px-2 py-2 font-medium">C. Falta</th>
                    <th className="px-2 py-2 font-medium">Beneficio</th>
                    <th className="px-2 py-2 font-medium">Día Dev.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {simulacion.map((row) => (
                    <tr key={row.dia} className="hover:bg-slate-50">
                      <td className="px-2 py-2 font-mono">{row.dia}</td>
                      <td className="px-2 py-2 font-mono text-blue-600">{row.R1}</td>
                      <td className="px-2 py-2 font-mono">{row.demanda}</td>
                      <td className="px-2 py-2 font-mono text-slate-500">{row.ocupadosIni}</td>
                      <td className="px-2 py-2 font-mono">{row.disponibles}</td>
                      <td className="px-2 py-2 font-mono text-green-600">{row.aceptados}</td>
                      <td className="px-2 py-2 font-mono text-red-600">{row.perdidos}</td>
                      <td className="px-2 py-2 font-mono text-orange-600">{row.ociosos}</td>
                      <td className="px-2 py-2 font-mono text-blue-600">{row.R2}</td>
                      <td className="px-2 py-2 font-mono">{row.diasRentados}</td>
                      <td className="px-2 py-2 font-mono text-green-700">{row.ingresoDia}</td>
                      <td className="px-2 py-2 font-mono text-orange-700">{row.costoOcio}</td>
                      <td className="px-2 py-2 font-mono text-red-700">{row.costoFalta}</td>
                      <td className="px-2 py-2 font-mono font-bold text-purple-700">{row.beneficioDia}</td>
                      <td className="px-2 py-2 font-mono text-indigo-600">{row.diaDevolucion || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
