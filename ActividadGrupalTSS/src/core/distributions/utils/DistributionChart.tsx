import React from 'react';
import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

interface DistributionChartProps {
  labels: string[];
  theoreticalData: number[];
  empiricalData: number[];
}

export const DistributionChart: React.FC<DistributionChartProps> = ({ 
  labels, 
  theoreticalData, 
  empiricalData 
}) => {
  const data = {
    labels,
    datasets: [
      {
        type: 'line' as const,
        label: 'Teórico (PDF)',
        data: theoreticalData,
        borderColor: '#000000', // Negro puro
        borderWidth: 2,
        borderDash: [5, 5], // Línea punteada para diferenciar
        pointRadius: 0,
        tension: 0,
        order: 1
      },
      {
        type: 'bar' as const,
        label: 'Simulación (Frecuencia)',
        data: empiricalData,
        backgroundColor: 'rgba(75, 85, 99, 0.8)', // Gris oscuro (Slate 600)
        barPercentage: 1.0,
        categoryPercentage: 1.0,
        order: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: { family: 'ui-sans-serif, system-ui, sans-serif', size: 11 },
          color: '#374151' // Gray 700
        }
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
        cornerRadius: 2
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6b7280', font: { size: 10 } }
      },
      y: {
        grid: { color: '#e5e7eb' }, // Gray 200
        ticks: { color: '#6b7280', font: { size: 10 } }
      }
    }
  };

  return (
    <div className="h-80 w-full bg-white p-4 border border-gray-200 rounded-sm">
      <Chart type="bar" data={data} options={options} />
    </div>
  );
};