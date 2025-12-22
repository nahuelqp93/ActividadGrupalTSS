import { useState, useEffect, useRef } from 'react';
import { evaluate } from 'mathjs';

interface Muestra {
  n: number;
  r: number;
  x: number;
  funcionUsada?: string;
}

export default function MetodoInversa() {
  const [funcion1, setFuncion1] = useState('(x-3)^2/18');
  const [limiteInf1, setLimiteInf1] = useState('0');
  const [limiteSup1, setLimiteSup1] = useState('6');
  
  const [funcion2, setFuncion2] = useState('');
  const [limiteInf2, setLimiteInf2] = useState('');
  const [limiteSup2, setLimiteSup2] = useState('');
  
  const [numSimulaciones, setNumSimulaciones] = useState('10');
  const [muestras, setMuestras] = useState<Muestra[]>([]);
  const [mostrarTabla, setMostrarTabla] = useState(false);
  const [error, setError] = useState('');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    dibujarGraficas();
  }, [funcion1, funcion2, limiteInf1, limiteSup1, limiteInf2, limiteSup2, muestras]);

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

  const evaluarFuncion = (ecuacion: string, variable: string, valor: number): number | null => {
    try {
      const scope: any = {};
      scope[variable] = valor;
      const resultado = evaluate(ecuacion, scope);
      return typeof resultado === 'number' ? resultado : null;
    } catch (e) {
      return null;
    }
  };

  const calcularRaizCubica = (num: number): number => {
    if (num >= 0) {
      return Math.pow(num, 1/3);
    } else {
      return -Math.pow(-num, 1/3);
    }
  };

  const calcularInversaF1 = (r: number): number => {
    const valor = 54 * r - 27;
    return 3 + calcularRaizCubica(valor);
  };

  const calcularInversaF2 = (r: number): number => {
    const b = parseFloat(limiteSup1);
    const c = parseFloat(limiteSup2);
    return c - ((c - b) * Math.sqrt(1 - r));
  };

  const generarMuestras = () => {
    try {
      const n = parseInt(numSimulaciones) || 10;
      const seed = 1234;
      const rng = createLCG(seed);
      const nuevasMuestras: Muestra[] = [];

      const a = parseFloat(limiteInf1);
      const b = parseFloat(limiteSup1);
      const c = funcion2 && limiteInf2 && limiteSup2 ? parseFloat(limiteSup2) : b;
      
      const umbral = funcion2 ? (b - a) / (c - a) : 1;

      for (let i = 1; i <= n; i++) {
        const r = rng();
        let x: number;
        let funcionUsada = 'f1';

        if (funcion2) {
          if (r < umbral) {
            x = calcularInversaF1(r);
            funcionUsada = 'f1';
          } else {
            x = calcularInversaF2(r);
            funcionUsada = 'f2';
          }
        } else {
          x = calcularInversaF1(r);
          funcionUsada = 'f1';
        }

        nuevasMuestras.push({
          n: i,
          r: parseFloat(r.toFixed(4)),
          x: parseFloat(x.toFixed(4)),
          funcionUsada: funcion2 ? funcionUsada : undefined
        });
      }

      setMuestras(nuevasMuestras);
      setMostrarTabla(true);
      setError('');
    } catch (e) {
      setError('Error al generar muestras: ' + (e as Error).message);
    }
  };

  const dibujarGraficas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const minX1 = parseFloat(limiteInf1) || 0;
    const maxX1 = parseFloat(limiteSup1) || 6;
    const minX2 = funcion2 ? (parseFloat(limiteInf2) || 0) : maxX1;
    const maxX2 = funcion2 ? (parseFloat(limiteSup2) || 6) : maxX1;
    const minX = Math.min(minX1, minX2);
    const maxX = Math.max(maxX1, maxX2);
    const rangoX = maxX - minX;

    let minY = 0;
    let maxY = 0;
    const numSamples = 200;

    for (let i = 0; i <= numSamples; i++) {
      const x1 = minX1 + (maxX1 - minX1) * (i / numSamples);
      const y1 = evaluarFuncion(funcion1, 'x', x1);
      if (y1 !== null && isFinite(y1) && y1 >= 0) {
        maxY = Math.max(maxY, y1);
      }

      if (funcion2) {
        const x2 = minX2 + (maxX2 - minX2) * (i / numSamples);
        const y2 = evaluarFuncion(funcion2, 'x', x2);
        if (y2 !== null && isFinite(y2) && y2 >= 0) {
          maxY = Math.max(maxY, y2);
        }
      }
    }

    maxY = maxY * 1.2;

    const width = canvas.width;
    const height = canvas.height;
    const originX = 60;
    const originY = height - 50;
    const scaleX = (width - originX - 20) / rangoX;
    const scaleY = (originY - 30) / maxY;

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(width, originY);
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX, 0);
    ctx.stroke();

    ctx.fillStyle = '#666666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= 10; i++) {
      const xValue = minX + (rangoX * i / 10);
      const x = originX + ((xValue - minX) * scaleX);
      ctx.beginPath();
      ctx.moveTo(x, originY - 5);
      ctx.lineTo(x, originY + 5);
      ctx.stroke();
      ctx.fillText(xValue.toFixed(1), x, originY + 20);
    }

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

    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    let primerPunto = true;

    for (let px = originX; px < width; px++) {
      const x = minX + (px - originX) / scaleX;

      if (x >= minX1 && x <= maxX1) {
        const y = evaluarFuncion(funcion1, 'x', x);

        if (y !== null && !isNaN(y) && isFinite(y) && y >= 0) {
          const py = originY - y * scaleY;

          if (py >= 0 && py <= originY) {
            if (primerPunto) {
              ctx.moveTo(px, py);
              primerPunto = false;
            } else {
              ctx.lineTo(px, py);
            }
          } else {
            primerPunto = true;
          }
        } else {
          primerPunto = true;
        }
      } else {
        primerPunto = true;
      }
    }
    ctx.stroke();

    if (funcion2) {
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      primerPunto = true;

      for (let px = originX; px < width; px++) {
        const x = minX + (px - originX) / scaleX;

        if (x >= minX2 && x <= maxX2) {
          const y = evaluarFuncion(funcion2, 'x', x);

          if (y !== null && !isNaN(y) && isFinite(y) && y >= 0) {
            const py = originY - y * scaleY;

            if (py >= 0 && py <= originY) {
              if (primerPunto) {
                ctx.moveTo(px, py);
                primerPunto = false;
              } else {
                ctx.lineTo(px, py);
              }
            } else {
              primerPunto = true;
            }
          } else {
            primerPunto = true;
          }
        } else {
          primerPunto = true;
        }
      }
      ctx.stroke();
    }

    if (muestras.length > 0) {
      muestras.forEach(muestra => {
        const px = originX + (muestra.x - minX) * scaleX;
        
        const funcionAEvaluar = muestra.funcionUsada === 'f2' && funcion2 ? funcion2 : funcion1;
        const y = evaluarFuncion(funcionAEvaluar, 'x', muestra.x);
        
        if (y !== null) {
          const py = originY - y * scaleY;
          
          if (muestra.funcionUsada === 'f2') {
            ctx.fillStyle = '#ef4444';
          } else {
            ctx.fillStyle = '#3b82f6';
          }
          
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, 2 * Math.PI);
          ctx.fill();
        }
      });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Metodo de la Transformada Inversa
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border-2 border-blue-300 rounded-lg p-4">
          <label className="block text-sm font-medium mb-2">
            Funcion PDF 1 (f(x))
          </label>
          <input
            type="text"
            value={funcion1}
            onChange={(e) => setFuncion1(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none mb-2"
            placeholder="Ej: (x-3)^2/18"
          />
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-xs font-medium mb-1">Limite Inferior</label>
              <input
                type="number"
                value={limiteInf1}
                onChange={(e) => setLimiteInf1(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Limite Superior</label>
              <input
                type="number"
                value={limiteSup1}
                onChange={(e) => setLimiteSup1(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none"
                placeholder="6"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            La funcion inversa se calcula automaticamente: x = a + (b-a)√R²
          </p>
        </div>

        <div className="border-2 border-red-300 rounded-lg p-4">
          <label className="block text-sm font-medium mb-2">
            Funcion PDF 2 (f(x)) - Opcional
          </label>
          <input
            type="text"
            value={funcion2}
            onChange={(e) => setFuncion2(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none mb-2"
            placeholder="Ej: otra funcion"
          />
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-xs font-medium mb-1">Limite Inferior</label>
              <input
                type="number"
                value={limiteInf2}
                onChange={(e) => setLimiteInf2(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none"
                placeholder="6"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Limite Superior</label>
              <input
                type="number"
                value={limiteSup2}
                onChange={(e) => setLimiteSup2(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none"
                placeholder="10"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Funcion inversa se calcula automaticamente: x = c - (c-b)√(1-R)
          </p>
        </div>
      </div>

      <div className="flex gap-4 items-end mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">Numero de Simulaciones</label>
          <input
            type="number"
            value={numSimulaciones}
            onChange={(e) => setNumSimulaciones(e.target.value)}
            className="p-2 border border-gray-300 rounded-md w-40"
          />
        </div>

        <button
          onClick={generarMuestras}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          Generar Muestras
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="border border-gray-300 rounded justify-center mx-auto"
        />
      </div>

      <div className="flex gap-4 items-center justify-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-1 bg-blue-500"></div>
          <span className="text-sm">Funcion 1: {funcion1}</span>
        </div>
        {funcion2 && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-red-500"></div>
            <span className="text-sm">Funcion 2: {funcion2}</span>
          </div>
        )}
        {muestras.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <span className="text-sm">Puntos Generados</span>
          </div>
        )}
      </div>

      {mostrarTabla && muestras.length > 0 && (
        <>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6">
            <h3 className="text-lg font-bold mb-4 text-blue-800">Pasos del Metodo de la Transformada Inversa (Simulacion 1)</h3>
            
            <div className="space-y-3">
              <div className="bg-white p-3 rounded border-l-4 border-blue-400">
                <p className="text-sm font-semibold text-blue-600 mb-2">1. Contar con la funcion</p>
                <div className="text-sm bg-gray-50 px-3 py-2 rounded">
                  <p className="font-mono">f(x) = {funcion1}</p>
                  <p className="text-xs text-gray-600 mt-1">Dominio: {limiteInf1} ≤ x ≤ {limiteSup1}</p>
                </div>
              </div>

              <div className="bg-white p-3 rounded border-l-4 border-blue-400">
                <p className="text-sm font-semibold text-blue-600 mb-2">2. Definir la funcion acumulada</p>
                <div className="text-sm bg-gray-50 px-3 py-2 rounded space-y-1">
                  <p>Calculamos la Funcion de Distribucion Acumulada (FDA), F(x), integrando desde el limite inferior (0) hasta x.</p>
                  <p className="font-mono text-xs mt-2">F(x) = ∫₀ˣ f(t) dt</p>
                  <p className="text-xs text-gray-600 mt-1">El resultado es: F(x) = (x - 3)³ + 27 / 54</p>
                </div>
              </div>

              <div className="bg-white p-3 rounded border-l-4 border-blue-400">
                <p className="text-sm font-semibold text-blue-600 mb-2">3. Igualar la funcion acumulada con R</p>
                <div className="text-sm bg-gray-50 px-3 py-2 rounded space-y-1">
                  <p className="font-mono">R = (x - 3)³ + 27 / 54</p>
                  <p className="text-xs text-gray-600 mt-1">Valores de R (0 al 1)</p>
                  <p className="font-mono mt-2">R = {muestras[0].r}</p>
                </div>
              </div>

              <div className="bg-white p-3 rounded border-l-4 border-blue-400">
                <p className="text-sm font-semibold text-blue-600 mb-2">4. Hallar la funcion inversa (despejar x)</p>
                <div className="text-sm bg-gray-50 px-3 py-2 rounded space-y-1">
                  <p className="font-mono text-xs">54R = (x - 3)³ + 27</p>
                  <p className="font-mono text-xs">54R - 27 = (x - 3)³</p>
                  <p className="font-mono text-xs">∛(54R - 27) = x - 3</p>
                  <p className="font-mono text-xs">∛(54R - 27) + 3 = x</p>
                  <p className="font-mono font-semibold text-blue-700 mt-2">x = 3 + ∛(54R - 27)</p>
                  <p className="font-mono mt-2">Sustituir R = {muestras[0].r}</p>
                  <p className="font-mono font-semibold text-blue-700">X = {muestras[0].x}</p>
                </div>
              </div>

              <div className="bg-white p-3 rounded border-l-4 border-green-500">
                <p className="text-sm font-semibold text-green-700 mb-2">5. Si la relacion se cumple se acepta el valor de x caso contrario se rechaza</p>
                <div className="text-sm bg-green-50 px-3 py-2 rounded space-y-2">
                  <p className="font-mono">Funcion transformada inversa(R):</p>
                  <p className="font-mono text-xs">x = 3 + ∛(54R - 27)</p>
                  <div className="mt-3 space-y-1">
                    <p className="text-xs">Verificaciones:</p>
                    <p className="text-xs">• Si (R ≥ 0 y R ≤ 1) → {muestras[0].r >= 0 && muestras[0].r <= 1 ? '✓' : '✗'} Aceptamos R</p>
                    <p className="text-xs">• Si (x ≥ {limiteInf1} y x ≤ {limiteSup1}) → {muestras[0].x >= parseFloat(limiteInf1) && muestras[0].x <= parseFloat(limiteSup1) ? '✓' : '✗'} Aceptamos X</p>
                  </div>
                  <p className="font-bold mt-3 text-green-700">Resultado: X = {muestras[0].x} se acepta como muestra valida</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Tabla de Resultados</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border p-3">N°</th>
                    <th className="border p-3">Valor R</th>
                    {funcion2 && <th className="border p-3">Funcion Usada</th>}
                    <th className="border p-3">Valor X Calculado</th>
                  </tr>
                </thead>
                <tbody>
                  {muestras.map((muestra) => (
                    <tr key={muestra.n} className={muestra.n % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="border p-2 text-center">{muestra.n}</td>
                      <td className="border p-2 text-center">{muestra.r}</td>
                      {funcion2 && <td className="border p-2 text-center">{muestra.funcionUsada}</td>}
                      <td className="border p-2 text-center">{muestra.x}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
