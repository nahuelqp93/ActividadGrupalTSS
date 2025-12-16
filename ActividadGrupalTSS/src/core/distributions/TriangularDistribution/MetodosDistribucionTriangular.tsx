import { useState } from 'react';
import MetodoRechazo from './MetodoRechazo';
import  MetodoComposicion from './MetodoComposicion';
import MetodoInversa from './MetodoInversa';

interface MetodosDistribucionesProps {
  onCerrar: () => void;
}

export default function MetodosDistribuciones({ onCerrar }: MetodosDistribucionesProps) {
  const [metodoActual, setMetodoActual] = useState(1);

  const metodos = [
    { num: 1, nombre: 'Rechazo', color: 'blue' },
    { num: 2, nombre: 'Composición', color: 'purple' },
    { num: 3, nombre: 'Transformada Inversa', color: 'green' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header con navegación */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Métodos de Generación de Variables Aleatorias
            </h1>
            <button
              onClick={onCerrar}
              className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
            >
              ✕ Cerrar
            </button>
          </div>

          {/* Navegación entre métodos (1/3, 2/3, 3/3) */}
          <div className="flex items-center justify-center gap-3">
            {metodos.map((metodo, idx) => (
              <div key={metodo.num} className="flex items-center">
                <button
                  onClick={() => setMetodoActual(metodo.num)}
                  className={`
                    relative px-8 py-4 rounded-xl font-bold transition-all duration-300
                    ${metodoActual === metodo.num
                      ? `bg-${metodo.color}-600 text-white shadow-2xl scale-110 ring-4 ring-${metodo.color}-300`
                      : `bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105`
                    }
                  `}
                  style={{
                    backgroundColor: metodoActual === metodo.num 
                      ? metodo.color === 'blue' ? '#2563eb' 
                        : metodo.color === 'purple' ? '#9333ea' 
                        : '#16a34a'
                      : undefined
                  }}
                >
                  <div className="flex items-center gap-3">
                    
                    <div className="text-left">
                      <div className="text-xs opacity-80 font-normal">
                        Método {metodo.num}/3
                      </div>
                      <div className="text-base font-bold">
                        {metodo.nombre}
                      </div>
                    </div>
                  </div>
                </button>

                {idx < metodos.length - 1 && (
                  <div className="mx-4 text-gray-400 text-3xl font-bold">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contenido del método actual */}
        <div>
          {metodoActual === 1 && <MetodoRechazo />}
          {metodoActual === 2 && <MetodoComposicion />}
          {metodoActual === 3 && <MetodoInversa />}
        </div>
      </div>
    </div>
  );
}