import { Line } from 'react-chartjs-2';

interface GraficoDistribucionProps {
  a: number;
  b: number;
  c: number;
  mostrarAreas?: boolean;
}

export default function GraficoDistribucion({ a, b, c, mostrarAreas = true }: GraficoDistribucionProps) {
  // Calcular altura h
  const h = 2 / (b - a + c);

  // Generar puntos para el gráfico
  const generarPuntos = () => {
    const puntos: { x: number; y: number }[] = [];
    const numPuntos = 200;
    const inicio = a - 2;
    const fin = c + 2;
    const step = (fin - inicio) / numPuntos;

    for (let i = 0; i <= numPuntos; i++) {
      const x = inicio + i * step;
      let y = 0;

      if (x >= 0 && x <= a) {
        // Segmento 1: ascendente desde 0 hasta a
        y = (h / a) * x;
      } else if (x > a && x <= b) {
        // Segmento 2: constante en h
        y = h;
      } else if (x > b && x <= c) {
        // Segmento 3: descendente desde b hasta c
        y = h * (c - x) / (c - b);
      }

      puntos.push({ x, y });
    }

    return puntos;
  };

  const puntos = generarPuntos();

  const chartData = {
    labels: puntos.map(p => p.x.toFixed(1)),
    datasets: [
      // Línea principal
      {
        label: 'f(x)',
        data: puntos.map(p => p.y),
        borderColor: 'rgb(0, 0, 0)',
        backgroundColor: 'transparent',
        borderWidth: 3,
        pointRadius: 0,
        fill: false
      },
      // Áreas coloreadas
      ...(mostrarAreas ? [
        {
          label: 'A₁ - f₁(x)',
          data: puntos.map(p => {
            if (p.x >= 0 && p.x <= a) return p.y;
            return null;
          }),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.3)',
          borderWidth: 0,
          pointRadius: 0,
          fill: 'origin'
        },
        {
          label: 'A₂ - f₂(x)',
          data: puntos.map(p => {
            if (p.x > a && p.x <= b) return p.y;
            return null;
          }),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.3)',
          borderWidth: 0,
          pointRadius: 0,
          fill: 'origin'
        },
        {
          label: 'A₃ - f₃(x)',
          data: puntos.map(p => {
            if (p.x > b && p.x <= c) return p.y;
            return null;
          }),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.3)',
          borderWidth: 0,
          pointRadius: 0,
          fill: 'origin'
        }
      ] : [])
    ]
  };

  return (
    <div className="w-full h-80">
      <Line 
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'f(x) - Densidad'
              }
            },
            x: {
              title: {
                display: true,
                text: 'x'
              },
              ticks: {
                maxTicksLimit: 15
              }
            }
          },
          plugins: {
            legend: {
              display: true
            }
          }
        }}
      />
    </div>
  );
}