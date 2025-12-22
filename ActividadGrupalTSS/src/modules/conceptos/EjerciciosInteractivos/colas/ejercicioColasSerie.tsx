import { useState } from 'react';
import {  BookOpen, Calculator, Users, Play, HelpCircle, ArrowRight} from 'lucide-react';
import { BlockMath} from 'react-katex';
import 'katex/dist/katex.min.css';
import { Link } from 'react-router-dom';

interface DistributionInfo {
  name: string;
  formula: string;
  description: string;
  link: string;
  color: string; // 'blue' | 'green' | 'purple'
}

const DistributionCard = ({ 
  info, 
  children 
}: { 
  info: DistributionInfo, 
  children: React.ReactNode 
}) => {
  // Mapas de colores para manejar estilos dinámicos de Tailwind
  const colors: any = {
    blue:   { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', icon: 'text-blue-500', hoverBorder: 'group-hover:border-blue-400' },
    green:  { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', icon: 'text-green-500', hoverBorder: 'group-hover:border-green-400' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900', icon: 'text-purple-500', hoverBorder: 'group-hover:border-purple-400' },
  };

  const style = colors[info.color];

  return (
    <div className={`relative group p-4 rounded-lg border transition-all duration-300 ${style.bg} ${style.border} ${style.hoverBorder} hover:shadow-md`}>
      
      {/* 1. Encabezado de la Tarjeta */}
      <div className="flex justify-between items-start mb-3">
        <h3 className={`font-bold text-sm ${style.text}`}>{info.name}</h3>
        
        {/* 2. El Disparador (Icono ?) */}
        <div className="relative">
          <HelpCircle size={18} className={`${style.icon} cursor-help opacity-70 hover:opacity-100 transition-opacity`} />
          
          {/* 3. El Popover (Tarjeta Flotante) - Se muestra con group-hover del padre o hover propio */}
          <div className="absolute right-0 top-6 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto text-left">
            
            {/* Contenido del Popover */}
            <div className="mb-3">
              <h4 className="text-slate-900 font-bold text-sm mb-1">{info.name}</h4>
              <p className="text-xs text-slate-500 mb-2">{info.description}</p>
              <div className="bg-slate-50 rounded p-2 text-xs text-slate-800 border border-slate-100">
                <BlockMath math={info.formula} />
              </div>
            </div>

            {/* Botón Ver Más */}
            <Link 
              to={info.link}
              className={`flex items-center gap-1 text-xs font-bold ${style.text} hover:underline mt-2`}
            >
              Ver lección completa <ArrowRight size={12} />
            </Link>

            {/* Triangulito decorativo arriba */}
            <div className="absolute -top-2 right-1 w-4 h-4 bg-white border-t border-l border-slate-200 transform rotate-45"></div>
          </div>
        </div>
      </div>

      {/* 4. El contenido original de la tarjeta (parámetros) */}
      <div className="space-y-2 text-xs relative z-0">
        {children}
      </div>
    </div>
  );
};

interface IteracionCola {
  i: number;
  R1: string;
  tiempoEntreLlegadas: number;
  tiempoLlegada: number;
  R2: string;
  tiempoServicio1: number;
  inicioServicio1: number;
  finServicio1: number;
  tiempoEspera1: number;
  R3: string;
  tiempoServicio2: number;
  inicioServicio2: number;
  finServicio2: number;
  tiempoEspera2: number;
  tiempoTotalSistema: number;
}

export default function EjercicioColasSerie() {
  const [simulacion, setSimulacion] = useState<IteracionCola[]>([]);
  const [mostrarSimulacion, setMostrarSimulacion] = useState(false);
  const [numClientes] = useState(20);

  // Parámetros del problema
  const lambdaLlegadas = 20; // clientes por hora
  const lambdaPorMinuto = lambdaLlegadas / 60; // convertir a por minuto
  const mediaServicio1 = 2; // minutos
  const limInfServicio2 = 1; // minutos
  const limSupServicio2 = 2; // minutos

  // Generador LCG
  const createLCG = (initialSeed: number) => {
    let current = initialSeed;
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);
    return () => {
      current = (a * current + c) % m;
      return current / m;
    };
  };

  // Simulación
  const simularColas = () => {
    const rng = createLCG(1234);
    const resultados: IteracionCola[] = [];
    
    let tiempoLlegadaAnterior = 0;
    let finServicio1Anterior = 0;
    let finServicio2Anterior = 0;

    for (let i = 1; i <= numClientes; i++) {
      // PASO 1-3: Generar tiempo entre llegadas (Poisson -> Exponencial)
      const R1 = rng();
      const tiempoEntreLlegadas = -Math.log(R1) / lambdaPorMinuto;
      const tiempoLlegada = tiempoLlegadaAnterior + tiempoEntreLlegadas;

      // PASO 4-6: Servicio en Estación 1 (Exponencial)
      const R2 = rng();
      const tiempoServicio1 = -mediaServicio1 * Math.log(R2);
      const inicioServicio1 = Math.max(tiempoLlegada, finServicio1Anterior);
      const finServicio1 = inicioServicio1 + tiempoServicio1;
      const tiempoEspera1 = inicioServicio1 - tiempoLlegada;

      // PASO 7-9: Servicio en Estación 2 (Uniforme)
      const R3 = rng();
      const tiempoServicio2 = limInfServicio2 + (limSupServicio2 - limInfServicio2) * R3;
      const inicioServicio2 = Math.max(finServicio1, finServicio2Anterior);
      const finServicio2 = inicioServicio2 + tiempoServicio2;
      const tiempoEspera2 = inicioServicio2 - finServicio1;

      // PASO 10: Tiempo total en el sistema
      const tiempoTotalSistema = finServicio2 - tiempoLlegada;

      resultados.push({
        i,
        R1: R1.toFixed(4),
        tiempoEntreLlegadas,
        tiempoLlegada,
        R2: R2.toFixed(4),
        tiempoServicio1,
        inicioServicio1,
        finServicio1,
        tiempoEspera1,
        R3: R3.toFixed(4),
        tiempoServicio2,
        inicioServicio2,
        finServicio2,
        tiempoEspera2,
        tiempoTotalSistema
      });

      // Actualizar para siguiente iteración
      tiempoLlegadaAnterior = tiempoLlegada;
      finServicio1Anterior = finServicio1;
      finServicio2Anterior = finServicio2;
    }

    setSimulacion(resultados);
    setMostrarSimulacion(true);
  };

  // Cálculos de resultados
  const tiempoPromedioSistema = simulacion.length > 0
    ? simulacion.reduce((sum, it) => sum + it.tiempoTotalSistema, 0) / simulacion.length
    : 0;

  const tiempoPromedioEspera1 = simulacion.length > 0
    ? simulacion.reduce((sum, it) => sum + it.tiempoEspera1, 0) / simulacion.length
    : 0;

  const tiempoPromedioEspera2 = simulacion.length > 0
    ? simulacion.reduce((sum, it) => sum + it.tiempoEspera2, 0) / simulacion.length
    : 0;

  const colaMaxima1 = simulacion.length > 0
    ? Math.max(...simulacion.map(it => it.tiempoEspera1))
    : 0;

  const colaMaxima2 = simulacion.length > 0
    ? Math.max(...simulacion.map(it => it.tiempoEspera2))
    : 0;

  const colaMayor = tiempoPromedioEspera1 > tiempoPromedioEspera2 ? 'Estación 1' : 'Estación 2';

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

       

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Ejercicio 1: Sistema de Colas en Serie
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Simulación de dos estaciones secuenciales con llegadas Poisson
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <Users size={32} className="text-blue-600" />
          </div>
        </div>

        {/* Enunciado */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-blue-600"/>
            Enunciado del Problema
          </h2>
          <p className="text-slate-700 leading-relaxed">
            Se tiene un sistema de colas formado por <strong>dos estaciones en serie</strong>. 
            Los clientes atendidos en la primera estación pasan en seguida a formar cola en la segunda.
          </p>
          <ul className="mt-3 space-y-2 text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Estación 1:</strong> Llegadas con distribución Poisson (λ = 20 clientes/hora) 
              y servicio exponencial (μ = 2 minutos promedio)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">•</span>
              <span><strong>Estación 2:</strong> Servicio con distribución uniforme entre 1 y 2 minutos</span>
            </li>
          </ul>
          
          <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
            <p className="font-bold text-yellow-900 mb-2">Preguntas:</p>
            <ol className="list-decimal list-inside space-y-1 text-slate-700">
              <li>¿Cuál es el tiempo promedio en el sistema?</li>
              <li>¿Cuál de las dos colas que se forman es mayor?</li>
            </ol>
          </div>
        </div>

        {/* Diagrama del Sistema */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Diagrama del Sistema</h2>
          <div className="flex items-center justify-center gap-6 p-6 bg-slate-50 rounded-lg">
            {/* Llegadas */}
            <div className="text-center">
              <div className="bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl mb-2">
                λ
              </div>
              <p className="text-xs text-slate-700 font-semibold">Llegadas<br/>(Poisson)</p>
              <p className="text-xs text-slate-600 mt-1">20/hora</p>
            </div>

            <div className="flex-1 border-t-4 border-dashed border-blue-400"></div>

            {/* Estación 1 */}
            <div className="text-center">
              <div className="bg-green-500 text-white rounded-lg p-4 font-bold text-lg mb-2">
                Estación 1
              </div>
              <p className="text-xs text-slate-700 font-semibold">Servicio<br/>(Exponencial)</p>
              <p className="text-xs text-slate-600 mt-1">μ = 2 min</p>
            </div>

            <div className="flex-1 border-t-4 border-dashed border-green-400"></div>

            {/* Estación 2 */}
            <div className="text-center">
              <div className="bg-purple-500 text-white rounded-lg p-4 font-bold text-lg mb-2">
                Estación 2
              </div>
              <p className="text-xs text-slate-700 font-semibold">Servicio<br/>(Uniforme)</p>
              <p className="text-xs text-slate-600 mt-1">[1, 2] min</p>
            </div>

            <div className="flex-1 border-t-4 border-dashed border-purple-400"></div>

            {/* Salida */}
            <div className="text-center">
              <div className="bg-slate-600 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl mb-2">
                →
              </div>
              <p className="text-xs text-slate-700 font-semibold">Salida</p>
            </div>
          </div>
        </div>

        {/* Datos del Problema */}
        {/* Datos del Problema */}
<div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
  <h2 className="text-lg font-bold text-slate-800 mb-4">Parámetros del Sistema</h2>
  
  <div className="grid md:grid-cols-3 gap-4">
    
    {/* TARJETA 1: LLEGADAS (POISSON) */}
    <DistributionCard
      info={{
        name: "Llegadas (Poisson)",
        color: "blue",
        formula: "P(x) = \\frac{e^{-\\lambda}\\lambda^x}{x!}", // Fórmula de Poisson
        description: "Modela el número de eventos (llegadas) que ocurren en un intervalo de tiempo fijo.",
        link: "/distribuciones/discretas/poisson"
      }}
    >
      <div className="flex justify-between">
        <span className="text-slate-600">Tasa (λ):</span>
        <span className="font-bold">{lambdaLlegadas} clientes/hora</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-600">Tasa por minuto:</span>
        <span className="font-bold">{lambdaPorMinuto.toFixed(4)}/min</span>
      </div>
      <div className="mt-3 p-2 bg-white/60 rounded text-xs">
        <span className="text-slate-500 block mb-1">Generador (Exponencial):</span>
        <BlockMath math="T_{llegada} = -\frac{\ln(R_1)}{\lambda}" />
      </div>
    </DistributionCard>

    {/* TARJETA 2: ESTACIÓN 1 (EXPONENCIAL) */}
    <DistributionCard
      info={{
        name: "Servicio (Exponencial)",
        color: "green",
        formula: "f(x) = \\mu e^{-\\mu x}", // PDF Exponencial
        description: "Describe el tiempo entre eventos en un proceso de Poisson (tiempo de servicio).",
        link: "/distribuciones/continuas/exponencial"
      }}
    >
      <div className="flex justify-between">
        <span className="text-slate-600">Media (μ):</span>
        <span className="font-bold">{mediaServicio1} minutos</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-600">Distribución:</span>
        <span className="font-bold">Exponencial</span>
      </div>
      <div className="mt-3 p-2 bg-white/60 rounded text-xs">
        <span className="text-slate-500 block mb-1">Generador:</span>
        <BlockMath math="T_{serv1} = -\mu \ln(R_2)" />
      </div>
    </DistributionCard>

    {/* TARJETA 3: ESTACIÓN 2 (UNIFORME) */}
    <DistributionCard
      info={{
        name: "Servicio (Uniforme)",
        color: "purple",
        formula: "f(x) = \\frac{1}{b-a}", // PDF Uniforme
        description: "Todos los intervalos de la misma longitud tienen la misma probabilidad.",
        link: "/distribuciones/continuas/uniforme"
      }}
    >
      <div className="flex justify-between">
        <span className="text-slate-600">Límite inferior (a):</span>
        <span className="font-bold">{limInfServicio2} minuto</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-600">Límite superior (b):</span>
        <span className="font-bold">{limSupServicio2} minutos</span>
      </div>
      <div className="mt-3 p-2 bg-white/60 rounded text-xs">
        <span className="text-slate-500 block mb-1">Generador:</span>
        <BlockMath math="T_{serv2} = a + (b-a) R_3" />
      </div>
    </DistributionCard>

  </div>
</div>
        

        {/* Pasos de la Simulación */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Pasos de la Simulación</h2>
          
          <div className="space-y-3">
            {/* Paso 1 */}
            <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
              <p className="font-bold text-blue-900 text-sm">Paso 1: Generar número aleatorio R₁</p>
              <p className="text-xs text-slate-600 mt-1">
                R₁ ← GeneradorCongruencialMixto()
              </p>
            </div>

            {/* Paso 2 */}
            <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
              <p className="font-bold text-blue-900 text-sm">Paso 2: Calcular tiempo entre llegadas</p>
              <p className="text-xs text-slate-600 mt-1">
                Tiempo_Entre_Llegadas = -ln(R₁) / λ
              </p>
            </div>

            {/* Paso 3 */}
            <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
              <p className="font-bold text-blue-900 text-sm">Paso 3: Calcular tiempo de llegada acumulado</p>
              <p className="text-xs text-slate-600 mt-1">
                Tiempo_Llegada = Tiempo_Llegada_Anterior + Tiempo_Entre_Llegadas
              </p>
            </div>

            {/* Paso 4 */}
            <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
              <p className="font-bold text-green-900 text-sm">Paso 4: Generar número aleatorio R₂ para Estación 1</p>
              <p className="text-xs text-slate-600 mt-1">
                R₂ ← GeneradorCongruencialMixto()
              </p>
            </div>

            {/* Paso 5 */}
            <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
              <p className="font-bold text-green-900 text-sm">Paso 5: Calcular tiempo de servicio en Estación 1</p>
              <p className="text-xs text-slate-600 mt-1">
                Tiempo_Servicio₁ = -μ × ln(R₂) = -2 × ln(R₂)
              </p>
            </div>

            {/* Paso 6 */}
            <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
              <p className="font-bold text-green-900 text-sm">Paso 6: Determinar inicio y fin de servicio en Estación 1</p>
              <p className="text-xs text-slate-600 mt-1">
                Inicio_Servicio₁ = max(Tiempo_Llegada, Fin_Servicio₁_Anterior)
              </p>
              <p className="text-xs text-slate-600">
                Fin_Servicio₁ = Inicio_Servicio₁ + Tiempo_Servicio₁
              </p>
            </div>

            {/* Paso 7 */}
            <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-500">
              <p className="font-bold text-purple-900 text-sm">Paso 7: Generar número aleatorio R₃ para Estación 2</p>
              <p className="text-xs text-slate-600 mt-1">
                R₃ ← GeneradorCongruencialMixto()
              </p>
            </div>

            {/* Paso 8 */}
            <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-500">
              <p className="font-bold text-purple-900 text-sm">Paso 8: Calcular tiempo de servicio en Estación 2</p>
              <p className="text-xs text-slate-600 mt-1">
                Tiempo_Servicio₂ = 1 + (2-1) × R₃
              </p>
            </div>

            {/* Paso 9 */}
            <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-500">
              <p className="font-bold text-purple-900 text-sm">Paso 9: Determinar inicio y fin de servicio en Estación 2</p>
              <p className="text-xs text-slate-600 mt-1">
                Inicio_Servicio₂ = max(Fin_Servicio₁, Fin_Servicio₂_Anterior)
              </p>
              <p className="text-xs text-slate-600">
                Fin_Servicio₂ = Inicio_Servicio₂ + Tiempo_Servicio₂
              </p>
            </div>

            {/* Paso 10 */}
            <div className="p-3 bg-orange-50 rounded border-l-4 border-orange-500">
              <p className="font-bold text-orange-900 text-sm">Paso 10: Calcular tiempo total en el sistema</p>
              <p className="text-xs text-slate-600 mt-1">
                Tiempo_Total_Sistema = Fin_Servicio₂ - Tiempo_Llegada
              </p>
            </div>

            {/* Paso 11 */}
            <div className="p-3 bg-slate-100 rounded border-l-4 border-slate-500">
              <p className="font-bold text-slate-900 text-sm">Paso 11: Repetir para todos los clientes</p>
              <p className="text-xs text-slate-600 mt-1">
                Volver al Paso 1 para el siguiente cliente
              </p>
            </div>
          </div>
        </div>

        {/* Simulador */}
        <div className="bg-slate-900 text-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Simulador</h3>
            <Calculator size={24} className="text-slate-400" />
          </div>
          
          <div className="p-3 bg-slate-800 border border-slate-700 rounded mb-6">
            <label className="block text-sm text-slate-400 mb-1">Número de clientes a simular:</label>
            <p className="text-2xl font-bold text-white">{numClientes} clientes</p>
          </div>
          
          <button 
            onClick={simularColas}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all flex justify-center items-center gap-2 shadow-md active:scale-95"
          >
            <Play size={20} />
            Iniciar Simulación con {numClientes} Clientes
          </button>
        </div>

        {/* Tabla de Resultados */}
        {mostrarSimulacion && simulacion.length > 0 && (
          <>
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                  Tabla de Simulación - Sistema en Serie
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-700 text-white">
                    <tr>
                      <th rowSpan={2} className="px-2 py-2 border border-slate-600">Cliente</th>
                      <th colSpan={3} className="px-2 py-2 border border-slate-600 bg-black">Llegadas</th>
                      <th colSpan={5} className="px-2 py-2 border border-slate-600 bg-black">Estación 1</th>
                      <th colSpan={5} className="px-2 py-2 border border-slate-600 bg-black">Estación 2</th>
                      <th rowSpan={2} className="px-2 py-2 border border-slate-600 bg-black">
                        Tiempo<br/>Total
                      </th>
                    </tr>
                    <tr>
                      {/* Llegadas */}
                      <th className="px-2 py-2 border border-slate-600 text-[10px] bg-blue-500">R₁</th>
                      <th className="px-2 py-2 border border-slate-600 text-[10px] bg-blue-500">Entre<br/>Llegadas</th>
                      <th className="px-2 py-2 border border-slate-600 text-[10px] bg-blue-500">T. Llegada</th>
                      
                      {/* Estación 1 */}
                      <th className="px-2 py-2 border border-slate-600 text-[10px] bg-green-500">R₂</th>
                      <th className="px-2 py-2 border border-slate-600 text-[10px] bg-green-500">T. Servicio</th>
                      <th className="px-2 py-2 border border-slate-600 text-[10px] bg-green-500">Inicio</th>
                      <th className="px-2 py-2 border border-slate-600 text-[10px] bg-green-500">Fin</th>
                      <th className="px-2 py-2 border border-slate-600 text-[10px] bg-green-500">Espera</th>
                      
                      {/* Estación 2 */}
                      <th className="px-2 py-2 border border-slate-600 text-[10px] bg-purple-500">R₃</th>
                      <th className="px-2 py-2 border border-slate-600 text-[10px] bg-purple-500">T. Servicio</th>
                      <th className="px-2 py-2 border border-slate-600 text-[10px] bg-purple-500">Inicio</th>
                      <th className="px-2 py-2 border border-slate-600 text-[10px] bg-purple-500">Fin</th>
                      <th className="px-2 py-2 border border-slate-600 text-[10px] bg-purple-500">Espera</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simulacion.map((iter, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-2 py-2 border text-center font-semibold">{iter.i}</td>
                        
                        {/* Llegadas */}
                        <td className="px-2 py-2 border text-center font-mono text-blue-600">{iter.R1}</td>
                        <td className="px-2 py-2 border text-center font-mono">{iter.tiempoEntreLlegadas.toFixed(2)}</td>
                        <td className="px-2 py-2 border text-center font-mono font-bold text-blue-700">
                          {iter.tiempoLlegada.toFixed(2)}
                        </td>
                        
                        {/* Estación 1 */}
                        <td className="px-2 py-2 border text-center font-mono text-green-600">{iter.R2}</td>
                        <td className="px-2 py-2 border text-center font-mono">{iter.tiempoServicio1.toFixed(2)}</td>
                        <td className="px-2 py-2 border text-center font-mono">{iter.inicioServicio1.toFixed(2)}</td>
                        <td className="px-2 py-2 border text-center font-mono font-bold text-green-700">
                          {iter.finServicio1.toFixed(2)}
                        </td>
                        <td className="px-2 py-2 border text-center font-mono">{iter.tiempoEspera1.toFixed(2)}</td>
                        
                        {/* Estación 2 */}
                        <td className="px-2 py-2 border text-center font-mono text-purple-600">{iter.R3}</td>
                        <td className="px-2 py-2 border text-center font-mono">{iter.tiempoServicio2.toFixed(2)}</td>
                        <td className="px-2 py-2 border text-center font-mono">{iter.inicioServicio2.toFixed(2)}</td>
                        <td className="px-2 py-2 border text-center font-mono font-bold text-purple-700">
                          {iter.finServicio2.toFixed(2)}
                        </td>
                        <td className="px-2 py-2 border text-center font-mono">{iter.tiempoEspera2.toFixed(2)}</td>
                        
                        {/* Total */}
                        <td className="px-2 py-2 border text-center font-mono font-bold text-orange-700">
                          {iter.tiempoTotalSistema.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-100 font-bold">
                    <tr>
                      <td colSpan={8} className="px-2 py-2 border text-right">Promedios:</td>
                      <td className="px-2 py-2 border text-center text-green-700">
                        {tiempoPromedioEspera1.toFixed(2)}
                      </td>
                      <td colSpan={4} className="px-2 py-2 border"></td>
                      <td className="px-2 py-2 border text-center text-purple-700">
                        {tiempoPromedioEspera2.toFixed(2)}
                      </td>
                      <td className="px-2 py-2 border text-center text-orange-700">
                        {tiempoPromedioSistema.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Respuestas */}
            <div className="bg-green-50 p-6 rounded-lg shadow-lg border-2 border-green-300">
              <h3 className="text-2xl font-bold text-green-900 mb-4">Respuestas al Problema</h3>
              
              <div className="space-y-4">
                {/* Respuesta 1 */}
                <div className="bg-white rounded-lg p-4 border-l-4 border-orange-500">
                  <p className="font-semibold text-slate-700 mb-2">
                    1. ¿Cuál es el tiempo promedio en el sistema?
                  </p>
                  <p className="text-3xl font-bold text-orange-700">
                    {tiempoPromedioSistema.toFixed(2)} minutos
                  </p>
                  <p className="text-sm text-slate-600 mt-2">
                    Este es el tiempo promedio que un cliente pasa desde que llega al sistema 
                    hasta que sale completamente de la Estación 2.
                  </p>
                </div>

                {/* Respuesta 2 */}
                <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
                  <p className="font-semibold text-slate-700 mb-2">
                    2. ¿Cuál de las dos colas que se forman es mayor?
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="p-3 bg-green-50 rounded border border-green-200">
                      <p className="text-sm text-slate-600">Cola Estación 1</p>
                      <p className="text-2xl font-bold text-green-700">
                        {tiempoPromedioEspera1.toFixed(2)} min
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Tiempo promedio de espera</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded border border-purple-200">
                      <p className="text-sm text-slate-600">Cola Estación 2</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {tiempoPromedioEspera2.toFixed(2)} min
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Tiempo promedio de espera</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-purple-900 mt-4">
                    La cola mayor es: {colaMayor}
                  </p>
                </div>

                {/* Análisis adicional */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-3">Análisis Adicional:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">Espera máxima Estación 1:</p>
                      <p className="font-semibold text-slate-800">{colaMaxima1.toFixed(2)} minutos</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Espera máxima Estación 2:</p>
                      <p className="font-semibold text-slate-800">{colaMaxima2.toFixed(2)} minutos</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-3">
                    <strong>Nota:</strong> En un sistema en serie, el tiempo total es la suma de los 
                    tiempos en ambas estaciones más los tiempos de espera en cada cola.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}