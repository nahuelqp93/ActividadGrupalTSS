# Prompt para Generación de Diagramas del Sistema de Simulación

Necesito que generes 2 diagramas en formato Mermaid para mi sistema COMPLETO de simulación estadística en React + TypeScript:

---

## DIAGRAMA 1: FLUJO DE EJECUCIÓN COMPLETO DEL SISTEMA

Crea un diagrama de flujo (flowchart) que muestre TODOS los flujos de usuario desde el entry point. Debe tener múltiples ramas según la funcionalidad elegida:

### FLUJO PRINCIPAL (Inicialización):
```
Usuario abre aplicación
   ↓
main.tsx → App.tsx → BrowserRouter + NavBar
   ↓
Usuario selecciona en NavBar → Decisión: ¿Qué módulo?
   ├─ Conceptos
   ├─ Distribuciones
   └─ Simulación
```

### RAMA 1: MÓDULO CONCEPTOS (Educativo)
```
Submódulo → Decisión:
   ├─ Variables Aleatorias → Introducción/Discretas/Continuas → Renderizar teoría
   ├─ Funciones → PDF/CDF → Renderizar explicaciones matemáticas
   ├─ Pruebas de Aleatoriedad → Decisión: ¿Qué prueba?
   │   ├─ Prueba de Media → Ingresar n, semilla → LCG genera U(0,1) → Calcular Z=(X̄-0.5)/(σ/√n) → Decisión: |Z|<1.96? → Aprueba/Falla
   │   ├─ Prueba Chi-Cuadrado → Generar datos → Dividir en 10 bins → Calcular χ²=Σ(O-E)²/E → Decisión: χ²<16.919? → Aprueba/Falla
   │   ├─ Prueba de Corridas → Generar secuencia → Contar corridas → Calcular Z=(R-μᵣ)/σᵣ → Decisión: |Z|<1.96? → Aprueba/Falla
   │   └─ Prueba de Autocorrelación → Calcular ρₖ para lag=1,2,5 → Z=ρₖ√n → Decisión: |Z|<1.96? → Aprueba/Falla
   └─ Teoría de Colas → M/M/1 o M/M/c → Renderizar fórmulas y ejemplos
```

### RAMA 2: MÓDULO DISTRIBUCIONES
```
Categoría → Decisión: ¿Continua o Discreta?
   ├─ CONTINUAS → Decisión: ¿Cuál distribución?
   │   ├─ Normal:
   │   │   Usuario ingresa μ, σ, n, semilla → handleGenerate()
   │   │   → BoxMullerGenerator(seed) → new LCG(seed)
   │   │   → Loop n veces:
   │   │      ├─ ¿Tiene spare? → Retornar spare
   │   │      └─ Else: u1, u2 = LCG.next() → R=√(-2ln(u1)) → θ=2πu2
   │   │         → z0=R·cos(θ), z1=R·sin(θ) [cache] → X=μ+σz0
   │   │   → Calcular media empírica, varianza empírica
   │   │   → Generar histograma (30 bins) + PDF teórica
   │   │   → Renderizar gráficas + comparación estadísticas
   │   │
   │   ├─ Exponencial:
   │   │   Usuario ingresa λ, n, semilla → LCG genera U(0,1)
   │   │   → Transformación inversa: X=-ln(1-U)/λ
   │   │   → Calcular estadísticas → Renderizar histograma + PDF
   │   │
   │   ├─ Uniforme:
   │   │   Usuario ingresa a, b, n, semilla → LCG genera U(0,1)
   │   │   → Transformación: X=a+(b-a)U
   │   │   → Renderizar histograma + PDF
   │   │
   │   └─ Triangular:
   │       Usuario ingresa a, b, c, n, semilla → LCG genera U(0,1)
   │       → Decisión: U < F(c)?
   │          ├─ SÍ: X=a+√(U(b-a)(c-a))
   │          └─ NO: X=b-√((1-U)(b-a)(b-c))
   │       → Renderizar histograma + PDF
   │
   └─ DISCRETAS → Decisión: ¿Cuál distribución?
       ├─ Binomial:
       │   Usuario ingresa n, p, repeticiones, semilla
       │   → Loop repeticiones veces:
       │      → Método convolucional: Generar n Bernoulli(p)
       │      → X = suma de Bernoullis
       │   → Calcular frecuencias → Renderizar PMF empírica vs teórica
       │
       ├─ Poisson:
       │   Usuario ingresa λ, repeticiones, semilla
       │   → Loop repeticiones veces:
       │      → Método de Knuth: L=e^(-λ), k=0, p=1
       │      → While p>L: k++, U~U(0,1), p=p·U
       │      → Retornar k-1
       │   → Renderizar PMF empírica vs teórica
       │
       └─ Bernoulli:
           Usuario ingresa p, repeticiones, semilla
           → Loop: U~U(0,1) → Decisión: U≤p? → X=1 : X=0
           → Calcular proporción de 1s → Comparar con p teórico
```

### RAMA 3: MÓDULO SIMULACIÓN
```
Tipo → Decisión: ¿Aplicación o Método de Composición?
   │
   ├─ APLICACIONES (7 Ejercicios de Colas):
   │   Usuario selecciona Ejercicio 1-7 → LayoutAplicacion (HOC wrapper)
   │   
   │   EJEMPLO: Ejercicio 1 (M/M/1 → M/M/1):
   │   Usuario ingresa λ=20/h, μ₁=2min, U[1,2]min, n_clientes, semilla
   │   → Inicializar LCG(semilla) → Tabla vacía
   │   → Loop i=1 to n_clientes:
   │      ├─ Generar tiempo entre llegadas: T_llegada = -ln(1-U)/λ
   │      ├─ Acumular: T_llegada_i = T_llegada_i-1 + T_llegada
   │      ├─ Generar servicio 1: S₁ = -ln(1-U)/μ₁
   │      ├─ Calcular inicio_S1 = max(T_llegada_i, fin_S1_anterior)
   │      ├─ Calcular fin_S1 = inicio_S1 + S₁
   │      ├─ Generar servicio 2: S₂ = 1 + (2-1)·U
   │      ├─ Calcular inicio_S2 = max(fin_S1, fin_S2_anterior)
   │      ├─ Calcular fin_S2 = inicio_S2 + S₂
   │      ├─ Calcular esperas: Wq1 = inicio_S1 - T_llegada_i
   │      ├─ Calcular esperas: Wq2 = inicio_S2 - fin_S1
   │      └─ Registrar en tabla
   │   → Calcular promedios: W̄q1, W̄q2, W̄_total, ρ₁, ρ₂
   │   → Renderizar TablaIteraciones + Gráficas + Métricas
   │   → Botones: Anterior/Siguiente ejercicio (navegación)
   │
   └─ MÉTODO DE COMPOSICIÓN:
       **Fase 1: Configuración**
       Usuario ingresa segmentos: [id, xmin, xmax, formula]
       → Acciones: addSegment(), removeSegment(), updateSegment()
       
       **Fase 2: Validación (Click "Analizar")**
       handleAnalyze() → Pre-validaciones locales
       → Decisión: ¿segments.length > 0 y todos con fórmula?
          ├─ NO → Error → Return
          └─ SÍ → SegmentValidator.validateSegments(segments)
                  → Chain of Responsibility (5 validaciones):
                     1. validateFormulas() → mathjs.parse() → catch SyntaxError
                     2. detectNegativeValues() → muestrear 50 puntos → detectar negativos
                     3. checkAreas() → integración trapecio 1000 pasos → detectar área=0
                     4. checkContinuity() → comparar xmax[i] vs xmin[i+1]
                     5. generateSuggestions() → ranking de confianza [0-1]
                  → ValidationResult {isValid, issues[], suggestions[], areas[], negativeValues[]}
                  → Decisión: ¿isValid?
                     ├─ NO → Mostrar reporte → Botón "Excavación Automática"
                     └─ SÍ → Proceder a análisis
       
       **Fase 3: Excavación Automática (Opcional - Click "Excavación")**
       handleAutoExcavate() → SegmentValidator.autoExcavate(segments, max=3)
       → Loop (while iteration < 3 && !isValid):
          ├─ Ordenar sugerencias por confianza DESC
          ├─ Aplicar mejor sugerencia (SCALE/SHIFT/REPLACE/CLAMP)
          ├─ Re-validar segmentos modificados
          ├─ Decisión: ¿isValid? → Break : Continue
          └─ iteration++
       → Return {fixedSegments, appliedFixes[], finalValidation}
       → Actualizar estado: setSegments(fixedSegments)
       → Re-trigger validación
       
       **Fase 4: Análisis Numérico (Si válido)**
       Para cada segmento i:
          → Calcular área[i] = ∫[xmin,xmax] f(x)dx (trapecio)
       → totalArea = Σareas
       → normalizationFactor = 1/totalArea
       → Calcular probabilidades acumuladas: cumulativeProbs[i] = Σ(areas[0..i])/totalArea
       → Generar gráfica de f(x) completa
       → setAnalyzed(true)
       
       **Fase 5: Simulación (Click "Generar X")**
       handleGenerate()
       → r1 = Math.random() → Seleccionar segmento i donde cumulativeProbs[i-1] < r1 ≤ cumulativeProbs[i]
       → Construir CDF del segmento i numéricamente (integración)
       → r2 = Math.random()
       → Inversión por bisección:
          left=xmin[i], right=xmax[i], tol=1e-6, maxIter=100
          While |F(mid)-r2| > tol:
             mid = (left+right)/2
             Decisión: F(mid) < r2? → left=mid : right=mid
          Return mid
       → x = resultado de bisección
       → SimulationResult {r1, r2, segmentIndex, x, description}
       → Agregar a historial → Renderizar resultado paso a paso
```

### FLUJO DE NAVEGACIÓN TRANSVERSAL:
```
En cualquier momento:
   Usuario click en NavBar link
   → useNavigate('/nueva-ruta')
   → React Router desmonta componente actual (PÉRDIDA DE ESTADO)
   → Monta nuevo componente (estado fresco)
   → Ciclo de vida: useState() → useEffect() → render()
```

**ELEMENTOS CRÍTICOS DEL DIAGRAMA:**
- Usar diamantes para TODAS las decisiones
- Usar rectángulos para procesos
- Usar cilindros para datos/estado
- Usar paralelogramos para inputs/outputs
- Incluir loops con flechas de retorno
- Etiquetar condiciones en flechas (SÍ/NO, valores específicos)
- Mostrar puntos de error/retry

---

## DIAGRAMA 2: ARQUITECTURA COMPLETA DE COMPONENTES

Crea un diagrama de arquitectura mostrando TODOS los componentes del sistema organizados por capas con todas las interacciones:

### ESTRUCTURA POR CAPAS (usar subgraphs con colores):

**CAPA INFRASTRUCTURE (gris):**
```
main.tsx (Entry Point)
   ↓
App.tsx (BrowserRouter + Layout)
   ├→ NavBar (sidebar persistente)
   └→ Routes.tsx (22 rutas)
```

**CAPA PAGES (amarillo):**
```
Home.tsx (landing page)
Ayuda.tsx (documentación)
```

**CAPA MODULES - CONCEPTOS (verde claro):**
```
modules/conceptos/
   ├─ Conceptos.tsx (root)
   ├─ variablesAleatorias/
   │   ├─ Introduccion.tsx
   │   ├─ Discretas.tsx
   │   └─ Continuas.tsx
   ├─ funciones/
   │   ├─ PDF.tsx
   │   └─ CDF.tsx
   ├─ pruebasAleatoriedad/
   │   ├─ PruebaMedia.tsx
   │   ├─ PruebaChiCuadrado.tsx
   │   ├─ PruebaCorridas.tsx
   │   └─ PruebaAutocorrelacion.tsx
   ├─ teoriaColas/
   │   ├─ MM1.tsx
   │   └─ MMc.tsx
   ├─ components/ (tarjetas, visualizaciones)
   └─ data/ (contenido estático)
```

**CAPA MODULES - DISTRIBUCIONES (verde medio):**
```
modules/distribuciones/
(delega a core/distributions/)
```

**CAPA MODULES - SIMULACIÓN (verde oscuro):**
```
modules/simulacion/
   ├─ ComposicionView.tsx [usa: SegmentValidator, bisectionMethod, numericalIntegration]
   ├─ aplicacion/
   │   ├─ Ejercicio1.tsx (M/M/1→M/M/1) [usa: LCG, Exponential, Uniform]
   │   ├─ Ejercicio2.tsx [usa: LCG, distribuciones]
   │   ├─ Ejercicio3.tsx [usa: LCG, distribuciones]
   │   ├─ Ejercicio4.tsx [usa: LCG, distribuciones]
   │   ├─ Ejercicio5.tsx [usa: LCG, distribuciones]
   │   ├─ Ejercicio6.tsx [usa: LCG, distribuciones]
   │   └─ Ejercicio7.tsx [usa: LCG, distribuciones]
   └─ utils/
       ├─ LayoutAplicacion.tsx (HOC - wrapper con navegación)
       ├─ TablaIteraciones.tsx (renderiza resultados)
       └─ Enunciado.tsx (muestra problema)
```

**CAPA COMPONENTS (amarillo):**
```
components/
   └─ NavBar.tsx (navegación principal con menús colapsables)
```

**CAPA CORE - DISTRIBUTIONS (azul claro):**
```
core/distributions/
   ├─ continuas/
   │   ├─ NormalDistribution.tsx [usa: BoxMullerGenerator, LCG, recharts]
   │   ├─ ExponentialDistribution.tsx [usa: LCG, inverse transform]
   │   ├─ UniformDistribution.tsx [usa: LCG, direct transform]
   │   └─ TriangularDistribution.tsx [usa: LCG, inverse by cases]
   └─ discretas/
       ├─ BinomialDistribution.tsx [usa: LCG, convolutional method]
       ├─ PoissonDistribution.tsx [usa: LCG, Knuth method]
       └─ BernoulliDistribution.tsx [usa: LCG, direct comparison]
```

**CAPA CORE - METHODS (azul medio):**
```
core/methods/
   ├─ boxMuller.ts
   │   └─ class BoxMullerGenerator
   │       ├─ constructor(seed) → inicializa LCG
   │       ├─ next(μ, σ) → genera N(μ,σ²)
   │       ├─ nextStandard() → genera N(0,1)
   │       └─ hasSpare (caché de segundo valor)
   ├─ numericalIntegration.ts (regla del trapecio, 1000 pasos)
   └─ bisectionMethod.ts (tolerancia 1e-6, max 100 iter)
```

**CAPA CORE - RANDOM (azul oscuro):**
```
core/random/
   ├─ lcg.ts
   │   └─ class LCG
   │       ├─ private state: number
   │       ├─ constructor(seed, a=1664525, c=1013904223, m=2³²)
   │       ├─ next(): number → retorna U(0,1)
   │       └─ setSeed(seed): void
   ├─ sistema.ts (configuraciones predefinidas de LCG)
   └─ useLCG.ts (React hook para integrar LCG)
```

**CAPA CORE - VALIDATION (azul profundo):**
```
core/validation/
   └─ SegmentValidator.ts
       └─ static methods:
           ├─ validateSegments(segments) → orchestrator principal
           ├─ validateFormulas(segments) → mathjs.parse()
           ├─ detectNegativeValues(segments) → muestreo 50 puntos
           ├─ checkAreas(segments) → integración numérica
           ├─ checkContinuity(segments) → verificar gaps
           ├─ generateSuggestions(issues) → confidence ranking
           └─ autoExcavate(segments, maxIter=3) → iterative fixing
               ├─ Loop: sort by confidence → apply fix → re-validate
               └─ Tipos de fix: SCALE, SHIFT, REPLACE, CLAMP
```

**CAPA CORE - TYPES (azul muy claro):**
```
core/types/
   ├─ Segment.ts
   ├─ ValidationResult.ts
   ├─ SimulationResult.ts
   └─ DistributionParams.ts
```

**CAPA UTILS (gris claro):**
```
utils/
   ├─ formatters.ts
   ├─ helpers.ts
   └─ constants.ts
```

### DEPENDENCIAS EXTERNAS (mostrar como nodos externos):
```
react (presentación + estado)
react-router-dom (navegación)
mathjs (parsing de fórmulas)
recharts (visualización de datos)
typescript (type system)
```

### FLUJO DE DEPENDENCIAS (flechas etiquetadas):
```
main.tsx → App.tsx → Routes.tsx → Pages → Modules → Core
                  ↓
                NavBar

Modules/simulacion → Core/validation (SegmentValidator)
                   → Core/random (LCG)
                   → Core/methods (boxMuller, integration, bisection)

Modules/distribuciones → Core/distributions → Core/random (LCG)
                                           → Core/methods (BoxMullerGenerator)

Core/distributions → recharts (visualización)
Core/validation → mathjs (parsing)

REGLA: Core NUNCA importa de Modules/Components/Pages (unidirectional)
```

### PATRONES A ETIQUETAR EN EL DIAGRAMA:
```
[Strategy] en core/methods/ (Box-Muller, Inverse Transform, Convolutional)
[Chain of Responsibility] en SegmentValidator.validateSegments()
[Template Method] en estructura de Distribution components
[HOC] en LayoutAplicacion
[Observer] en useState/useEffect (React nativo)
[Command] en handlers (handleAnalyze, handleGenerate, addSegment, etc.)
[Facade] en SegmentValidator (oculta 5 validaciones)
[Adapter] en mathjs wrapper
[Singleton-like] en LCG (estado encapsulado)
[Factory] implícito en distributions (createGenerator pattern)
[Composite] en jerarquía de modules/conceptos/
```

### INFORMACIÓN ADICIONAL:

**Algoritmos clave (anotar en nodos correspondientes):**
- LCG: Xₙ₊₁ = (1664525·Xₙ + 1013904223) mod 2³²
- Box-Muller: R=√(-2ln(U₁)), θ=2πU₂, Z₀=R·cos(θ), Z₁=R·sin(θ)
- Exponencial: X = -ln(1-U)/λ
- Binomial: X = Σⁿᵢ₌₁ Bernoulli(p)
- Poisson (Knuth): while p>e^(-λ): k++, p=p·U
- Trapecio: ∫f(x)dx ≈ h[f(a)/2 + Σf(xᵢ) + f(b)/2], h=(b-a)/1000
- Bisección: while |F(mid)-target|>1e-6: mid=(left+right)/2, ajustar bounds

**Validaciones (anotar en SegmentValidator):**
1. Sintaxis de fórmulas (mathjs)
2. Valores negativos (50 samples)
3. Áreas no nulas (integración)
4. Continuidad (xmax[i] = xmin[i+1])
5. Sugerencias por confianza

**Pruebas estadísticas (anotar en modules/conceptos/pruebasAleatoriedad/):**
1. Media: Z = (X̄-0.5)/(σ/√n), |Z|<1.96
2. Chi²: χ² = Σ(Oᵢ-Eᵢ)²/Eᵢ, χ²<16.919 (df=9)
3. Corridas: Z = (R-μᵣ)/σᵣ, |Z|<1.96
4. Autocorrelación: Z = ρₖ√n, |Z|<1.96 para lag=1,2,5

---

## ESPECIFICACIONES TÉCNICAS:

- Usar Mermaid syntax
- Flujo: `flowchart TD` con múltiples ramas
- Arquitectura: `graph TD` con `subgraph` por cada capa
- Colores: Core (azul), Modules (verde), Components/Pages (amarillo), Infrastructure (gris)
- Flechas etiquetadas: `-->|"usa"| `, `-->|"importa"|`, `-->|"valida"|`
- Incluir leyenda de patrones
- Mostrar ciclos de vida (mount/unmount)

---

## OBJETIVO:

Genera ambos diagramas COMPLETOS con TODAS las funcionalidades y componentes del sistema. Los diagramas deben ser profesionales, detallados y servir como documentación técnica completa del sistema de simulación estadística.
