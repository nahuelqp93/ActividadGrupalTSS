import { useState, useEffect, useRef } from 'react';
import { evaluate } from 'mathjs';
import type { SamplePoint } from '../../../core/types/Sample';
import SampleTable from '../../../components/common/SampleTable';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface ComponenteComposicion {
  area: number;        // Ai (peso)
  ecuacion: string;    // fi(x)
  limInf: number;      // límite inferior
  limSup: number;      // límite superior
  cdf: string;         // Fi(x) - CDF
  cdfInversa: string;  // Fi^-1(R) - Inversa
}

export default function MetodoComposicion() {
  // Ejemplo del documento: Distribución triangular dividida en 2 partes
  const [a, setA] = useState(190);
  const [b, setB] = useState(210);
  const [c, setC] = useState(230);
  
  const [componentes, setComponentes] = useState<ComponenteComposicion[]>([]);
  const [numSimulaciones, setNumSimulaciones] = useState('10');
  const [muestras, setMuestras] = useState<SamplePoint[]>([]);
  const [mostrarGeneracion, setMostrarGeneracion] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // PASO 1 y 2: Calcular áreas y subfunciones
  useEffect(() => {
    calcularComponentes();
  }, [a, b, c]);

  useEffect(() => {
    if (componentes.length > 0) {
      dibujarGraficas();
    }
  }, [componentes]);

  const calcularComponentes = () => {
    // PASO 1: Dividir f(x) en subáreas
    const A1 = (b - a) / (c - a);
    const A2 = (c - b) / (c - a);

    // PASO 2: Determinar fi(x) usando ecuación de la recta
    // f1(x) = 2(x-a)/(b-a)^2  para x ∈ [a, b]
    const f1 = `2*(x-${a})/((${b}-${a})^2)`;
    
    // f2(x) = -2(x-c)/(c-b)^2  para x ∈ [b, c]
    const f2 = `-2*(x-${c})/((${c}-${b})^2)`;

    // PASO 7: CDFs (del documento)
    // F1(x) = (x-a)^2/(b-a)^2
    const F1 = `((x-${a})^2)/((${b}-${a})^2)`;
    const F1_inv = `${a} + (${b}-${a})*sqrt(u)`;

    // F2(x) = 1 - (x-c)^2/(c-b)^2
    const F2 = `1 - ((x-${c})^2)/((${c}-${b})^2)`;
    const F2_inv = `${c} + (${c}-${b})*sqrt(1-u)`;

    setComponentes([
      {
        area: A1,
        ecuacion: f1,
        limInf: a,
        limSup: b,
        cdf: F1,
        cdfInversa: F1_inv
      },
      {
        area: A2,
        ecuacion: f2,
        limInf: b,
        limSup: c,
        cdf: F2,
        cdfInversa: F2_inv
      }
    ]);
  };

  const evaluarFuncion = (ecuacion: string, x: number): number | null => {
    try {
      const resultado = evaluate(ecuacion, { x });
      return typeof resultado === 'number' ? resultado : null;
    } catch (e) {
      return null;
    }
  };

  const evaluarInversa = (ecuacion: string, u: number): number => {
    try {
      const resultado = evaluate(ecuacion, { u });
      return typeof resultado === 'number' ? resultado : 0;
    } catch (e) {
      return 0;
    }
  };

  const dibujarGraficas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const minX = a;
    const maxX = c;
    const rangoX = maxX - minX;

    // Calcular maxY
    let maxY = 0;
    const numSamples = 200;
    
    for (let i = 0; i <= numSamples; i++) {
      const x = minX + rangoX * (i / numSamples);
      
      componentes.forEach(comp => {
        if (x >= comp.limInf && x <= comp.limSup) {
          const y = evaluarFuncion(comp.ecuacion, x);
          if (y !== null && isFinite(y) && y > maxY) maxY = y;
        }
      });
    }

    maxY = maxY * 1.1;

    const width = canvas.width;
    const height = canvas.height;
    const originX = 60;
    const originY = height - 50;
    const scaleX = (width - originX - 20) / rangoX;
    const scaleY = (originY - 30) / maxY;

    // Dibujar ejes
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(width, originY);
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX, 0);
    ctx.stroke();

    // Etiquetas eje X
    ctx.fillStyle = '#666666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    [a, b, c].forEach(val => {
      const x = originX + (val - minX) * scaleX;
      ctx.beginPath();
      ctx.moveTo(x, originY - 5);
      ctx.lineTo(x, originY + 5);
      ctx.stroke();
      ctx.fillText(val.toString(), x, originY + 20);
    });

    // Etiquetas eje Y
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const yValue = (maxY * i) / 5;
      const y = originY - yValue * scaleY;
      ctx.beginPath();
      ctx.moveTo(originX - 5, y);
      ctx.lineTo(originX + 5, y);
      ctx.stroke();
      ctx.fillText(yValue.toFixed(3), originX - 10, y);
    }

    const colores = ['#3B82F6', '#EF4444'];

    // PASO 3: Dibujar f(x) = Σ Ai*fi(x)
    componentes.forEach((comp, idx) => {
      ctx.strokeStyle = colores[idx];
      ctx.lineWidth = 3;
      ctx.beginPath();
      let primerPunto = true;

      for (let px = originX; px < width; px++) {
        const x = minX + (px - originX) / scaleX;
        
        if (x >= comp.limInf && x <= comp.limSup) {
          const y = evaluarFuncion(comp.ecuacion, x);
          if (y !== null && isFinite(y) && y >= 0) {
            const py = originY - y * scaleY;
            if (primerPunto) {
              ctx.moveTo(px, py);
              primerPunto = false;
            } else {
              ctx.lineTo(px, py);
            }
          }
        }
      }
      ctx.stroke();
    });

    // Dibujar áreas sombreadas
    componentes.forEach((comp, idx) => {
      ctx.fillStyle = colores[idx] + '20';
      ctx.beginPath();
      
      const xStart = originX + (comp.limInf - minX) * scaleX;
      ctx.moveTo(xStart, originY);
      
      for (let px = xStart; px <= originX + (comp.limSup - minX) * scaleX; px++) {
        const x = minX + (px - originX) / scaleX;
        const y = evaluarFuncion(comp.ecuacion, x);
        if (y !== null && isFinite(y)) {
          const py = originY - y * scaleY;
          ctx.lineTo(px, py);
        }
      }
      
      const xEnd = originX + (comp.limSup - minX) * scaleX;
      ctx.lineTo(xEnd, originY);
      ctx.closePath();
      ctx.fill();
    });
  };

  // LCG Generator
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

  // PASO 5, 6, 7: Generar muestras
  const generarMuestras = () => {
    const n = parseInt(numSimulaciones) || 10;
    const rng = createLCG(1234); // Semilla fija
    const samples: SamplePoint[] = [];

    for (let i = 1; i <= n; i++) {
      // PASO 5: Generar R1 y R2
      const R1 = rng();
      const R2 = rng();

      // PASO 6: Escoger subfunción con R1
      let componenteSeleccionado = 0;
      let acumulado = 0;
      
      for (let j = 0; j < componentes.length; j++) {
        acumulado += componentes[j].area;
        if (R1 < acumulado) {
          componenteSeleccionado = j;
          break;
        }
      }

      const comp = componentes[componenteSeleccionado];

      // PASO 7: Aplicar Transformada Inversa
      const x = evaluarInversa(comp.cdfInversa, R2);
      const fx = evaluarFuncion(comp.ecuacion, x);

      samples.push({
        i,
        u: R1,
        u2: R2,
        x,
        fx: fx || 0,
        accepted: true // Composición no rechaza
      });
    }

    setMuestras(samples);
  };

  const sumaAreas = componentes.reduce((acc, c) => acc + c.area, 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-black mb-4">
           Método de Composición
        </h2>
        
        <div className="bg-purple-50 border-l-4 border-black p-4">
          <p className="text-sm font-semibold mb-2">
             Algoritmo según el documento 
          </p>
          <ol className="text-sm space-y-1 ml-4">
            <li><strong>Paso 1:</strong> Dividir <InlineMath math="f(x)" /> en subáreas</li>
            <li><strong>Paso 2:</strong> Determinar subfunciones <InlineMath math="f_i(x)" /></li>
            <li><strong>Paso 3:</strong> Re-expresar <InlineMath math="f(x) = \sum A_i \cdot f_i(x)" /></li>
            <li><strong>Paso 4:</strong> Establecer relación gráfica</li>
            <li><strong>Paso 5:</strong> Generar <InlineMath math="R_1" /> y <InlineMath math="R_2" /></li>
            <li><strong>Paso 6:</strong> Escoger subfunción con <InlineMath math="R_1" /></li>
            <li><strong>Paso 7:</strong> Aplicar Transformada Inversa con <InlineMath math="R_2" /></li>
          </ol>
        </div>
      </div>

      {/* Configuración: Distribución Triangular */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-black mb-4">
          Paso 1 y 2: Configurar Distribución Triangular
        </h3>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <p className="text-sm mb-2">
            <strong>Ejemplo del documento:</strong> Distribución triangular con parámetros <InlineMath math="a" />, <InlineMath math="b" />, <InlineMath math="c" />
          </p>
          <div className="text-sm">
            <BlockMath math="f(x) = \begin{cases} \frac{2(x-a)}{(b-a)(c-a)} & \text{si } a \leq x \leq b \\ \frac{2(c-x)}{(c-b)(c-a)} & \text{si } b < x \leq c \end{cases}" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Parámetro <InlineMath math="a" /> (límite inferior)
            </label>
            <input
              type="number"
              value={a}
              onChange={(e) => setA(parseFloat(e.target.value) || 0)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Parámetro <InlineMath math="b" /> (moda)
            </label>
            <input
              type="number"
              value={b}
              onChange={(e) => setB(parseFloat(e.target.value) || 0)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Parámetro <InlineMath math="c" /> (límite superior)
            </label>
            <input
              type="number"
              value={c}
              onChange={(e) => setC(parseFloat(e.target.value) || 0)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Mostrar componentes calculados */}
        {componentes.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">Subfunciones calculadas:</h4>
            
            {componentes.map((comp, idx) => (
              <div key={idx} className="bg-gray-50 p-4 rounded border-l-4"
                   style={{ borderColor: idx === 0 ? '#3B82F6' : '#EF4444' }}>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong className={idx === 0 ? 'text-blue-600' : 'text-red-600'}>
                      Componente {idx + 1}:
                    </strong>
                    <p className="mt-2">
                      <InlineMath math={`A_${idx + 1} = ${comp.area.toFixed(4)}`} />
                    </p>
                    <p className="mt-1">
                      {idx === 0 ? (
                        <InlineMath math={`f_1(x) = \\frac{2(x-${a})}{(${b}-${a})^2}`} />
                      ) : (
                        <InlineMath math={`f_2(x) = \\frac{-2(x-${c})}{(${c}-${b})^2}`} />
                      )}
                    </p>
                    <p className="mt-1">
                      Dominio: <InlineMath math={`[${comp.limInf}, ${comp.limSup}]`} />
                    </p>
                  </div>
                  <div>
                    <strong>Transformada Inversa:</strong>
                    <p className="mt-2">
                      {idx === 0 ? (
                        <InlineMath math={`F_1(x) = \\frac{(x-${a})^2}{(${b}-${a})^2}`} />
                      ) : (
                        <InlineMath math={`F_2(x) = 1 - \\frac{(x-${c})^2}{(${c}-${b})^2}`} />
                      )}
                    </p>
                    <p className="mt-2 text-green-700">
                      {idx === 0 ? (
                        <InlineMath math={`x = ${a} + ${b-a}\\sqrt{R_2}`} />
                      ) : (
                        <InlineMath math={`x = ${c} + ${c-b}\\sqrt{1-R_2}`} />
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-green-50 p-3 rounded border-l-4 border-green-500">
              <p className="text-sm font-semibold">
                ✓ Verificación: <InlineMath math={`\\sum A_i = ${sumaAreas.toFixed(4)}`} />
                {Math.abs(sumaAreas - 1) < 0.001 && <span className="text-green-600 ml-2">✓ Correcto</span>}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Paso 3 y 4: Gráfico */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-black mb-4">
          Paso 3 y 4: <InlineMath math="f(x) = \sum A_i \cdot f_i(x)" />
        </h3>
        
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="border border-gray-300 rounded mx-auto"
        />
        
        <div className="mt-4 flex gap-6 items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-blue-500"></div>
            <span className="text-sm">
              <InlineMath math={`f_1(x)`} /> - Área <InlineMath math={`A_1 = ${componentes[0]?.area.toFixed(3)}`} />
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-red-500"></div>
            <span className="text-sm">
              <InlineMath math={`f_2(x)`} /> - Área <InlineMath math={`A_2 = ${componentes[1]?.area.toFixed(3)}`} />
            </span>
          </div>
        </div>
      </div>

      {/* Botón para mostrar generación */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <button
          onClick={() => setMostrarGeneracion(!mostrarGeneracion)}
          className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
        >
          {mostrarGeneracion ? ' Ocultar Generación' : ' Paso 5-7: Generar Muestras'}
        </button>
      </div>

      {/* Paso 5, 6, 7: Generación */}
      {mostrarGeneracion && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-black mb-4">
            Paso 5, 6, 7: Generación de Variables
          </h3>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
            <div className="text-sm space-y-1">
              <p>
                <strong>Paso 5:</strong> Generar <InlineMath math="R_1" /> y <InlineMath math="R_2" /> aleatorios
              </p>
              <p>
                <strong>Paso 6:</strong> Si <InlineMath math={`R_1 < ${componentes[0]?.area.toFixed(3)}`} /> → usar <InlineMath math="f_1(x)" />, 
                sino usar <InlineMath math="f_2(x)" />
              </p>
              <p>
                <strong>Paso 7:</strong> Aplicar Transformada Inversa con <InlineMath math="R_2" />
              </p>
            </div>
          </div>
          
          <div className="flex items-end gap-4 flex-wrap mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Número de Simulaciones</label>
              <input
                type="text"
                value={numSimulaciones}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d+$/.test(value)) setNumSimulaciones(value);
                }}
                className="p-2 border border-gray-300 rounded-md w-40"
              />
            </div>

            <div className="flex-1 bg-gray-50 p-3 rounded border border-gray-300">
              <p className="text-xs font-medium text-gray-600 mb-2">Generador Congruencial Mixto (LCG):</p>
              <div className="text-sm">
                <InlineMath math="X_{n+1} = (a \cdot X_n + c) \mod m" />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                donde <InlineMath math="a = 1664525" />, <InlineMath math="c = 1013904223" />, <InlineMath math="m = 2^{32}" />, <InlineMath math="X_0 = 1234" />
              </div>
            </div>

            <button
              onClick={generarMuestras}
              className="px-6 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-700"
            >
               Generar con Transformada Inversa
            </button>
          </div>

          {muestras.length > 0 && (
            <div>
              <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500 mb-4">
                <p className="text-sm">
                  <strong>Fórmulas aplicadas:</strong>
                </p>
                <div className="mt-2 space-y-1 text-sm">
                  <p>
                    Si <InlineMath math={`R_1 < ${componentes[0]?.area.toFixed(3)}`} />: 
                    <InlineMath math={` x = ${a} + ${b-a}\\sqrt{R_2}`} />
                  </p>
                  <p>
                    Si <InlineMath math={`R_1 \\geq ${componentes[0]?.area.toFixed(3)}`} />: 
                    <InlineMath math={` x = ${c} + ${c-b}\\sqrt{1-R_2}`} />
                  </p>
                </div>
              </div>
              
              <SampleTable
                samples={muestras}
                columns={{
                  i: true,
                  u: true,
                  u2: true,
                  x: true,
                  fx: true,
                  accepted: false
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}