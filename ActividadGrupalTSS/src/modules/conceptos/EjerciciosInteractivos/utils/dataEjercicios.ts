import { Layers, Users } from 'lucide-react';

// --- Tipos e Interfaces ---
export interface EjercicioBase {
  nombre: string;
  descripcion: string;
  ruta: string;
}

// Extendemos para propiedades dinámicas (flexibilidad de TS)
export interface Ejercicio extends EjercicioBase {
  [key: string]: string | number; 
}

export interface Categoria {
  id: number;
  titulo: string;
  descripcion: string;
  icon: React.ElementType; // Tipo para componentes de iconos
  theme: 'blue' | 'emerald';
  ejercicios: Ejercicio[];
}

// --- Datos Estáticos ---
export const categorias: Categoria[] = [
  {
    id: 1,
    titulo: 'Generación de Variables Aleatorias',
    descripcion: 'Métodos estocásticos para transformar números pseudoaleatorios en distribuciones específicas.',
    icon: Layers,
    theme: 'blue',
    ejercicios: [
      {
        nombre: 'Método de la Transformada Inversa',
        descripcion: 'Generación de variables con distribución Triangular usando la inversa de la CDF.',
        ruta: '/conceptos/ejercicios/transformada-inversa',
        metodo: 'Transformada Inversa',
        distribucion: 'Triangular'
      },
      {
        nombre: 'Método de Rechazo',
        descripcion: 'Algoritmo de Aceptación-Rechazo usando una función envolvente mayorante.',
        ruta: '/conceptos/ejercicios/rechazo',
        metodo: 'Rechazo',
        distribucion: 'Variable Arbitraria'
      }
    ]
  },
  {
    id: 2,
    titulo: 'Modelado de Sistemas de Colas',
    descripcion: 'Simulación de eventos discretos para analizar cuellos de botella y tiempos de espera.',
    icon: Users,
    theme: 'emerald',
    ejercicios: [
      {
        nombre: 'Colas en Serie',
        descripcion: 'Flujo secuencial con llegadas Poisson y tiempos de servicio heterogéneos.',
        ruta: '/conceptos/ejercicios/colas-serie',
        tipo: 'Serie',
        configuracion: '2 Estaciones'
      },
      {
        nombre: 'Sistema Multi-servidor',
        descripcion: 'Banco con cola única y múltiples servidores trabajando en paralelo.',
        ruta: '/conceptos/ejercicios/multiservidor',
        tipo: 'Paralelo',
        servidores: '3 Cajeros'
      },
      {
        nombre: 'Capacidad Limitada',
        descripcion: 'Sistema con rechazo de clientes por saturación de espacio (Parking).',
        ruta: '/conceptos/ejercicios/capacidad-limitada',
        tipo: 'Bloqueo',
        capacidad: '6 Lugares'
      }
    ]
  }
];