import { useState } from 'react';
import {RefreshCcw, BookOpen, Calculator } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export default function Ejercicio1Trapezoidal() {
  const [metodo, setMetodo] = useState<'composicion' | 'inversa'>('composicion');
  const [simulacion, setSimulacion] = useState<any[]>([]);
  
  // --- Parámetros del Ejercicio (Configurables) ---
  const a = 10; // Fin de la subida
  const b = 20; // Fin de la meseta
  const c = 30; // Fin de la bajada

  // --- Cálculos Geométricos ---
  // Altura h para que el área total sea 1
  // Area = h * (BaseMayor + BaseMenor) / 2 = h * (c + (b-a)) / 2 = 1
  const h = 2 / (c + b - a);
  
  // Áreas (Pesos de probabilidad para Composición)
  const A1 = (a * h) / 2;       // Triángulo 1
  const A2 = (b - a) * h;       // Rectángulo
  const A3 = (c - b) * h / 2;   // Triángulo 2

  // Generador simple
  const generarAleatorio = () => Math.random();

  // --- Lógica: Método de Composición (Divide y Vencerás) ---
  const simularComposicion = () => {
    const resultados = [];
    for (let i = 1; i <= 10; i++) {
      const R1 = generarAleatorio(); // Selector de área
      const R2 = generarAleatorio(); // Generador de valor
      let x = 0;
      let pasoDetalle = "";

      if (R1 < A1) {
        // Cae en Triángulo 1 (Subida): f1(x) = 2x/a^2
        // Inversa local: x = a * sqrt(R2)
        x = a * Math.sqrt(R2);
        pasoDetalle = `R1 < ${A1.toFixed(2)} → Subfunción 1 (Triángulo)`;
      } else if (R1 < A1 + A2) {
        // Cae en Rectángulo (Meseta): f2(x) = 1/(b-a)
        // Inversa local: x = a + (b-a)R2
        x = a + (b - a) * R2;
        pasoDetalle = `R1 < ${(A1+A2).toFixed(2)} → Subfunción 2 (Rectángulo)`;
      } else {
        // Cae en Triángulo 2 (Bajada): f3(x) = ...
        // Inversa local: x = c - (c-b) * sqrt(1-R2)
        // Nota: (1-R2) es estadísticamente igual a R2, pero matemáticamente exacto es 1-R.
        x = c - (c - b) * Math.sqrt(1 - R2);
        pasoDetalle = `R1 > ${(A1+A2).toFixed(2)} → Subfunción 3 (Triángulo)`;
      }
      resultados.push({ i, R1, R2, x, detalle: pasoDetalle });
    }
    setSimulacion(resultados);
  };

  // --- Lógica: Transformada Inversa Global (Integral completa) ---
  const simularInversa = () => {
    const resultados = [];
    const K = c + b - a; // Constante auxiliar del denominador
    
    for (let i = 1; i <= 10; i++) {
      const R = generarAleatorio();
      let x = 0;
      let pasoDetalle = "";

      // Usamos los límites acumulados de F(x) que coinciden con las áreas A1, A1+A2
      if (R < A1) {
        // Tramo 1: F(x) = x^2 / (a*K) -> Despejando x
        x = Math.sqrt(R * a * K);
        pasoDetalle = `0 ≤ R < ${A1.toFixed(2)} (Tramo 1)`;
      } else if (R < A1 + A2) {
        // Tramo 2: F(x) lineal
        x = a + (R - A1) * (K / 2);
        pasoDetalle = `${A1.toFixed(2)} ≤ R < ${(A1+A2).toFixed(2)} (Tramo 2)`;
      } else {
        // Tramo 3: F(x) cuadrática inversa
        // x = c - sqrt((1-R)(c-b)K)
        x = c - Math.sqrt((1 - R) * (c - b) * K);
        pasoDetalle = `R ≥ ${(A1+A2).toFixed(2)} (Tramo 3)`;
      }
      resultados.push({ i, R1: R, R2: "-", x, detalle: pasoDetalle });
    }
    setSimulacion(resultados);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* --- Header con Botón de Regreso --- */}
        <div className="flex items-center justify-between">
           <h1 className="text-2xl font-bold text-slate-900">Ejercicio 1: Distribución Trapezoidal</h1>
           <div className="text-sm text-slate-500 text-right">
             <span className="block font-bold">Parámetros:</span>
             a={a}, b={b}, c={c}
           </div>
        </div>

        {/* --- VISUALIZACIÓN GEOMÉTRICA (Siempre visible) --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-blue-600"/>
            Geometría de la Función f(x)
          </h2>
          
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* SVG Trapezoide Exacto */}
            <div className="w-full max-w-lg bg-slate-50 border border-slate-200 rounded-lg p-4 relative">
              <svg viewBox="0 0 400 180" className="w-full h-auto">
                {/* Ejes */}
                <line x1="20" y1="160" x2="380" y2="160" stroke="#64748b" strokeWidth="2" /> {/* Eje X */}
                <line x1="20" y1="160" x2="20" y2="20" stroke="#64748b" strokeWidth="2" />   {/* Eje Y */}
                
                {/* Áreas coloreadas */}
                {/* A1: Triángulo subida */}
                <path d="M 20 160 L 100 40 L 100 160 Z" fill="rgba(59, 130, 246, 0.2)" stroke="none" />
                {/* A2: Rectángulo */}
                <path d="M 100 160 L 100 40 L 220 40 L 220 160 Z" fill="rgba(34, 197, 94, 0.2)" stroke="none" />
                {/* A3: Triángulo bajada */}
                <path d="M 220 160 L 220 40 L 340 160 Z" fill="rgba(239, 68, 68, 0.2)" stroke="none" />

                {/* Línea de la función f(x) */}
                <path d="M 20 160 L 100 40 L 220 40 L 340 160" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                {/* Etiquetas */}
                <text x="20" y="175" className="text-xs font-bold fill-slate-600" textAnchor="middle">0</text>
                <text x="100" y="175" className="text-xs font-bold fill-slate-600" textAnchor="middle">a</text>
                <text x="220" y="175" className="text-xs font-bold fill-slate-600" textAnchor="middle">b</text>
                <text x="340" y="175" className="text-xs font-bold fill-slate-600" textAnchor="middle">c</text>

                {/* Nombres de subfunciones */}
                <text x="60" y="120" className="text-sm font-bold fill-blue-700" textAnchor="middle">f₁(x)</text>
                <text x="160" y="100" className="text-sm font-bold fill-green-700" textAnchor="middle">f₂(x)</text>
                <text x="280" y="120" className="text-sm font-bold fill-red-700" textAnchor="middle">f₃(x)</text>
              </svg>
            </div>

            {/* Datos de Áreas */}
            <div className="flex-1 space-y-4 text-sm">
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <h3 className="font-bold text-blue-900">A₁ (Probabilidad Subida)</h3>
                <p>Base: <InlineMath math="a" />, Altura: <InlineMath math="h" /></p>
                <p className="font-mono mt-1">Area = {A1.toFixed(4)} ({(A1*100).toFixed(1)}%)</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <h3 className="font-bold text-green-900">A₂ (Probabilidad Meseta)</h3>
                <p>Base: <InlineMath math="b-a" />, Altura: <InlineMath math="h" /></p>
                <p className="font-mono mt-1">Area = {A2.toFixed(4)} ({(A2*100).toFixed(1)}%)</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                <h3 className="font-bold text-red-900">A₃ (Probabilidad Bajada)</h3>
                <p>Base: <InlineMath math="c-b" />, Altura: <InlineMath math="h" /></p>
                <p className="font-mono mt-1">Area = {A3.toFixed(4)} ({(A3*100).toFixed(1)}%)</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- SELECTOR DE MÉTODO --- */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setMetodo('composicion')}
            className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${
              metodo === 'composicion' 
                ? 'border-blue-600 text-blue-700 bg-blue-50' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            Método 1: Composición
          </button>
          <button
            onClick={() => setMetodo('inversa')}
            className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${
              metodo === 'inversa' 
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            Método 2: Transformada Inversa
          </button>
        </div>

        {/* --- CONTENIDO DEL MÉTODO SELECCIONADO --- */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* LADO IZQUIERDO: EXPLICACIÓN PASO A PASO */}
          <div className="space-y-6">
            {metodo === 'composicion' ? (
              // --- PASOS COMPOSICIÓN ---
              <>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-3 border-b pb-2">Paso 1: Dividir en Subfunciones</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex gap-2">
                      <span className="text-blue-600 font-bold">f₁(x):</span>
                      <span>Triángulo ascendente en [0, a]. <br/><InlineMath math="f_1(x) = \frac{2x}{a^2}" /></span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-green-600 font-bold">f₂(x):</span>
                      <span>Uniforme en [a, b]. <br/><InlineMath math="f_2(x) = \frac{1}{b-a}" /></span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-red-600 font-bold">f₃(x):</span>
                      <span>Triángulo descendente en [b, c]. <br/><InlineMath math="f_3(x) = \frac{2(c-x)}{(c-b)^2}" /></span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-3 border-b pb-2">Paso 2: Generar Aleatorios</h3>
                  <p className="text-sm text-slate-600 mb-2">
                    Generamos <strong>dos</strong> números aleatorios uniformes <InlineMath math="U(0,1)" />:
                  </p>
                  <ul className="text-sm space-y-1 list-disc list-inside text-slate-700">
                    <li><InlineMath math="R_1" />: Para seleccionar la subfunción (usando las Áreas).</li>
                    <li><InlineMath math="R_2" />: Para aplicar la inversa dentro de la subfunción.</li>
                  </ul>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-3 border-b pb-2">Paso 3: Selección y Cálculo</h3>
                  <div className="text-sm space-y-4">
                    <div className="bg-blue-50 p-3 rounded border border-blue-100">
                      <p className="font-bold text-blue-800 mb-1">Si <InlineMath math={`R_1 < ${A1.toFixed(2)}`} /> (Área 1)</p>
                      <p>Usamos inversa de f₁:</p>
                      <BlockMath math="x = a\sqrt{R_2}" />
                    </div>
                    <div className="bg-green-50 p-3 rounded border border-green-100">
                      <p className="font-bold text-green-800 mb-1">Si <InlineMath math={`${A1.toFixed(2)} \\le R_1 < ${(A1+A2).toFixed(2)}`} /> (Área 2)</p>
                      <p>Usamos inversa de f₂:</p>
                      <BlockMath math="x = a + (b-a)R_2" />
                    </div>
                    <div className="bg-red-50 p-3 rounded border border-red-100">
                      <p className="font-bold text-red-800 mb-1">Si <InlineMath math={`R_1 \\ge ${(A1+A2).toFixed(2)}`} /> (Área 3)</p>
                      <p>Usamos inversa de f₃:</p>
                      <BlockMath math="x = c - (c-b)\sqrt{1-R_2}" />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // --- PASOS TRANSFORMADA INVERSA GLOBAL ---
              <>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-3 border-b pb-2">Paso 1: Definir F(x) Acumulada</h3>
                  <p className="text-sm text-slate-600 mb-2">
                    Integramos <InlineMath math="f(x)" /> desde <InlineMath math="-\infty" /> hasta <InlineMath math="x" />. Obtenemos una función por tramos:
                  </p>
                  <div className="text-xs overflow-x-auto">
                    <BlockMath math="F(x) = \begin{cases} \frac{x^2}{a(c+b-a)} & 0 \le x < a \\ A_1 + \frac{2(x-a)}{c+b-a} & a \le x < b \\ 1 - \frac{(c-x)^2}{(c-b)(c+b-a)} & b \le x \le c \end{cases}" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-3 border-b pb-2">Paso 2: Generar Aleatorio</h3>
                  <p className="text-sm text-slate-600">
                    Generamos <strong>un solo</strong> número aleatorio <InlineMath math="R \sim U(0,1)" />.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-3 border-b pb-2">Paso 3: Despejar x = F⁻¹(R)</h3>
                  <p className="text-sm text-slate-600 mb-2">
                    Dependiendo del valor de R, invertimos el tramo correspondiente:
                  </p>
                  <div className="text-sm space-y-4">
                    <div className="bg-emerald-50 p-3 rounded border border-emerald-100">
                      <p className="font-bold text-emerald-800">Si <InlineMath math={`R < ${A1.toFixed(2)}`} /></p>
                      <BlockMath math="x = \sqrt{R \cdot a(c+b-a)}" />
                    </div>
                    <div className="bg-emerald-50 p-3 rounded border border-emerald-100">
                      <p className="font-bold text-emerald-800">Si <InlineMath math={`${A1.toFixed(2)} \\le R < ${(A1+A2).toFixed(2)}`} /></p>
                      <BlockMath math="x = a + (R - A_1)\frac{c+b-a}{2}" />
                    </div>
                    <div className="bg-emerald-50 p-3 rounded border border-emerald-100">
                      <p className="font-bold text-emerald-800">Si <InlineMath math={`R \\ge ${(A1+A2).toFixed(2)}`} /></p>
                      <BlockMath math="x = c - \sqrt{(1-R)(c-b)(c+b-a)}" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* LADO DERECHO: SIMULADOR */}
          <div className="flex flex-col gap-4">
            <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Simulador</h3>
                <Calculator size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-400 text-sm mb-6">
                Genera 10 variables aleatorias usando el método seleccionado ({metodo === 'composicion' ? '2 números aleatorios' : '1 número aleatorio'}).
              </p>
              
              <button 
                onClick={metodo === 'composicion' ? simularComposicion : simularInversa}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all flex justify-center items-center gap-2 shadow-md active:scale-95"
              >
                <RefreshCcw size={20} />
                Generar 10 Iteraciones
              </button>
            </div>

            {/* TABLA DE RESULTADOS */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex-1">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">Tabla de Resultados</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 font-medium text-xs">#</th>
                      <th className="px-4 py-3 font-medium text-xs">
                        {metodo === 'composicion' ? 'R₁ (Selector)' : 'R (Acumulado)'}
                      </th>
                      {metodo === 'composicion' && (
                        <th className="px-4 py-3 font-medium text-xs">R₂ (Valor)</th>
                      )}
                      <th className="px-4 py-3 font-medium text-xs">Lógica Aplicada</th>
                      <th className="px-4 py-3 font-bold text-slate-800 text-xs text-right">X Generado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {simulacion.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400 italic">
                          Presiona el botón para simular
                        </td>
                      </tr>
                    ) : (
                      simulacion.map((row) => (
                        <tr key={row.i} className="hover:bg-slate-50/50">
                          <td className="px-4 py-2 text-slate-400 font-mono text-xs">{row.i}</td>
                          <td className="px-4 py-2 font-mono text-blue-600 font-bold">{row.R1.toFixed(4)}</td>
                          {metodo === 'composicion' && (
                            <td className="px-4 py-2 font-mono text-slate-500">{row.R2.toFixed(4)}</td>
                          )}
                          <td className="px-4 py-2 text-xs text-slate-500 truncate max-w-37.5">
                            {row.detalle}
                          </td>
                          <td className="px-4 py-2 text-right font-bold text-slate-800 font-mono bg-slate-50/30">
                            {row.x.toFixed(4)}
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