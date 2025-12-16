import { useMemo } from 'react';
import type { SamplePoint } from '../../core/types/Sample';

interface PDFCurve {
  xmin: number;
  xmax: number;
  pdf: (x: number) => number;
  color: string;
  label: string;
}

interface SamplePlotProps {
  samples: SamplePoint[];
  curves: PDFCurve[];
  width?: number;
  height?: number;
  title?: string;
}

export default function SamplePlot({
  samples,
  curves,
  width = 800,
  height = 500,
  title = 'Gráfico de Puntos Generados'
}: SamplePlotProps) {
  
  const curvePoints = useMemo(() => {
    return curves.map(curve => {
      const points = [];
      const numPoints = 100;
      for (let i = 0; i <= numPoints; i++) {
        const x = curve.xmin + (curve.xmax - curve.xmin) * (i / numPoints);
        const y = curve.pdf(x);
        points.push({ x, y });
      }
      return { ...curve, points };
    });
  }, [curves]);

  const plotPoints = useMemo(() => {
    return samples.map(s => ({
      x: s.x,
      y: s.y !== undefined ? s.y : (s.fx || 0),
      accepted: s.accepted || false,
      i: s.i
    }));
  }, [samples]);

  const { minX, maxX, minY, maxY } = useMemo(() => {
    const allX = [
      ...curvePoints.flatMap(c => c.points.map(p => p.x)),
      ...plotPoints.map(p => p.x)
    ];
    const allY = [
      ...curvePoints.flatMap(c => c.points.map(p => p.y)),
      ...plotPoints.map(p => p.y)
    ];

    return {
      minX: Math.min(...allX),
      maxX: Math.max(...allX),
      minY: 0,
      maxY: Math.max(...allY) * 1.1
    };
  }, [curvePoints, plotPoints]);

  const padding = 60;
  const graphWidth = width - 2 * padding;
  const graphHeight = height - 2 * padding;

  const scaleX = (x: number) => 
    padding + ((x - minX) / (maxX - minX)) * graphWidth;
  
  const scaleY = (y: number) => 
    height - padding - ((y - minY) / (maxY - minY)) * graphHeight;

  const createPath = (points: { x: number; y: number }[]) => {
    return points.map((p, i) => 
      `${i === 0 ? 'M' : 'L'} ${scaleX(p.x)} ${scaleY(p.y)}`
    ).join(' ');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4 text-blue-800">{title}</h3>
      
      <div className="flex justify-center">
        <svg width={width} height={height} className="border border-gray-300 rounded">
          {/* Fondo */}
          <rect x={padding} y={padding} width={graphWidth} height={graphHeight} fill="#f9fafb" />
          
          {/* Ejes */}
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
          
          {/* Curvas PDF */}
          {curvePoints.map((curve, idx) => (
            <path 
              key={idx}
              d={createPath(curve.points)} 
              fill="none" 
              stroke={curve.color} 
              strokeWidth="2"
            />
          ))}
          
          {/* Puntos de muestra */}
          {plotPoints.map((punto, idx) => (
            <circle
              key={idx}
              cx={scaleX(punto.x)}
              cy={scaleY(punto.y)}
              r="4"
              fill={punto.accepted ? '#10b981' : '#ef4444'}
              stroke="#fff"
              strokeWidth="1"
              opacity="0.8"
            >
              <title>
                Simulación {punto.i}: ({punto.x.toFixed(3)}, {punto.y.toFixed(3)}) - {punto.accepted ? 'Aceptado' : 'Rechazado'}
              </title>
            </circle>
          ))}
          
          {/* Etiquetas ejes */}
          <text x={width / 2} y={height - 15} textAnchor="middle" fontSize="14" fontWeight="bold">
            X
          </text>
          <text x={20} y={height / 2} textAnchor="middle" fontSize="14" fontWeight="bold" 
                transform={`rotate(-90, 20, ${height / 2})`}>
            Y
          </text>
        
          {/* Ticks eje X */}
          {[0, 0.25, 0.5, 0.75, 1].map((factor) => {
            const x = minX + (maxX - minX) * factor;
            const xPos = scaleX(x);
            return (
              <g key={`x-${factor}`}>
                <line x1={xPos} y1={height - padding} x2={xPos} y2={height - padding + 5} 
                      stroke="#374151" strokeWidth="1" />
                <text x={xPos} y={height - padding + 20} textAnchor="middle" fontSize="12">
                  {x.toFixed(2)}
                </text>
              </g>
            );
          })}
          
          {/* Ticks eje Y */}
          {[0, 0.25, 0.5, 0.75, 1].map((factor) => {
            const y = minY + (maxY - minY) * factor;
            const yPos = scaleY(y);
            return (
              <g key={`y-${factor}`}>
                <line x1={padding - 5} y1={yPos} x2={padding} y2={yPos} 
                      stroke="#374151" strokeWidth="1" />
                <text x={padding - 10} y={yPos + 4} textAnchor="end" fontSize="12">
                  {y.toFixed(2)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    
      {/* Leyenda */}
      <div className="mt-4 flex justify-center gap-6 flex-wrap">
        {curves.map((curve, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className="w-6 h-1" style={{ backgroundColor: curve.color }}></div>
            <span className="text-sm">{curve.label}</span>
          </div>
        ))}
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