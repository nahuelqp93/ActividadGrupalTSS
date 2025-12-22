import { Layers, TrendingUp} from 'lucide-react';

export const sections = [
  {
    id: 1,
    title: 'Variables Aleatorias',
    icon: Layers,
    color: 'blue',
    description: 'El bloque constructor de la simulación. Aprende cómo convertimos la incertidumbre del mundo real en números.',
    topics: [
      {
        name: 'Introducción a las variables aleatorias',
        path: '/conceptos/variables-aleatorias/introduccion',
        description: '¿Qué son exactamente? Entiende la notación básica y por qué son útiles.',
        badge: 'Básico'
      },
      {
        name: 'Variables aleatorias Discretas',
        path: '/conceptos/variables-aleatorias/discretas',
        description: 'Cuando los resultados se pueden contar (ej. número de clientes, fallas).',
        badge: 'Fundamental'
      },
      {
        name: 'Variables aleatorias Continuas',
        path: '/conceptos/variables-aleatorias/continuas',
        description: 'Cuando los resultados se miden (ej. tiempo, peso, distancia).',
        badge: 'Fundamental'
      }
    ]
  },
  {
    id: 2,
    title: 'Funciones de Probabilidad',
    icon: TrendingUp,
    color: 'emerald', // Cambié a emerald que es un verde más moderno
    description: 'Las herramientas matemáticas que nos dicen qué tan probable es que ocurra un evento.',
    topics: [
      {
        name: 'Función de Densidad (PDF)',
        path: '/conceptos/funciones/pdf',
        description: 'El "mapa" que nos muestra dónde se concentran las probabilidades.',
        badge: 'Teoría'
      },
      {
        name: 'Función Acumulada (CDF)',
        path: '/conceptos/funciones/cdf',
        description: 'Clave para la simulación: nos dice la probabilidad acumulada hasta un punto.',
        badge: 'Clave Simulación'
      }
    ]
  }
];