import { useState } from 'react';
import { RefreshCcw, BookOpen, Cpu } from 'lucide-react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export default function Ejercicio27Mantenimiento() {
  const [simulacion1, setSimulacion1] = useState<any[]>([]);
  const [simulacion2, setSimulacion2] = useState<any[]>([]);
  const [resumen, setResumen] = useState<any>(null);
  
  // Parámetros del problema
  const HORAS_LIMITE = 20000;
  const MEDIA_VIDA = 600;
  const DESV_VIDA = 100;
  const COSTO_COMPONENTE = 200;
  const COSTO_HORA_DESCONEXION = 100;
  const NUM_COMPONENTES = 4;

  // Función para calcular la inversa de la función 
  const erfInv = (x: number): number => {
    const clampedX = Math.max(-0.9999, Math.min(0.9999, x));
    
    const a = 0.147;
    const sgn = clampedX < 0 ? -1 : 1;
    const absX = Math.abs(clampedX);
    
    const ln1MinusX2 = Math.log(1 - absX * absX);
    const term1 = 2 / (Math.PI * a) + ln1MinusX2 / 2;
    const term2 = ln1MinusX2 / a;
    
    return sgn * Math.sqrt(Math.sqrt(term1 * term1 - term2) - term1);
  };

  // Función cuantil (inversa) de la distribución normal estándar
  const normPPF = (p: number): number => {
    const clampedP = Math.max(0.0001, Math.min(0.9999, p));
    return Math.sqrt(2) * erfInv(2 * clampedP - 1);
  };

  // Generar tiempo de vida con distribución Normal
  const generarNormal = (m: number, desv: number, r: number): number => {
    const z = normPPF(r);
    const valor = m + desv * z;
    const resultado = Math.max(1, Math.round(valor));
    return resultado;
  };

  // Política 1: Reemplazar componente individual
  const simularPolitica1 = () => {
    const resultados = [];
    let horasTotales = 0;
    let iteracion = 0;
    
    // Variables para tiempos de vida después de restar horas trabajadas
    let c1_des = 0, c2_des = 0, c3_des = 0, c4_des = 0;
    let componenteRemplazados = 0;

    while (horasTotales <= HORAS_LIMITE) {
      iteracion++;
      
      // Paso 1: Generar o usar tiempos de vida
      let c1, c2, c3, c4;
      
      if (horasTotales === 0) {
        c1 = generarNormal(MEDIA_VIDA, DESV_VIDA, Math.random());
        c2 = generarNormal(MEDIA_VIDA, DESV_VIDA, Math.random());
        c3 = generarNormal(MEDIA_VIDA, DESV_VIDA, Math.random());
        c4 = generarNormal(MEDIA_VIDA, DESV_VIDA, Math.random());
      } else {
        c1 = c1_des;
        c2 = c2_des;
        c3 = c3_des;
        c4 = c4_des;
      }
      
      // Paso 2: Calcular horas trabajadas
      const horasTrabajadas = Math.min(c1, c2, c3, c4);
      
      // Paso 3: Restar horas trabajadas a componentes
      c1_des = c1 - horasTrabajadas;
      c2_des = c2 - horasTrabajadas;
      c3_des = c3 - horasTrabajadas;
      c4_des = c4 - horasTrabajadas;
      
      // Paso 4: Generar nuevo tiempo de vida si el componente falló
      const componentesFallidos: number[] = [];
      
      if (c1_des === 0) {
        c1_des = generarNormal(MEDIA_VIDA, DESV_VIDA, Math.random());
        componenteRemplazados++;
        componentesFallidos.push(1);
      }
      if (c2_des === 0) {
        c2_des = generarNormal(MEDIA_VIDA, DESV_VIDA, Math.random());
        componenteRemplazados++;
        componentesFallidos.push(2);
      }
      if (c3_des === 0) {
        c3_des = generarNormal(MEDIA_VIDA, DESV_VIDA, Math.random());
        componenteRemplazados++;
        componentesFallidos.push(3);
      }
      if (c4_des === 0) {
        c4_des = generarNormal(MEDIA_VIDA, DESV_VIDA, Math.random());
        componenteRemplazados++;
        componentesFallidos.push(4);
      }
      
      // Paso 5: Calcular horas sin trabajar
      const horasSinTrabajar = (c1 === c2 && c2 === c3 && c3 === c4) ? 2 : 1;
      
      // Actualizar horas totales
      horasTotales += horasSinTrabajar + horasTrabajadas;
      
      // Pasos 6-8: Calcular costos
      const costoComponente = componenteRemplazados * COSTO_COMPONENTE;
      const costoDesconexion = horasSinTrabajar * COSTO_HORA_DESCONEXION;
      const costoTotal = costoComponente + costoDesconexion;
      
      resultados.push({
        iteracion,
        c1: c1.toFixed(0),
        c2: c2.toFixed(0),
        c3: c3.toFixed(0),
        c4: c4.toFixed(0),
        horasTrabajadas: horasTrabajadas.toFixed(0),
        componentesFallidos: componentesFallidos.join(', ') || '-',
        remplazados: componenteRemplazados,
        horasSinTrabajar,
        tiempoVidaNuevos: `${c1_des.toFixed(0)} / ${c2_des.toFixed(0)} / ${c3_des.toFixed(0)} / ${c4_des.toFixed(0)}`,
        costoComponente,
        costoDesconexion,
        costoTotal,
        horasTotales: horasTotales.toFixed(0)
      });
      
      // Resetear componentes remplazados
      componenteRemplazados = 0;
      
      // Paso 10: Verificar si continuar
      if (horasTotales > HORAS_LIMITE) break;
    }
    
    return resultados;
  };

  // Política 2: Reemplazar todos los componentes
  const simularPolitica2 = () => {
    const resultados = [];
    let horasTotales = 0;
    let iteracion = 0;

    while (horasTotales <= HORAS_LIMITE) {
      iteracion++;
      
      // Paso 1: Generar tiempos de vida de componentes (nuevos)
      const c1 = generarNormal(MEDIA_VIDA, DESV_VIDA, Math.random());
      const c2 = generarNormal(MEDIA_VIDA, DESV_VIDA, Math.random());
      const c3 = generarNormal(MEDIA_VIDA, DESV_VIDA, Math.random());
      const c4 = generarNormal(MEDIA_VIDA, DESV_VIDA, Math.random());
      
      // Paso 2: Calcular horas trabajadas
      const horasTrabajadas = Math.min(c1, c2, c3, c4);
      
      // Actualizar horas totales
      horasTotales += 2 + horasTrabajadas;
      
      // Paso 3: Calcular costos
      const costoComponente = NUM_COMPONENTES * COSTO_COMPONENTE;
      const costoDesconexion = 2 * COSTO_HORA_DESCONEXION;
      const costoTotal = costoComponente + costoDesconexion;
      
      resultados.push({
        iteracion,
        c1: c1.toFixed(0),
        c2: c2.toFixed(0),
        c3: c3.toFixed(0),
        c4: c4.toFixed(0),
        horasTrabajadas: horasTrabajadas.toFixed(0),
        remplazados: 4,
        horasSinTrabajar: 2,
        costoComponente,
        costoDesconexion,
        costoTotal,
        horasTotales: horasTotales.toFixed(0)
      });
      
      // Paso 4: Verificar si continuar
      if (horasTotales > HORAS_LIMITE) break;
    }
    
    return resultados;
  };

  const simular = () => {
    const res1 = simularPolitica1();
    const res2 = simularPolitica2();
    
    const costoTotal1 = res1.reduce((sum, r) => sum + r.costoTotal, 0);
    const costoTotal2 = res2.reduce((sum, r) => sum + r.costoTotal, 0);
    
    setSimulacion1(res1);
    setSimulacion2(res2);
    setResumen({
      iteraciones1: res1.length,
      iteraciones2: res2.length,
      costoTotal1,
      costoTotal2,
      mejorPolitica: costoTotal1 < costoTotal2 ? 'Política 1' : 'Política 2',
      ahorro: Math.abs(costoTotal1 - costoTotal2)
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
           <div>
             <h1 className="text-2xl font-bold text-slate-900">Ejercicio 2.7: Políticas de Mantenimiento</h1>
             <p className="text-slate-600 text-sm mt-1">Simulación de reemplazo de componentes electrónicos</p>
           </div>
           <div className="p-4 bg-indigo-50 rounded-lg">
             <Cpu size={32} className="text-indigo-600" />
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-indigo-600"/>
            Descripción del Problema
          </h2>
          
          <div className="prose max-w-none text-sm text-slate-700 mb-6">
            <p>
              Una compañía tiene un equipo con <strong>4 componentes electrónicos idénticos</strong> que fallan 
              frecuentemente, forzando la desconexión del equipo para hacer reposiciones.
            </p>
            <p className="mt-3">
              <strong>Política actual (1):</strong> Reemplazar componentes solo cuando se descomponen.<br/>
              <strong>Política propuesta (2):</strong> Reemplazar los 4 componentes cuando falle cualquiera de ellos.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-700 text-sm">Parámetros del Sistema</h3>
              <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Tiempo de vida de componente:</span>
                  <span className="font-bold">Normal(μ=600h, σ=100h)</span>
                </div>
                <div className="flex justify-between">
                  <span>Número de componentes:</span>
                  <span className="font-bold">4 componentes</span>
                </div>
                <div className="flex justify-between">
                  <span>Tiempo de simulación:</span>
                  <span className="font-bold">20,000 horas</span>
                </div>
              </div>

              <h3 className="font-bold text-slate-700 text-sm mt-4">Costos</h3>
              <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Componente nuevo:</span>
                  <span className="font-bold">$200</span>
                </div>
                <div className="flex justify-between">
                  <span>Desconexión por hora:</span>
                  <span className="font-bold">$100/hora</span>
                </div>
              </div>

              <h3 className="font-bold text-slate-700 text-sm mt-4">Tiempos de Desconexión</h3>
              <div className="space-y-2">
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <p className="font-semibold text-blue-900 text-sm">Política 1:</p>
                  <p className="text-xs text-slate-600">1 hora (reemplazo individual)</p>
                  <p className="text-xs text-slate-600">2 horas si fallan los 4 simultáneamente</p>
                </div>
                <div className="bg-purple-50 p-3 rounded border border-purple-200">
                  <p className="font-semibold text-purple-900 text-sm">Política 2:</p>
                  <p className="text-xs text-slate-600">2 horas (reemplazo de los 4)</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-700 text-sm">Generación de Tiempo de Vida</h3>
              <div className="bg-indigo-50 p-4 rounded border border-indigo-200">
                <p className="text-xs text-slate-600 mb-3">Para generar el tiempo de vida usamos la transformada inversa de la distribución normal:</p>
                <BlockMath math="Tiempo\_vida \rightarrow Normal(\mu=600, \; \sigma=100)" />
                <BlockMath math="Tiempo\_vida = \mu + \sigma \times \Phi^{-1}(R)" />
                <p className="text-xs text-slate-600 mt-3">
                  μ = Media = 600 horas<br/>
                  σ = Desviación estándar = 100 horas<br/>
                  Φ⁻¹(R) = Inversa de distribución normal estándar<br/>
                  R = Número aleatorio [0,1]
                </p>
                <p className="text-xs text-slate-600 mt-3 font-semibold">Reemplazando:</p>
                <BlockMath math="Tiempo\_vida = 600 + 100 \times \Phi^{-1}(R)" />
              </div>
            </div>
          </div>
        </div>

        {/* Pasos de las políticas */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Pasos de Simulación</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Política 1 */}
            <div className="space-y-3">
              <h3 className="font-bold text-blue-700 mb-3 text-sm">POLÍTICA 1: Reemplazo Individual</h3>
              
              <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                <p className="font-bold text-blue-900 text-sm">Paso 1: Calcular tiempo de vida de componentes</p>
                <div className="text-xs text-slate-700 mt-2 font-mono space-y-1">
                  <p><strong>Si (Hora == 0)</strong></p>
                  <div className="ml-4 space-y-1">
                    <p>R1 ← generadorCongruencialMixto()</p>
                    <p>R2 ← generadorCongruencialMixto()</p>
                    <p>R3 ← generadorCongruencialMixto()</p>
                    <p>R4 ← generadorCongruencialMixto()</p>
                    <p>T_vida_C1 = 600 + 100 × Φ⁻¹(R1)</p>
                    <p>T_vida_C2 = 600 + 100 × Φ⁻¹(R2)</p>
                    <p>T_vida_C3 = 600 + 100 × Φ⁻¹(R3)</p>
                    <p>T_vida_C4 = 600 + 100 × Φ⁻¹(R4)</p>
                    <p>Remplazados = 0</p>
                  </div>
                  <p className="text-red-600 font-semibold">Finsi</p>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                <p className="font-bold text-blue-900 text-sm">Paso 2: Calcular horas trabajadas</p>
                <p className="text-xs text-slate-600 mt-1">Horas_trabajadas = <strong>Mínimo</strong>(T_vida_C1, T_vida_C2, T_vida_C3, T_vida_C4)</p>
              </div>

              <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                <p className="font-bold text-blue-900 text-sm">Paso 3: Restar horas trabajadas a componentes</p>
                <div className="text-xs text-slate-600 mt-1 font-mono space-y-1">
                  <p>T_vida_C1 = T_vida_C1 - Horas_trabajadas</p>
                  <p>T_vida_C2 = T_vida_C2 - Horas_trabajadas</p>
                  <p>T_vida_C3 = T_vida_C3 - Horas_trabajadas</p>
                  <p>T_vida_C4 = T_vida_C4 - Horas_trabajadas</p>
                </div>
              </div>

              <div className="p-3 bg-orange-50 rounded border-l-4 border-orange-500">
                <p className="font-bold text-orange-900 text-sm">Paso 4: Generar nuevo tiempo de vida al componente que falló</p>
                <div className="text-xs text-slate-700 mt-2 font-mono space-y-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i}>
                      <p><strong>Si (T_vida_C{i} == 0)</strong></p>
                      <div className="ml-4">
                        <p>R{i} ← generadorCongruencialMixto()</p>
                        <p>T_vida_C{i} = 600 + 100 × Φ⁻¹(R{i})</p>
                        <p>Remplazados = Remplazados + 1</p>
                      </div>
                      <p className="text-red-600 font-semibold">Finsi</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                <p className="font-bold text-green-900 text-sm">Paso 5: Calcular horas sin trabajar</p>
                <div className="text-xs text-slate-700 mt-2 font-mono">
                  <p><strong>Si (Remplazados == 4)</strong></p>
                  <div className="ml-4">
                    <p>Horas_sin_trabajar = 2</p>
                  </div>
                  <p><strong>Sino</strong></p>
                  <div className="ml-4">
                    <p>Horas_sin_trabajar = 1</p>
                  </div>
                  <p className="text-red-600 font-semibold">Finsi</p>
                </div>
              </div>

              <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-500">
                <p className="font-bold text-yellow-900 text-sm">Paso 6: Calcular costos</p>
                <div className="text-xs text-slate-600 mt-1 font-mono space-y-1">
                  <p>Costo_componente = Remplazados × 200</p>
                  <p>Costo_desconexion = Horas_sin_trabajar × 100</p>
                  <p>Costo_total = Costo_componente + Costo_desconexion</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded border-l-4 border-slate-500">
                <p className="font-bold text-slate-900 text-sm">Paso 7: Calcular horas trabajadas</p>
                <p className="text-xs text-slate-600 mt-1 font-mono">Hora = Hora + Horas_trabajadas + Horas_sin_trabajar</p>
              </div>

              <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-500">
                <p className="font-bold text-purple-900 text-sm">Paso 8: Verificamos si la simulacion continua</p>
                <div className="text-xs text-slate-700 mt-2 font-mono">
                  <p><strong>Si (Hora ≥ limite)</strong></p>
                  <div className="ml-4">
                    <p>Termina la simulación</p>
                  </div>
                  <p><strong>Sino</strong></p>
                  <div className="ml-4">
                    <p>Remplazados = 0</p>
                  </div>
                  <p className="text-red-600 font-semibold">Finsi</p>
                  <p className="mt-2">Repetir pasos anteriores</p>
                </div>
              </div>
            </div>

            {/* Política 2 */}
            <div className="space-y-3">
              <h3 className="font-bold text-purple-700 mb-3 text-sm">POLÍTICA 2: Reemplazo Grupal</h3>
              
              <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-500">
                <p className="font-bold text-purple-900 text-sm">Paso 1: Calcular tiempo de vida de componentes</p>
                <div className="text-xs text-slate-700 mt-2 font-mono space-y-1">
                  <p>R1 ← generadorCongruencialMixto()</p>
                  <p>R2 ← generadorCongruencialMixto()</p>
                  <p>R3 ← generadorCongruencialMixto()</p>
                  <p>R4 ← generadorCongruencialMixto()</p>
                  <p>T_vida_C1 = 600 + 100 × Φ⁻¹(R1)</p>
                  <p>T_vida_C2 = 600 + 100 × Φ⁻¹(R2)</p>
                  <p>T_vida_C3 = 600 + 100 × Φ⁻¹(R3)</p>
                  <p>T_vida_C4 = 600 + 100 × Φ⁻¹(R4)</p>
                  <p>Remplazados = 0</p>
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-500">
                <p className="font-bold text-purple-900 text-sm">Paso 2: Calcular horas trabajadas</p>
                <p className="text-xs text-slate-600 mt-1">Horas_trabajadas = <strong>Mínimo</strong>(T_vida_C1, T_vida_C2, T_vida_C3, T_vida_C4)</p>
              </div>

              <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-500">
                <p className="font-bold text-yellow-900 text-sm">Paso 3: Calcular costo de componentes</p>
                <p className="text-xs text-slate-600 mt-1 font-mono">Costo_componente = 4 × 200</p>
              </div>

              <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-500">
                <p className="font-bold text-yellow-900 text-sm">Paso 4: Calcular costo de desconexión</p>
                <p className="text-xs text-slate-600 mt-1 font-mono">Costo_desconexion = 2 × 100</p>
              </div>

              <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-500">
                <p className="font-bold text-yellow-900 text-sm">Paso 5: Calcular costo total</p>
                <p className="text-xs text-slate-600 mt-1 font-mono">Costo_total = Costo_componente + Costo_desconexion</p>
              </div>

              <div className="p-3 bg-slate-50 rounded border-l-4 border-slate-500">
                <p className="font-bold text-slate-900 text-sm">Paso 6: Calcular horas trabajadas</p>
                <p className="text-xs text-slate-600 mt-1 font-mono">Hora = Hora + Horas_trabajadas + 2</p>
              </div>

              <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-500">
                <p className="font-bold text-purple-900 text-sm">Paso 7: Verificamos si la simulacion continua</p>
                <div className="text-xs text-slate-700 mt-2 font-mono">
                  <p><strong>Si (Hora ≥ limite)</strong></p>
                  <div className="ml-4">
                    <p>Termina la simulación</p>
                  </div>
                  <p className="text-red-600 font-semibold mt-1">Finsi</p>
                  <p className="mt-2">Repetir pasos anteriores</p>
                </div>
              </div>

              <div className="p-3 bg-indigo-50 rounded border-l-4 border-indigo-500">
                <p className="font-bold text-indigo-900 text-sm">Resultado Final</p>
                <p className="text-xs text-slate-600 mt-2">Se suman todos los valores de Costo_total de cada política:</p>
                <BlockMath math="Politica\_1 = \sum_{i=1}^{n} Costo\_total_i" />
                <BlockMath math="Politica\_2 = \sum_{i=1}^{n} Costo\_total_i" />
                <p className="text-xs text-slate-600 mt-2">n = Número de filas generadas hasta alcanzar el límite de horas</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={simular}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <RefreshCcw size={20} />
            Simular {HORAS_LIMITE.toLocaleString()} horas
          </button>
        </div>

        {resumen && (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl shadow-lg border-2 border-indigo-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Comparación de Políticas</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-slate-600">Costo Total Política 1</p>
                <p className="text-2xl font-bold text-blue-600">${Math.round(resumen.costoTotal1).toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">{resumen.iteraciones1} reemplazos</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-slate-600">Costo Total Política 2</p>
                <p className="text-2xl font-bold text-purple-600">${Math.round(resumen.costoTotal2).toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">{resumen.iteraciones2} reemplazos</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-slate-600">Política Más Económica</p>
                <p className="text-2xl font-bold text-green-600">{resumen.mejorPolitica}</p>
                <p className="text-xs text-slate-500 mt-1">Mejor opción</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-slate-600">Ahorro</p>
                <p className="text-2xl font-bold text-emerald-600">${Math.round(resumen.ahorro).toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">Diferencia de costos</p>
              </div>
            </div>
          </div>
        )}

        {simulacion1.length > 0 && (
          <>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
                <span className="font-bold text-blue-700 text-sm uppercase tracking-wider">
                  Política 1: Reemplazo Individual ({simulacion1.length} iteraciones)
                </span>
              </div>
              
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-600 border-b sticky top-0">
                    <tr>
                      <th className="px-2 py-2 font-medium">Iter.</th>
                      <th className="px-2 py-2 font-medium">T.Vida C1</th>
                      <th className="px-2 py-2 font-medium">T.Vida C2</th>
                      <th className="px-2 py-2 font-medium">T.Vida C3</th>
                      <th className="px-2 py-2 font-medium">T.Vida C4</th>
                      <th className="px-2 py-2 font-medium">H. Trab.</th>
                      <th className="px-2 py-2 font-medium">Comp. Fallidos</th>
                      <th className="px-2 py-2 font-medium">Remplaz.</th>
                      <th className="px-2 py-2 font-medium">H. Desc.</th>
                      <th className="px-2 py-2 font-medium">T. Vida Nuevos (C1/C2/C3/C4)</th>
                      <th className="px-2 py-2 font-medium">C. Comp.</th>
                      <th className="px-2 py-2 font-medium">C. Desc.</th>
                      <th className="px-2 py-2 font-medium">C. Total</th>
                      <th className="px-2 py-2 font-medium">H. Totales</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {simulacion1.map((row) => (
                      <tr key={row.iteracion} className="hover:bg-slate-50">
                        <td className="px-2 py-2 font-mono">{row.iteracion}</td>
                        <td className="px-2 py-2 font-mono text-blue-600">{row.c1}</td>
                        <td className="px-2 py-2 font-mono text-blue-600">{row.c2}</td>
                        <td className="px-2 py-2 font-mono text-blue-600">{row.c3}</td>
                        <td className="px-2 py-2 font-mono text-blue-600">{row.c4}</td>
                        <td className="px-2 py-2 font-mono text-indigo-600">{row.horasTrabajadas}</td>
                        <td className="px-2 py-2 font-mono text-red-600">{row.componentesFallidos}</td>
                        <td className="px-2 py-2 font-mono text-orange-600">{row.remplazados}</td>
                        <td className="px-2 py-2 font-mono">{row.horasSinTrabajar}</td>
                        <td className="px-2 py-2 font-mono text-xs text-green-600">{row.tiempoVidaNuevos}</td>
                        <td className="px-2 py-2 font-mono">{row.costoComponente}</td>
                        <td className="px-2 py-2 font-mono">{row.costoDesconexion}</td>
                        <td className="px-2 py-2 font-mono font-bold text-purple-700">{row.costoTotal}</td>
                        <td className="px-2 py-2 font-mono font-bold">{row.horasTotales}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-purple-50 px-4 py-3 border-b border-purple-200">
                <span className="font-bold text-purple-700 text-sm uppercase tracking-wider">
                  Política 2: Reemplazo Grupal ({simulacion2.length} iteraciones)
                </span>
              </div>
              
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-600 border-b sticky top-0">
                    <tr>
                      <th className="px-2 py-2 font-medium">Iter.</th>
                      <th className="px-2 py-2 font-medium">T.Vida C1</th>
                      <th className="px-2 py-2 font-medium">T.Vida C2</th>
                      <th className="px-2 py-2 font-medium">T.Vida C3</th>
                      <th className="px-2 py-2 font-medium">T.Vida C4</th>
                      <th className="px-2 py-2 font-medium">H. Trab.</th>
                      <th className="px-2 py-2 font-medium">Remplaz.</th>
                      <th className="px-2 py-2 font-medium">H. Desc.</th>
                      <th className="px-2 py-2 font-medium">C. Comp.</th>
                      <th className="px-2 py-2 font-medium">C. Desc.</th>
                      <th className="px-2 py-2 font-medium">C. Total</th>
                      <th className="px-2 py-2 font-medium">H. Totales</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {simulacion2.map((row) => (
                      <tr key={row.iteracion} className="hover:bg-slate-50">
                        <td className="px-2 py-2 font-mono">{row.iteracion}</td>
                        <td className="px-2 py-2 font-mono text-blue-600">{row.c1}</td>
                        <td className="px-2 py-2 font-mono text-blue-600">{row.c2}</td>
                        <td className="px-2 py-2 font-mono text-blue-600">{row.c3}</td>
                        <td className="px-2 py-2 font-mono text-blue-600">{row.c4}</td>
                        <td className="px-2 py-2 font-mono text-indigo-600">{row.horasTrabajadas}</td>
                        <td className="px-2 py-2 font-mono text-orange-600">{row.remplazados}</td>
                        <td className="px-2 py-2 font-mono">{row.horasSinTrabajar}</td>
                        <td className="px-2 py-2 font-mono">{row.costoComponente}</td>
                        <td className="px-2 py-2 font-mono">{row.costoDesconexion}</td>
                        <td className="px-2 py-2 font-mono font-bold text-purple-700">{row.costoTotal}</td>
                        <td className="px-2 py-2 font-mono font-bold">{row.horasTotales}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
