import { useState, useEffect, useRef } from 'react';
import { evaluate } from 'mathjs';
import GenerarMuestras from '../../../modules/distribuciones/GenerarMuestras.tsx';

export default function Distribuciones() {
  const [ecuacion1, setEcuacion1] = useState('x/400 - 19/40');
  const [ecuacion2, setEcuacion2] = useState('23/40 - x/400');
  const [limiteInf1, setLimiteInf1] = useState('190');
  const [limiteSupf1, setLimiteSup1] = useState('210');
  const [limiteInf2, setLimiteInf2] = useState('210');
  const [limiteSupf2, setLimiteSup2] = useState('230');
  const [error, setError] = useState('');
  const [mostrarGenerarMuestras, setMostrarGenerarMuestras] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    dibujarGraficas();
  }, [ecuacion1, ecuacion2, limiteInf1, limiteSupf1, limiteInf2, limiteSupf2]);

  const evaluarFuncion = (ecuacion: string, x: number): number | null => {
    try {
      const resultado = evaluate(ecuacion, { x });
      return typeof resultado === 'number' ? resultado : null;
    } catch (e) {
      return null;
    }
  };

  const dibujarGraficas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const minX1 = parseFloat(limiteInf1) || 0;
    const maxX1 = parseFloat(limiteSupf1) || 1;
    const minX2 = parseFloat(limiteInf2) || 1;
    const maxX2 = parseFloat(limiteSupf2) || 2;
    const minX = Math.min(minX1, minX2);
    const maxX = Math.max(maxX1, maxX2);
    const rangoX = maxX - minX;
    
    let minY = Infinity;
    let maxY = -Infinity;
    const numSamples = 200;
    
    for (let i = 0; i <= numSamples; i++) {
      const x1 = minX1 + (maxX1 - minX1) * (i / numSamples);
      const y1 = evaluarFuncion(ecuacion1, x1);
      if (y1 !== null && isFinite(y1) && y1 >= 0) {
        minY = Math.min(minY, y1);
        maxY = Math.max(maxY, y1);
      }
      
      const x2 = minX2 + (maxX2 - minX2) * (i / numSamples);
      const y2 = evaluarFuncion(ecuacion2, x2);
      if (y2 !== null && isFinite(y2) && y2 >= 0) {
        minY = Math.min(minY, y2);
        maxY = Math.max(maxY, y2);
      }
    }

    if (!isFinite(minY) || !isFinite(maxY)) {
      minY = 0;
      maxY = 5;
    }
    minY = 0;
    const rangoY = maxY - minY;
    maxY = maxY + rangoY * 0.1;

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
    const stepY = maxY / 10;
    for (let i = 0; i <= 10; i++) {
      const yValue = i * stepY;
      const y = originY - yValue * scaleY;
      ctx.beginPath();
      ctx.moveTo(originX - 5, y);
      ctx.lineTo(originX + 5, y);
      ctx.stroke();
      ctx.fillText(yValue.toFixed(2), originX - 10, y);
    }
    try {
      ctx.strokeStyle = '#3B82F6'; 
      ctx.lineWidth = 2;
      ctx.beginPath();
      let primerPunto = true;

      for (let px = originX; px < width; px++) {
        const x = minX + (px - originX) / scaleX;
        
        if (x >= minX1 && x <= maxX1) {
          const y = evaluarFuncion(ecuacion1, x);

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
      setError('');
    } catch (e) {
      setError('Error al graficar la función 1');
    }

    try {
      ctx.strokeStyle = '#EF4444'; 
      ctx.lineWidth = 2;
      ctx.beginPath();
      let primerPunto = true;

      for (let px = originX; px < width; px++) {
        const x = minX + (px - originX) / scaleX;
        
        if (x >= minX2 && x <= maxX2) {
          const y = evaluarFuncion(ecuacion2, x);

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
    } catch (e) {
      setError('Error al graficar la función 2');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Graficador de Funciones
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Función 1
          </label>
          <input
            type="text"
            value={ecuacion1}
            onChange={(e) => setEcuacion1(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none mb-2"
            placeholder="Ej: sin(x), x^2, 2*x + 1"
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium mb-1">Límite Inferior</label>
              <input
                type="number"
                value={limiteInf1}
                onChange={(e) => setLimiteInf1(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Límite Superior</label>
              <input
                type="number"
                value={limiteSupf1}
                onChange={(e) => setLimiteSup1(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none"
                placeholder="10"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
           Inserta la ecuacion f1(x) y sus limites
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Función 2 
          </label>
          <input
            type="text"
            value={ecuacion2}
            onChange={(e) => setEcuacion2(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none mb-2"
            placeholder="Ej: cos(x), x^3, -x + 2"
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium mb-1">Límite Inferior</label>
              <input
                type="number"
                value={limiteInf2}
                onChange={(e) => setLimiteInf2(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Límite Superior</label>
              <input
                type="number"
                value={limiteSupf2}
                onChange={(e) => setLimiteSup2(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none"
                placeholder="10"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Inserta la ecuacion f2(x) y sus limites
          </p>
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={() => setMostrarGenerarMuestras(!mostrarGenerarMuestras)}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          {mostrarGenerarMuestras ? 'Ocultar Generador' : 'Generar Muestras'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-4">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="border border-gray-300 rounded justify-center mx-auto"
        />
      </div>

      <div className="mt-4 flex gap-4 items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-1 bg-blue-500"></div>
          <span className="text-sm">Función 1: {ecuacion1}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-1 bg-red-500"></div>
          <span className="text-sm">Función 2: {ecuacion2}</span>
        </div>
      </div>

      {mostrarGenerarMuestras && (
        <div className="mt-6">
          <GenerarMuestras
            ecuacion1={ecuacion1}
            ecuacion2={ecuacion2}
            limiteInf1={parseFloat(limiteInf1)}
            limiteSupf1={parseFloat(limiteSupf1)}
            limiteInf2={parseFloat(limiteInf2)}
            limiteSupf2={parseFloat(limiteSupf2)}
            onCerrar={() => setMostrarGenerarMuestras(false)}
          />
        </div>
      )}
    </div>
  );
}