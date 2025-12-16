import { evaluate } from 'mathjs';
import { useMemo } from 'react';

interface Muestra {
  simulacion: number;
  r1: number;
  r2: number;
  x: number;
  fx: number;
  fmax: number;
  estado: string;
}

interface GraficoHistogramaProps {
  muestras: Muestra[];
  ecuacion1: string;
  ecuacion2: string;
  limiteInf1: number;
  limiteSupf1: number;
  limiteInf2: number;
  limiteSupf2: number;
}

export default function GraficoHistograma({
  muestras,
  ecuacion1,
  ecuacion2,
  limiteInf1,
  limiteSupf1,
  limiteInf2,
  limiteSupf2,
}: GraficoHistogramaProps) {
  
  const evaluarFuncion = (ecuacion: string, x: number): number => {
    try {
      const resultado = evaluate(ecuacion, { x });
      return typeof resultado === 'number' ? resultado : 0;
    } catch (e) {
      return 0;
    }
  };

  const puntosGrafico = useMemo(() => {
    return muestras.map(muestra => {
      let y: number;
      if (muestra.estado === 'Aceptado') {
        if (muestra.x < limiteSupf1) {
          y = evaluarFuncion(ecuacion1, muestra.x);
        } else {
          y = evaluarFuncion(ecuacion2, muestra.x);
        }
      } else {
        y = muestra.r2 * 1/muestra.fmax;
      }
      
      return {
        x: muestra.x,
        y: y,
        estado: muestra.estado,
        simulacion: muestra.simulacion
      };
    });
  }, [muestras, ecuacion1, ecuacion2, limiteInf1, limiteSupf1]);

  const puntosFunc1 = useMemo(() => {
    const puntos = [];
    const numPuntos = 100;
    for (let i = 0; i <= numPuntos; i++) {
      const x = limiteInf1 + (limiteSupf1 - limiteInf1) * (i / numPuntos);
      const y = evaluarFuncion(ecuacion1, x);
      puntos.push({ x, y });
    }
    return puntos;
  }, [ecuacion1, limiteInf1, limiteSupf1]);

  const puntosFunc2 = useMemo(() => {
    const puntos = [];
    const numPuntos = 100;
    for (let i = 0; i <= numPuntos; i++) {
      const x = limiteInf2 + (limiteSupf2 - limiteInf2) * (i / numPuntos);
      const y = evaluarFuncion(ecuacion2, x);
      puntos.push({ x, y });
    }
    return puntos;
  }, [ecuacion2, limiteInf2, limiteSupf2]);

  const { minX, maxX, minY, maxY } = useMemo(() => {
    const todosX = [...puntosFunc1.map(p => p.x), ...puntosFunc2.map(p => p.x), ...puntosGrafico.map(p => p.x)];
    const todosY = [...puntosFunc1.map(p => p.y), ...puntosFunc2.map(p => p.y), ...puntosGrafico.map(p => p.y)];
    
    return {
      minX: Math.min(...todosX),
      maxX: Math.max(...todosX),
      minY: 0,
      maxY: Math.max(...todosY) * 1.1
    };
  }, [puntosFunc1, puntosFunc2, puntosGrafico]);

  const width = 800;
  const height = 500;
  const padding = 60;
  const graphWidth = width - 2 * padding;
  const graphHeight = height - 2 * padding;

  const escalaX = (x: number) => padding + ((x - minX) / (maxX - minX)) * graphWidth;
  const escalaY = (y: number) => height - padding - ((y - minY) / (maxY - minY)) * graphHeight;

  const crearPath = (puntos: { x: number; y: number }[]) => {
    return puntos.map((p, i) => 
      `${i === 0 ? 'M' : 'L'} ${escalaX(p.x)} ${escalaY(p.y)}`
    ).join(' ');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4 text-blue-800">Grafico de Puntos Generados</h3>
      
      <div className="flex justify-center">
        <svg width={width} height={height} className="border border-gray-300 rounded">
          <rect x={padding} y={padding} width={graphWidth} height={graphHeight} fill="#f9fafb" />
          
          <line 
            x1={padding} y1={height - padding} 
            x2={width - padding} y2={height - padding} 
            stroke="#374151" strokeWidth="2" 
          />
          <line 
            x1={padding} y1={padding} 
            x2={padding} y2={height - padding} 
            stroke="#374151" strokeWidth="2" 
          />
          
          <path 
            d={crearPath(puntosFunc1)} 
            fill="none" 
            stroke="#3b82f6" 
            strokeWidth="2"
          />
          
          <path 
            d={crearPath(puntosFunc2)} 
            fill="none" 
            stroke="#ef4444" 
            strokeWidth="2"
          />
          
          {puntosGrafico.map((punto, idx) => (
            <circle
              key={idx}
              cx={escalaX(punto.x)}
              cy={escalaY(punto.y)}
              r="4"
              fill={punto.estado === 'Aceptado' ? '#10b981' : '#ef4444'}
              stroke="#fff"
              strokeWidth="1"
              opacity="0.8"
            >
              <title>
                Simulacion {punto.simulacion}: ({punto.x.toFixed(3)}, {punto.y.toFixed(3)}) - {punto.estado}
              </title>
            </circle>
          ))}
          
          <text x={width / 2} y={height - 15} textAnchor="middle" fontSize="14" fontWeight="bold">
            X
          </text>
          
          <text x={20} y={height / 2} textAnchor="middle" fontSize="14" fontWeight="bold" transform={`rotate(-90, 20, ${height / 2})`}>
            Y
          </text>
        
          {[0, 0.25, 0.5, 0.75, 1].map((factor) => {
            const x = minX + (maxX - minX) * factor;
            const xPos = escalaX(x);
            return (
              <g key={factor}>
                <line x1={xPos} y1={height - padding} x2={xPos} y2={height - padding + 5} stroke="#374151" strokeWidth="1" />
                <text x={xPos} y={height - padding + 20} textAnchor="middle" fontSize="12">
                  {x.toFixed(2)}
                </text>
              </g>
            );
          })}
          
          {[0, 0.25, 0.5, 0.75, 1].map((factor) => {
            const y = minY + (maxY - minY) * factor;
            const yPos = escalaY(y);
            return (
              <g key={factor}>
                <line x1={padding - 5} y1={yPos} x2={padding} y2={yPos} stroke="#374151" strokeWidth="1" />
                <text x={padding - 10} y={yPos + 4} textAnchor="end" fontSize="12">
                  {y.toFixed(2)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    
      <div className="mt-4 flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-1 bg-blue-500"></div>
          <span className="text-sm">Función 1</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-1 bg-red-500"></div>
          <span className="text-sm">Función 2</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm">Aceptado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-sm">Rechazado</span>
        </div>
      </div>
    </div>
  );
}
