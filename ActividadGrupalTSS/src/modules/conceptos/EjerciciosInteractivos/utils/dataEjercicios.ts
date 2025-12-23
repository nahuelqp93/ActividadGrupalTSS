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
      },
      {
        nombre: 'Método de Rechazo (Caso 2)',
        descripcion: 'Algoritmo de Aceptación-Rechazo con función lineal decreciente.',
        ruta: '/conceptos/ejercicios/rechazo2',
        metodo: 'Rechazo',
        distribucion: 'Función Mixta'
      }
    ]
  },
  {
    id: 2,
    titulo: 'Aplicaciones de Simulacion',
    descripcion: 'Simulación de eventos discretos.',
    icon: Users,
    theme: 'emerald',
    ejercicios: [
      {
        nombre: 'Colas en Serie',
        descripcion: 'Flujo secuencial con llegadas Poisson y tiempos de servicio heterogéneos.',
        ruta: '/conceptos/ejercicios-interactivos/colas-serie',
        tipo: 'Serie',
        configuracion: '2 Estaciones'
      },
      {
        nombre: 'Sistema Multi-servidor',
        descripcion: 'Banco con cola única y múltiples servidores trabajando en paralelo.',
        ruta: '/conceptos/ejercicios-interactivos/multiservidor',
        tipo: 'Paralelo',
        servidores: '3 Cajeros'
      },
      {
        nombre: 'Capacidad Limitada',
        descripcion: 'Sistema con rechazo de clientes por saturación de espacio (Parking).',
        ruta: '/conceptos/ejercicios-interactivos/parking',
        tipo: 'Bloqueo',
        capacidad: '6 Lugares'
      },
      {
        nombre: 'Renta de Autos',
        descripcion: 'Determinar el número óptimo de autos a comprar mediante simulación.',
        ruta: '/conceptos/ejercicios/colas-renta-autos',
        tipo: 'Optimización',
      },
      {
        nombre: 'Interferencia Flecha-Cojinete',
        descripcion: 'Calcular la probabilidad de interferencia en un ensamble usando distribuciones normales.',
        ruta: '/conceptos/ejercicios/interferencia-flecha',
        tipo: 'Control de Calidad',
      },
      {
        nombre: 'Políticas de Inventario',
        descripcion: 'Comparar dos estrategias de reabastecimiento para identificar la mas economica.',
        ruta: '/conceptos/ejercicios/politicas-inventario',
        tipo: 'Optimización',
      },
      {
        nombre: 'Políticas de Mantenimiento',
        descripcion: 'Determinar la política más económica para reemplazo de componentes electrónicos.',
        ruta: '/conceptos/ejercicios/mantenimiento-componentes',
        tipo: 'Optimización',
      }
    ]
  }
];