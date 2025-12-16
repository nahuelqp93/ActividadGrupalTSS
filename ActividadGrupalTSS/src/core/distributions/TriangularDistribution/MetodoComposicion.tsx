import { compositionMethod } from '../../../core/methods/composicion';
import type { SamplePoint } from '../../../core/types/Sample';
import SampleTable from '../../../components/common/SampleTable';
import SamplePlot from '../../../components/common/SamplePlot';
import { useState, useEffect, useRef } from 'react';
import { evaluate, derivative, parse } from 'mathjs';


// Tipos para componentes de la mezcla
interface ComponenteDistribucion {
  peso: number;
  ecuacion: string;
  limInf: number;
  limSup: number;
  cdfInversa: string; // Fórmula de F^-1(u)
}

export default function MetodoComposicion() {
  // Componentes de la mezcla (por defecto 2)
  const [componentes, setComponentes] = useState<ComponenteDistribucion[]>([
    {
      peso: 0.5,
      ecuacion: 'exp(-x)',
      limInf: 0,
      limSup: 5,
      cdfInversa: '-log(1-u)'
    },
    {
      peso: 0.5,
      ecuacion: '2*exp(-2*x)',
      limInf: 0,
      limSup: 5,
      cdfInversa: '-log(1-u)/2'
    }
  ]);

  // Generación
  const [numSimulaciones, setNumSimulaciones] = useState('10');
  const [seed, setSeed] = useState(1234);
  const [muestras, setMuestras] = useState<SamplePoint[]>([]);
  const [mostrarGrafico, setMostrarGrafico] = useState(false);
  const [mostrarGeneracion, setMostrarGeneracion] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    dibujarGraficas();
  }, [componentes]);

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

  const evaluarFuncion = (ecuacion: string, x: number): number | null => {
    try {
      const resultado = evaluate(ecuacion, { x });
      return typeof resultado === 'number' ? resultado : null;
    } catch (e) {
      return null;
    }
  };

  // Función mixta f(x) = Σ pi * fi(x)
  const evaluarFuncionMixta = (x: number): number => {
    let suma = 0;
    for (const comp of componentes) {
      if (x >= comp.limInf && x <= comp.limSup) {
        const val = evaluarFuncion(comp.ecuacion, x);
        if (val !== null) {
          suma += comp.peso * val;
        }
      }
    }
    return suma;
  };

  // Calcular integral numérica (Regla del trapecio)
  const calcularIntegral = (ecuacion: string, limInf: number, limSup: number): number => {
    const n = 1000;
    const h = (limSup - limInf) / n;
    let suma = 0;

    for (let i = 0; i <= n; i++) {
      const x = limInf + i * h;
      const fx = evaluarFuncion(ecuacion, x) || 0;
      
      if (i === 0 || i === n) {
        suma += fx;
      } else {
        suma += 2 * fx;
      }
    }

    return (h / 2) * suma;
  };

  const dibujarGraficas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calcular rangos
    const minX = Math.min(...componentes.map(c => c.limInf));
    const maxX = Math.max(...componentes.map(c => c.limSup));
    const rangoX = maxX - minX;

    let maxY = 0;
    const numSamples = 200;
    
    for (let i = 0; i <= numSamples; i++) {
      const x = minX + (maxX - minX) * (i / numSamples);
      const y = evaluarFuncionMixta(x);
      if (isFinite(y) && y > maxY) maxY = y;
    }

    maxY = maxY * 1.1;

    const width = canvas.width;
    const height = canvas.height;
    const originX = 60;
    const originY = height - 50;
    const scaleX = (width - originX - 20) / rangoX;
    const scaleY = (originY - 30) / maxY;

    // Ejes
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
    for (let i = 0; i <= 10; i++) {
      const xValue = minX + (rangoX * i / 10);
      const x = originX + ((xValue - minX) * scaleX);
      ctx.beginPath();
      ctx.moveTo(x, originY - 5);
      ctx.lineTo(x, originY + 5);
      ctx.stroke();
      ctx.fillText(xValue.toFixed(1), x, originY + 20);
    }

    // Etiquetas eje Y
    ctx.textAlign = 'right';
    for (let i = 0; i <= 10; i++) {
      const yValue = (maxY * i) / 10;
      const y = originY - yValue * scaleY;
      ctx.beginPath();
      ctx.moveTo(originX - 5, y);
      ctx.lineTo(originX + 5, y);
      ctx.stroke();
      ctx.fillText(yValue.toFixed(2), originX - 10, y);
    }

    const colores = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];

    // Dibujar cada componente
    componentes.forEach((comp, idx) => {
      ctx.strokeStyle = colores[idx % colores.length];
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      let primerPunto = true;

      for (let px = originX; px < width; px++) {
        const x = minX + (px - originX) / scaleX;
        
        if (x >= comp.limInf && x <= comp.limSup) {
          const y = evaluarFuncion(comp.ecuacion, x);
          if (y !== null && isFinite(y) && y >= 0) {
            const py = originY - comp.peso * y * scaleY;
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

    // Dibujar función mixta
    ctx.setLineDash([]);
    ctx.strokeStyle = '#9333EA';
    ctx.lineWidth = 3;
    ctx.beginPath();
    let primerPunto = true;

    for (let px = originX; px < width; px++) {
      const x = minX + (px - originX) / scaleX;
      const y = evaluarFuncionMixta(x);
      
      if (isFinite(y) && y >= 0) {
        const py = originY - y * scaleY;
        if (primerPunto) {
          ctx.moveTo(px, py);
          primerPunto = false;
        } else {
          ctx.lineTo(px, py);
        }
      }
    }
    ctx.stroke();
  };

  const agregarComponente = () => {
    setComponentes([
      ...componentes,
      {
        peso: 0,
        ecuacion: 'exp(-x)',
        limInf: 0,
        limSup: 5,
        cdfInversa: '-log(1-u)'
      }
    ]);
  };

  const eliminarComponente = (idx: number) => {
    if (componentes.length > 2) {
      setComponentes(componentes.filter((_, i) => i !== idx));
    }
  };

  const actualizarComponente = (idx: number, campo: keyof ComponenteDistribucion, valor: any) => {
    const nuevos = [...componentes];
    nuevos[idx] = { ...nuevos[idx], [campo]: valor };
    setComponentes(nuevos);
  };

  // Normalizar pesos para que sumen 1
  const normalizarPesos = () => {
    const suma = componentes.reduce((acc, c) => acc + c.peso, 0);
    if (suma > 0) {
      const nuevos = componentes.map(c => ({ ...c, peso: c.peso / suma }));
      setComponentes(nuevos);
    }
  };

  const generarMuestras = () => {
    const n = parseInt(numSimulaciones) || 10;
    const rng = createLCG(seed);

    // Normalizar pesos
    const sumaPesos = componentes.reduce((acc, c) => acc + c.peso, 0);
    const componentesNormalizados = componentes.map(c => ({
      weight: c.peso / sumaPesos,
      inverseCDF: (u: number) => {
        try {
          return evaluate(c.cdfInversa, { u }) || 0;
        } catch {
          return 0;
        }
      },
      pdf: (x: number) => evaluarFuncion(c.ecuacion, x) || 0
    }));

    const samples = compositionMethod({
      n,
      nextU: rng,
      components: componentesNormalizados
    });

    setMuestras(samples);
    setMostrarGeneracion(true);
  };

  // Calcular integrales de cada componente
  const integrales = componentes.map(c => 
    calcularIntegral(c.ecuacion, c.limInf, c.limSup)
  );

  const sumaPesos = componentes.reduce((acc, c) => acc + c.peso, 0);

  const curves = componentes.map((comp, idx) => ({
    xmin: comp.limInf,
    xmax: comp.limSup,
    pdf: (x: number) => (evaluarFuncion(comp.ecuacion, x) || 0) * comp.peso,
    color: ['#3B82F6', '#EF4444', '#10B981'][idx] || '#666',
    label: `Componente ${idx + 1}`
  }));

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-purple-800 mb-4 flex items-center gap-2">
           Método de Composición
        </h2>
        
        <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
          <p className="text-sm text-gray-700 mb-2">
            <strong>Método de Composición:</strong> Genera variables aleatorias a partir de una mezcla de distribuciones.
          </p>
          <div className="font-mono text-sm bg-white p-3 rounded mt-2">
            f(x) = Σ p<sub>i</sub> · f<sub>i</sub>(x)
          </div>
        </div>
      </div>

      {/* Configuración de componentes */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-purple-800">Componentes de la Mezcla</h3>
          <div className="flex gap-2">
            <button
              onClick={agregarComponente}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
            >
              + Agregar Componente
            </button>
            <button
              onClick={normalizarPesos}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
            >
              Normalizar Pesos
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {componentes.map((comp, idx) => (
            <div key={idx} className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-purple-700">Componente {idx + 1}</h4>
                {componentes.length > 2 && (
                  <button
                    onClick={() => eliminarComponente(idx)}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Peso p<sub>{idx + 1}</sub>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={comp.peso}
                    onChange={(e) => actualizarComponente(idx, 'peso', parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border rounded"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Integral ≈ {integrales[idx].toFixed(4)}
                  </p>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    PDF: f<sub>{idx + 1}</sub>(x)
                  </label>
                  <input
                    type="text"
                    value={comp.ecuacion}
                    onChange={(e) => actualizarComponente(idx, 'ecuacion', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="exp(-x)"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    CDF Inversa: F<sub>{idx + 1}</sub><sup>-1</sup>(u)
                  </label>
                  <input
                    type="text"
                    value={comp.cdfInversa}
                    onChange={(e) => actualizarComponente(idx, 'cdfInversa', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="-log(1-u)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Lím. Inf</label>
                    <input
                      type="number"
                      step="0.1"
                      value={comp.limInf}
                      onChange={(e) => actualizarComponente(idx, 'limInf', parseFloat(e.target.value))}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Lím. Sup</label>
                    <input
                      type="number"
                      step="0.1"
                      value={comp.limSup}
                      onChange={(e) => actualizarComponente(idx, 'limSup', parseFloat(e.target.value))}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-500">
          <p className="text-sm">
            <strong>Suma de pesos:</strong> {sumaPesos.toFixed(4)} 
            {Math.abs(sumaPesos - 1) > 0.01 && (
              <span className="text-red-600 ml-2"> Los pesos deben sumar 1</span>
            )}
          </p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h3 className="text-lg font-bold mb-3">Visualización de la Mezcla</h3>
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="border border-gray-300 rounded mx-auto"
        />
        <div className="mt-4 flex gap-4 items-center justify-center flex-wrap">
          {componentes.map((comp, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div 
                className="w-8 h-1" 
                style={{ 
                  backgroundColor: ['#3B82F6', '#EF4444', '#10B981'][idx] || '#666',
                  border: '2px dashed #666'
                }}
              ></div>
              <span className="text-sm">Comp. {idx + 1}: {comp.peso.toFixed(2)} · {comp.ecuacion}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-purple-600"></div>
            <span className="text-sm font-bold">Mezcla Total</span>
          </div>
        </div>
      </div>

      {/* Botón de generación */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <button
          onClick={() => setMostrarGeneracion(!mostrarGeneracion)}
          className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
        >
          {mostrarGeneracion ? ' Ocultar Generación' : '🎲 Generar Muestras'}
        </button>
      </div>

      {/* Generación de muestras */}
      {mostrarGeneracion && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-purple-800">Generación de Muestras</h3>
          
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

            <div>
              <label className="block text-sm font-medium mb-2">Semilla (Seed)</label>
              <input
                type="number"
                value={seed}
                onChange={(e) => setSeed(parseInt(e.target.value) || 1234)}
                className="p-2 border border-gray-300 rounded-md w-40"
              />
            </div>

            <button
              onClick={generarMuestras}
              disabled={Math.abs(sumaPesos - 1) > 0.01}
              className={`px-6 py-2 font-semibold rounded-lg transition-colors ${
                Math.abs(sumaPesos - 1) > 0.01
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
               Generar
            </button>

            {muestras.length > 0 && (
              <button
                onClick={() => setMostrarGrafico(!mostrarGrafico)}
                className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700"
              >
                {mostrarGrafico ? ' Ver Tabla' : ' Ver Gráfico'}
              </button>
            )}
          </div>

          {/* Gráfico de muestras */}
          {mostrarGrafico && muestras.length > 0 && (
            <div className="mt-6">
              <SamplePlot
                samples={muestras}
                curves={curves}
                title="Método de Composición - Muestras Generadas"
              />
            </div>
          )}

          {/* Tabla */}
          {!mostrarGrafico && muestras.length > 0 && (
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
              showFormulas={{
                xFormula: 'Seleccionar componente según U₁, luego X = F⁻¹(U₂)'
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}