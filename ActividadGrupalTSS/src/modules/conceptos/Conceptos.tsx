import { Link } from 'react-router-dom';
import { BookOpen, Layers, TrendingUp} from 'lucide-react';

export default function Conceptos() {
  const sections = [
    {
      id: 1,
      title: 'Variables Aleatorias',
      icon: Layers,
      color: 'blue',
      topics: [
        {
          name: 'Introducción a Variables Aleatorias',
          path: '/conceptos/variables-aleatorias/introduccion',
          description: '¿Qué son? Ejemplos y notación básica'
        },
        {
          name: 'Variables Aleatorias Discretas',
          path: '/conceptos/variables-aleatorias/discretas',
          description: 'Valores contables y función de masa de probabilidad'
        },
        {
          name: 'Variables Aleatorias Continuas',
          path: '/conceptos/variables-aleatorias/continuas',
          description: 'Valores en intervalos y función de densidad'
        }
      ]
    },
    {
      id: 2,
      title: 'Funciones de Probabilidad',
      icon: TrendingUp,
      color: 'green',
      topics: [
        {
          name: 'Función de Densidad (PDF/PMF)',
          path: '/conceptos/funciones/pdf',
          description: 'Distribución de probabilidades y propiedades'
        },
        {
          name: 'Función de Distribución Acumulada (CDF)',
          path: '/conceptos/funciones/cdf',
          description: 'Probabilidad acumulada y relación con PDF'
        }
      ]
    }
  ];

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      icon: 'text-blue-600',
      hover: 'hover:bg-blue-100'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-900',
      icon: 'text-green-600',
      hover: 'hover:bg-green-100'
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <BookOpen size={40} className="text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Conceptos Fundamentales
              </h1>
              <p className="text-gray-600 mt-1">
                Fundamentos de Variables Aleatorias y Distribuciones de Probabilidad
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 mt-6">
            <p className="text-sm text-gray-700">
              <strong>Objetivo:</strong> Comprender los conceptos fundamentales de variables aleatorias, 
              sus tipos (discretas y continuas), y las funciones que las describen (PDF, CDF). 
              Estos conocimientos son la base para generar distribuciones y realizar simulaciones.
            </p>
          </div>
        </div>

        {/* Secciones */}
        {sections.map((section) => {
          const colors = colorClasses[section.color as keyof typeof colorClasses];
          const Icon = section.icon;
          
          return (
            <div key={section.id} className={`bg-white rounded-lg shadow-lg p-6 border-2 ${colors.border}`}>
              <div className="flex items-center gap-3 mb-4">
                <Icon size={32} className={colors.icon} />
                <h2 className={`text-2xl font-bold ${colors.text}`}>
                  {section.id}. {section.title}
                </h2>
              </div>

              <div className="space-y-3">
                {section.topics.map((topic, idx) => (
                  <Link
                    key={idx}
                    to={topic.path}
                    className={`block p-4 ${colors.bg} rounded-lg border ${colors.border} ${colors.hover} transition-colors`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className={`font-bold ${colors.text} mb-1`}>
                          {section.id}.{idx + 1} {topic.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {topic.description}
                        </p>
                      </div>
                      <div className={`text-2xl font-bold ${colors.text} opacity-50`}>
                        →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}

        {/* Footer informativo */}
        <div className="bg-gray-100 rounded-lg p-6 border border-gray-300">
          <h3 className="font-bold text-gray-800 mb-3">Ruta de Aprendizaje Sugerida:</h3>
          <ol className="space-y-2 text-sm text-gray-700">
            <li><strong>1.1</strong> Comienza entendiendo qué es una variable aleatoria</li>
            <li><strong>1.2-1.3</strong> Aprende la diferencia entre discretas y continuas</li>
            <li><strong>2.1</strong> Comprende cómo se describen con funciones de densidad</li>
            <li><strong>2.2</strong> Domina la función de distribución acumulada</li>
          </ol>
          <p className="text-xs text-gray-500 mt-4">
            Estos conceptos te prepararán para generar distribuciones en el módulo siguiente.
          </p>
        </div>

      </div>
    </div>
  );
}