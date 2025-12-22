import { useState } from 'react';
import { RefreshCcw, BookOpen, Calculator, CheckCircle, XCircle } from 'lucide-react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export default function Ejercicio26Interferencia() {
  const [simulacion, setSimulacion] = useState<any[]>([]);
  const [resumenFinal, setResumenFinal] = useState<any>(null);
  const [numSimulaciones] = useState(20);
  
  // Parámetros de las distribuciones normales
  const MU_X1 = 1.5;
  const SIGMA_X1 = Math.sqrt(0.0016); // σ = 0.04
  const MU_X2 = 1.48;
  const SIGMA_X2 = Math.sqrt(0.0009); // σ = 0.03;

  // Función inversa del error
  const erfInv = (x: number): number => {
    const a = 0.147;
    const sgn = x < 0 ? -1 : 1;
    const absX = Math.abs(x);
    
    const ln1MinusX2 = Math.log(1 - absX * absX);
    const term1 = 2 / (Math.PI * a) + ln1MinusX2 / 2;
    const term2 = ln1MinusX2 / a;
    
    return sgn * Math.sqrt(Math.sqrt(term1 * term1 - term2) - term1);
  };

  // Función cuantil de la distribución normal estándar
  const normPPF = (p: number): number => {
    return Math.sqrt(2) * erfInv(2 * p - 1);
  };

  // Generar variable normal
  const generarNormal = (media: number, desviacion: number, r: number): number => {
    const z = normPPF(r);
    return media + desviacion * z;
  };

  // Simulación
  const simularInterferencia = () => {
    const resultados = [];
    let numInterferencias = 0;

    for (let i = 1; i <= numSimulaciones; i++) {
      // Paso 1: Generar R1
      const R1 = Math.random();
      
      // Paso 2: Calcular X1 usando transformada inversa
      const Z1 = normPPF(R1);
      const X1 = generarNormal(MU_X1, SIGMA_X1, R1);
      
      // Paso 3: Generar R2
      const R2 = Math.random();
      
      // Paso 4: Calcular X2 usando transformada inversa
      const Z2 = normPPF(R2);
      const X2 = generarNormal(MU_X2, SIGMA_X2, R2);
      
      // Paso 5: Verificar interferencia (X1 <= X2)
      const hayInterferencia = X1 <= X2;
      const interferencia = hayInterferencia ? 'Hay interferencia' : 'No hay interferencia';
      
      if (hayInterferencia) {
        numInterferencias++;
      }
      
      // Guardamos todas las simulaciones
      resultados.push({
        simulacion: i,
        R1: R1.toFixed(4),
        Z1: Z1.toFixed(4),
        X1: X1.toFixed(4),
        R2: R2.toFixed(4),
        Z2: Z2.toFixed(4),
        X2: X2.toFixed(4),
        interferencia: interferencia,
        hayInterferencia
      });
    }

    const probabilidadInterferencia = (numInterferencias / numSimulaciones) * 100;
    
    setSimulacion(resultados);
    setResumenFinal({
      totalSimulaciones: numSimulaciones,
      numInterferencias,
      probabilidadInterferencia
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">
        
       
        <div className="flex items-center justify-between">
           <div>
             <h1 className="text-2xl font-bold text-slate-900">Ejercicio 2.5: Interferencia Flecha-Cojinete</h1>
             <p className="text-slate-600 text-sm mt-1">Simulación de Monte Carlo para control de calidad en ensambles</p>
           </div>
           <div className="p-4 bg-blue-50 rounded-lg">
             <Calculator size={32} className="text-blue-600" />
           </div>
        </div>

       
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-blue-600"/>
            Datos del Problema
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Parámetros de las distribuciones */}
            <div className="space-y-3 text-sm">
              <h3 className="font-bold text-slate-700 mb-3">Distribuciones Normales</h3>
              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-2">
                <div>
                  <p className="font-semibold text-blue-700 mb-1">X₁ (Diámetro flecha):</p>
                  <BlockMath math="X_1 \sim Normal(\mu_1 = 1.5, \sigma_1^2 = 0.0016)" />
                  <p className="text-xs text-slate-600 mt-1">σ₁ = √0.0016 = 0.04</p>
                </div>
                <div className="border-t pt-2">
                  <p className="font-semibold text-purple-700 mb-1">X₂ (Diámetro cojinete):</p>
                  <BlockMath math="X_2 \sim Normal(\mu_2 = 1.48, \sigma_2^2 = 0.0009)" />
                  <p className="text-xs text-slate-600 mt-1">σ₂ = √0.0009 = 0.03</p>
                </div>
              </div>
            </div>

            {/* Condición de Interferencia */}
            <div className="space-y-3 text-sm">
              <h3 className="font-bold text-slate-700 mb-3">Condición de Interferencia</h3>
              <div className="bg-red-50 p-4 rounded border-2 border-red-200">
                <p className="font-bold text-red-900 mb-2">Hay interferencia si:</p>
                <BlockMath math="X_1 \leq X_2" />
                <p className="text-xs text-slate-600 mt-2 italic">
                  Es decir, cuando el diámetro de la flecha es menor o igual al diámetro del cojinete interno.
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <p className="font-semibold mb-1">Número de simulaciones:</p>
                <p className="text-2xl font-bold text-slate-800">{numSimulaciones.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- PASOS DEL MÉTODO --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Pasos de la Simulación</h2>
          
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                <p className="font-bold text-blue-900">Paso 1: Generar R1</p>
                <p className="text-xs text-slate-600 mt-1">R1 ← generadorCongruencialMixto()</p>
              </div>
              
              <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                <p className="font-bold text-blue-900">Paso 2: Generamos el tamaño de X1:</p>
                <BlockMath math="X_1 = \mu_1 + \sigma_1 \cdot \Phi^{-1}(R1)" />
                <BlockMath math="X_1 = 1.5 + 0.04 \cdot \Phi^{-1}(R1)" />
              </div>
              
              <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-500">
                <p className="font-bold text-purple-900">Paso 3: Generar R2</p>
                <p className="text-xs text-slate-600 mt-1">R2 ← generadorCongruencialMixto()</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-500">
                <p className="font-bold text-purple-900">Paso 4: Generamos el tamaño de X2</p>
                <BlockMath math="X_2 = \mu_2 + \sigma_2 \cdot \Phi^{-1}(R2)" />
                 <BlockMath math="X_2 = 1.48 + 0.03 \cdot \Phi^{-1}(R2)" />
              </div>
              
              <div className="p-3 bg-red-50 rounded border-l-4 border-red-500">
                <p className="font-bold text-red-900">Paso 5: Verificar Interferencia</p>
                <p className="text-xs text-slate-600 mt-1">
                  Si X1 {'≤'} X2 → "Hay interferencia"<br/>
                  Sino → "No hay interferencia"
                </p>
              </div>
              
              <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                <p className="font-bold text-green-900">Paso 6: Repetimos los pasos anteriores igual a la cantidad de veces que se desee simular</p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border-2 border-orange-200">
            <p className="font-bold text-orange-900 mb-2">Resultado Final:</p>
            <BlockMath math="P(interferencia) = \frac{N_{interferencias}}{n} \times 100\%" />
          </div>
        </div>

        {/* --- BOTÓN SIMULAR --- */}
        <div className="flex justify-center">
          <button
            onClick={simularInterferencia}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <RefreshCcw size={20} />
            Simular {numSimulaciones} Iteraciones
          </button>
        </div>

        {resumenFinal && (
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl shadow-lg border-2 border-purple-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Resultado Final</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-slate-600">Total de Simulaciones</p>
                <p className="text-2xl font-bold text-blue-600">{resumenFinal.totalSimulaciones.toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-slate-600">Número de Interferencias</p>
                <p className="text-2xl font-bold text-red-600">{resumenFinal.numInterferencias.toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-slate-600">Probabilidad de Interferencia</p>
                <p className="text-3xl font-bold text-purple-600">{resumenFinal.probabilidadInterferencia.toFixed(2)}%</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-white rounded-lg">
              <BlockMath math={`P = \\frac{${resumenFinal.numInterferencias}}{${resumenFinal.totalSimulaciones}} \\times 100 = ${resumenFinal.probabilidadInterferencia.toFixed(2)}\\%`} />
            </div>
          </div>
        )}

        
        {simulacion.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
              <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                Tabla de Simulación
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 border-b">
                  <tr>
                    <th className="px-3 py-2 font-medium">#</th>
                    <th className="px-3 py-2 font-medium">R₁</th>
                    <th className="px-3 py-2 font-medium">Φ⁻¹(R₁)</th>
                    <th className="px-3 py-2 font-medium">X₁</th>
                    <th className="px-3 py-2 font-medium">R₂</th>
                    <th className="px-3 py-2 font-medium">Φ⁻¹(R₂)</th>
                    <th className="px-3 py-2 font-medium">X₂</th>
                    <th className="px-3 py-2 font-medium">Interferencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {simulacion.map((row) => (
                    <tr key={row.simulacion} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono">{row.simulacion}</td>
                      <td className="px-3 py-2 font-mono text-blue-600">{row.R1}</td>
                      <td className="px-3 py-2 font-mono text-blue-500">{row.Z1}</td>
                      <td className="px-3 py-2 font-mono font-bold text-blue-700">{row.X1}</td>
                      <td className="px-3 py-2 font-mono text-purple-600">{row.R2}</td>
                      <td className="px-3 py-2 font-mono text-purple-500">{row.Z2}</td>
                      <td className="px-3 py-2 font-mono font-bold text-purple-700">{row.X2}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          {row.hayInterferencia ? (
                            <>
                              <XCircle size={16} className="text-red-600" />
                              <span className="font-semibold text-red-600">{row.interferencia}</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle size={16} className="text-green-600" />
                              <span className="font-semibold text-green-600">{row.interferencia}</span>
                            </>
                          )}
                        </div>
                      </td>
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
