import { useState } from 'react';
import { RefreshCcw, BookOpen, Calculator } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export default function Ejercicio1Rechazo() {
  const [simulacion, setSimulacion] = useState<any[]>([]);
  
 
  const generarAleatorio = () => Math.random();

  // Función f(x) por partes
  const fx = (x: number): number => {
    if (x >= 0 && x <= 1) return 3/4;
    if (x > 1 && x <= 2) return 1/4;
    return 0;
  };

  // Constante c
  const c = 4/3;
  

  // Simulación del método de rechazo
  const simularRechazo = () => {
    const resultados = [];
    let intentos = 0;
    let i = 1;

    while (i <= 10 && intentos < 1000) {
      intentos++;
      const R1 = generarAleatorio();
      const R2 = generarAleatorio();
      const X = 2 * R1; 
      const fX = fx(X);
      
      // Criterio de aceptación
      const criterio = R2 <= (fX * c);
      
      if (criterio) {
        resultados.push({ 
          i, 
          R1, 
          R2, 
          X, 
          fX,
          criterioValor: (fX * c).toFixed(4),
          aceptado: true,
          region: X <= 1 ? '1ra parte' : '2da parte'
        });
        i++;
      }
    }
    setSimulacion(resultados);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto space-y-8">

     
        <div className="flex items-center justify-between">
           <h1 className="text-2xl font-bold text-slate-900">Ejercicio 1.3: Método de Rechazo</h1>
           <div className="text-sm text-slate-500 text-right">
             <span className="block font-bold">Parámetros:</span>
             f(x) = 3/4 (0≤x≤1), 1/4 (1≤x≤2)
           </div>
        </div>

      
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-blue-600"/>
            Geometría de la Función f(x)
          </h2>
          
          <div className="flex flex-col md:flex-row items-center gap-8">
           
            <div className="w-full max-w-lg bg-slate-50 border border-slate-200 rounded-lg p-4">
              <svg viewBox="0 0 400 220" className="w-full h-auto">
               
                <line x1="40" y1="180" x2="380" y2="180" stroke="#64748b" strokeWidth="2" />
                <line x1="40" y1="180" x2="40" y2="20" stroke="#64748b" strokeWidth="2" />
                
               
                <line x1="40" y1="60" x2="210" y2="60" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
               
                <line x1="210" y1="150" x2="380" y2="150" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
              
                <line x1="210" y1="60" x2="210" y2="150" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
                
                
                <text x="40" y="200" className="text-xs font-bold fill-slate-600" textAnchor="middle">0</text>
                <text x="210" y="200" className="text-xs font-bold fill-slate-600" textAnchor="middle">1</text>
                <text x="380" y="200" className="text-xs font-bold fill-slate-600" textAnchor="middle">2</text>
                
               
                <text x="125" y="45" className="text-sm font-bold fill-blue-700">f(x) = 3/4</text>
                <text x="295" y="135" className="text-sm font-bold fill-red-700">f(x) = 1/4</text>
                
              
                <text x="25" y="65" className="text-xs font-bold fill-slate-600" textAnchor="end">3/4</text>
                <text x="25" y="155" className="text-xs font-bold fill-slate-600" textAnchor="end">1/4</text>
              </svg>
            </div>

            
            <div className="flex-1 space-y-4 text-sm">
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <h3 className="font-bold text-blue-900 mb-2">Primera parte (0 ≤ x ≤ 1)</h3>
                <BlockMath math="f(x) = \frac{3}{4}" />
              </div>
              <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                <h3 className="font-bold text-red-900 mb-2">Segunda parte (1 ≤ x ≤ 2)</h3>
                <BlockMath math="f(x) = \frac{1}{4}" />
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border-l-4 border-slate-500">
                <h3 className="font-bold text-slate-900 mb-2">Constante envolvente</h3>
                <BlockMath math="c = \frac{1}{f_{max}(x)} = \frac{1}{\frac{3}{4}} = \frac{4}{3}" />
              </div>
            </div>
          </div>
        </div>

        
        <div className="grid lg:grid-cols-2 gap-8">
          
          
          <div className="space-y-6">
            
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-3 border-b pb-2">
                Paso 1: generar R1 y R2 números aleatorios
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-slate-600">Generamos dos números aleatorios uniformes en <InlineMath math="U(0,1)" />:</p>
                <div className="bg-slate-50 p-3 rounded border border-slate-200 font-mono text-xs">
                  <div>R1 ← generadorCongruencialMixto()</div>
                  <div>R2 ← generadorCongruencialMixto()</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-3 border-b pb-2">
                Paso 2: Determinar X como variable uniforme en el intervalo [a,b]
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-slate-600">Intervalo: <InlineMath math="[a,b] = [0,2]" /></p>
                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                  <BlockMath math="X = a + (b-a) \cdot R1" />
                  <BlockMath math="X = 0 + (2-0) \cdot R1 = 2R1" />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-3 border-b pb-2">
                Paso 3: Definir f(x) en términos de x uniforme
              </h3>
              <div className="space-y-3 text-sm">
                <p className="text-slate-600">Evaluamos <InlineMath math="f(X_{R1})" />:</p>
                <div className="bg-blue-50 p-3 rounded border border-blue-100">
                  <p className="font-bold text-blue-800 mb-1">1ra parte</p>
                  <BlockMath math="f(x = 2R1) = \frac{3}{4}; \quad 0 \le R1 \le \frac{1}{2}" />
                </div>
                <div className="bg-red-50 p-3 rounded border border-red-100">
                  <p className="font-bold text-red-800 mb-1">2da parte</p>
                  <BlockMath math="f(x = 2R1) = \frac{1}{4}; \quad \frac{1}{2} \le R1 \le 1" />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-3 border-b pb-2">
                Paso 4: Establecer la siguiente desigualdad
              </h3>
              <div className="space-y-3 text-sm">
                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                  <BlockMath math="R2 \le f(X_{R1}) \cdot c" />
                  <BlockMath math="c = \frac{1}{f_{max}(x)} = \frac{1}{\frac{3}{4}} = \frac{4}{3}" />
                </div>
                <div className="bg-blue-50 p-3 rounded border border-blue-100">
                  <p className="font-bold text-blue-800 mb-1">1ra parte</p>
                  <BlockMath math="R2 \le \frac{3}{4} \cdot \frac{4}{3} = 1" />
                </div>
                <div className="bg-red-50 p-3 rounded border border-red-100">
                  <p className="font-bold text-red-800 mb-1">2da parte</p>
                  <BlockMath math="R2 \le \frac{1}{4} \cdot \frac{4}{3} = \frac{1}{3}" />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-3 border-b pb-2">
                Paso 5: Si la relación se cumple se acepta el valor de x caso contrario se rechaza. Repita los pasos anteriores cuantas veces considere necesario.
              </h3>
            </div>

          </div>

          
          <div className="flex flex-col gap-4">
            <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Simulador</h3>
                <Calculator size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-400 text-sm mb-6">
                Genera 10 variables aleatorias usando el método de rechazo. Solo se muestran los valores aceptados.
              </p>
              
              <button 
                onClick={simularRechazo}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all flex justify-center items-center gap-2 shadow-md active:scale-95"
              >
                <RefreshCcw size={20} />
                Generar 10 Iteraciones
              </button>
            </div>

            
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex-1">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">Valores Aceptados</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-3 py-3 font-medium text-xs">#</th>
                      <th className="px-3 py-3 font-medium text-xs">R₁</th>
                      <th className="px-3 py-3 font-medium text-xs">R₂</th>
                      <th className="px-3 py-3 font-medium text-xs">X = 2R₁</th>
                      <th className="px-3 py-3 font-medium text-xs">f(X)</th>
                      <th className="px-3 py-3 font-medium text-xs">f(X)·c</th>
                      <th className="px-3 py-3 font-medium text-xs">Región</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {simulacion.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                          Presiona el botón para simular
                        </td>
                      </tr>
                    ) : (
                      simulacion.map((row) => (
                        <tr key={row.i} className="hover:bg-slate-50/50">
                          <td className="px-3 py-2 text-slate-400 font-mono text-xs">{row.i}</td>
                          <td className="px-3 py-2 font-mono text-xs">{row.R1.toFixed(4)}</td>
                          <td className="px-3 py-2 font-mono text-xs">{row.R2.toFixed(4)}</td>
                          <td className="px-3 py-2 font-mono text-blue-600 font-bold text-xs">{row.X.toFixed(4)}</td>
                          <td className="px-3 py-2 font-mono text-xs">{row.fX.toFixed(4)}</td>
                          <td className="px-3 py-2 font-mono text-xs">{row.criterioValor}</td>
                          <td className="px-3 py-2 text-xs">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              row.region === '1ra parte' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {row.region}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
