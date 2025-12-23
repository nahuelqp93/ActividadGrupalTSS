# Registro de Trabajo - Actividad Grupal TSS

## Cuadro de Trabajo Realizado

| Integrante | Rol Principal | Componentes Asignados | Actividades Específicas | Tiempo en días (diciembre) |
|------------|---------------|----------------------|-------------------------|---------------------------|
| [Tu Nombre] | Desarrollador | **Componente de Distribuciones** | Implementar la lógica matemática para el método de Transformada Inversa (Función Cuadrática). | del 15 al 16 |
| | | | Implementar la interfaz gráfica y visualización de resultados para la Transformada Inversa. | del 16 al 17 |
| | | **Componente de Simulación Aplicada** | Implementar la estructura de navegación (Tabla) para el módulo de Simulación Aplicada. | del 17 al 18 |
| | | | Implementar la lógica y tabla de simulación para el ejercicio de Inventarios (Comercializadora). | del 18 al 19 |
| | | | Implementar la lógica y tabla de simulación para el ejercicio de Colas (Sistema de Espera). | del 19 al 20 |
| | | | Integración final y revisión de estilos visuales de los módulos asignados. | del 20 al 21 |

---

## Actividades Realizadas en Detalle

### 1. Implementación del Método de Transformada Inversa (Función Cuadrática)
**Fecha:** Del 15 al 17 de diciembre  
**Archivo:** `src/core/distributions/TriangularDistribution/MetodoInversa.tsx`

#### Funcionalidades Implementadas:
- ✅ Eliminación del input de semilla (seed hardcodeado a 1234)
- ✅ Soporte para una o dos funciones PDF
- ✅ Cálculo automático de funciones inversas (no requiere input del usuario)
- ✅ Generación de números aleatorios usando LCG
- ✅ Sistema de umbral para decidir qué función usar cuando hay 2 funciones
- ✅ Manejo correcto de raíces cúbicas de números negativos
- ✅ Tabla de resultados mostrando todas las simulaciones
- ✅ Columna "Función Usada" (f1/f2) cuando hay dos funciones
- ✅ Explicación detallada de 5 pasos para la primera muestra
- ✅ Graficación de funciones PDF y puntos generados
- ✅ Diferenciación visual de puntos (azules para f1, rojos para f2)

#### Fórmulas Implementadas:
- **F1 Inversa:** `x = 3 + ∛(54R - 27)`
- **F2 Inversa:** `x = c - (c-b)√(1-R)`
- **Umbral:** `(b-a)/(c-a)` donde [a,b] es dominio de f1 y [b,c] es dominio de f2

#### Correcciones de Diseño:
- Cambio de cabecera de tabla de `bg-blue-600 text-white` a `bg-gray-200` (consistencia con otros módulos)
- Cambio de color del botón selector de `green` a `blue` en MetodosDistribucionTriangular.tsx

---

### 2. Interfaz Gráfica del Método de Transformada Inversa
**Fecha:** Del 16 al 17 de diciembre

#### Implementaciones Visuales:
- Canvas de 800x600 píxeles para graficación
- Sistema de coordenadas con ejes X e Y escalados
- Graficación de curvas PDF (azul para f1, rojo para f2)
- Puntos generados coloreados según la función que los generó
- Leyenda visual indicando qué representa cada color
- Sección de pasos detallados con formato de tarjetas
- Verificación automática de validez de muestras

---

### 3. Implementación del Ejercicio 8: Optimización de Equipo de Descarga de Camiones
**Fecha:** Del 18 al 19 de diciembre  
**Archivo:** `src/modules/simulacion/aplicacion/Ejercicio8.tsx`

#### Descripción del Problema:
Simulación de un sistema de descarga de camiones para determinar el tamaño óptimo del equipo que minimice el costo total (espera + operación).

#### Funcionalidades:
- ✅ Simulación con equipos de 1, 2 y 3 personas
- ✅ Llegadas con distribución exponencial (λ camiones/hora)
- ✅ Tiempos de servicio uniformes divididos por tamaño del equipo
- ✅ Tabla comparativa de costos
- ✅ Identificación automática de la mejor opción
- ✅ Tablas detalladas por equipo con todos los eventos
- ✅ Cálculo de tiempo de espera total y promedio
- ✅ Cálculo de costos (espera + equipo)

#### Parámetros Configurables:
- Tasa de llegada (λ)
- Duración del turno (horas)
- Tiempo mínimo y máximo de servicio
- Costo por hora de espera
- Costo por hora del equipo

#### Fórmulas Usadas:
```
T_entre_llegadas = -ln(1-R) / λ
T_servicio = (min + R(max - min)) / tamaño_equipo
Costo_espera = (Tiempo_espera_total / 60) × costo_hora
Costo_equipo = horas_turno × costo_hora × tamaño
Costo_total = Costo_espera + Costo_equipo
```

---

### 4. Implementación del Ejercicio 9: Optimización de Equipo de Descarga Portuaria
**Fecha:** Del 19 al 20 de diciembre  
**Archivo:** `src/modules/simulacion/aplicacion/Ejercicio9.tsx`

#### Descripción del Problema:
Simulación de descarga de barcos en un puerto para determinar el tamaño óptimo del equipo durante un período de simulación.

#### Funcionalidades:
- ✅ Simulación con equipos de 1 a 5 personas
- ✅ Llegadas con distribución exponencial (λ barcos/día)
- ✅ Tiempos de descarga uniformes divididos por tamaño del equipo
- ✅ Sección teórica explicando el método
- ✅ Tabla comparativa de costos
- ✅ Identificación de la mejor opción
- ✅ Tablas detalladas mostrando primeros 20 eventos por equipo
- ✅ Diseño consistente con otros ejercicios

#### Parámetros Configurables:
- Tasa de llegada de barcos (λ barcos/día)
- Días de simulación
- Tiempo mínimo y máximo de descarga (horas)
- Costo por hora de espera de barco
- Costo por hora del equipo

#### Teoría Incluida:
- Simulación de eventos discretos
- Cálculo de costos
- Análisis de trade-off (equipos grandes vs. espera)

---

### 5. Integración y Configuración de Rutas
**Fecha:** Del 20 al 21 de diciembre

#### Archivos Modificados:
1. **Routes.tsx**
   - Agregados imports para Ejercicio8 y Ejercicio9
   - Agregadas rutas `/simulacion/aplicacion/ejercicio-8` y `ejercicio-9`

2. **LayoutAplicacion.tsx**
   - Actualizado array de ejercicios (ahora 9 en total)
   - Barra de progreso ajustada automáticamente

---

### 6. Correcciones de Estilo y Consistencia Visual
**Fecha:** 21 de diciembre

#### Cambios Realizados:
1. **Colores de Tablas:**
   - Cabeceras cambiadas de `bg-blue-600 text-white` y `bg-green-600 text-white` a `bg-gray-200`
   - Aplicado en: Ejercicio8.tsx, Ejercicio9.tsx, MetodoInversa.tsx

2. **Botones de Navegación:**
   - Color del botón "Transformada Inversa" cambiado de verde a azul
   - Aplicado en: MetodosDistribucionTriangular.tsx

3. **Limpieza de Código:**
   - Eliminadas variables no utilizadas (`a`, `b`, `valor`, `rng`)
   - Resueltas advertencias de TypeScript

---

## Estructura de Archivos Creados/Modificados

```
src/
├── core/
│   └── distributions/
│       └── TriangularDistribution/
│           ├── MetodoInversa.tsx .......................... [MODIFICADO]
│           └── MetodosDistribucionTriangular.tsx .......... [MODIFICADO]
│
├── modules/
│   └── simulacion/
│       ├── aplicacion/
│       │   ├── Ejercicio8.tsx ............................. [CREADO]
│       │   └── Ejercicio9.tsx ............................. [CREADO]
│       └── utils/
│           └── LayoutAplicacion.tsx ....................... [MODIFICADO]
│
└── Routes.tsx ............................................. [MODIFICADO]
```

---

## Tecnologías y Herramientas Utilizadas

- **React** con TypeScript
- **Hooks:** `useState`, `useEffect`, `useRef`
- **mathjs** para evaluación de funciones matemáticas
- **Canvas API** para graficación
- **Tailwind CSS** para estilos
- **LCG (Linear Congruential Generator)** para números aleatorios
- **Git** para control de versiones

---

## Fórmulas Matemáticas Clave

### Método de Transformada Inversa:
```
R ~ U(0,1)
X = F⁻¹(R)
```

### Distribución Exponencial:
```
T = -ln(1-R) / λ
```

### Distribución Uniforme:
```
T = a + R(b-a)
```

### Función Cuadrática Inversa:
```
F(x) = (x-3)²/18  para x ∈ [0,6]
F⁻¹(R) = 3 + ∛(54R - 27)
```

---

## Commits Realizados

1. `"ej8 y 9 de ejercicios aplicacion"` - Creación de Ejercicios 8 y 9
2. Correcciones de estilo y diseño en tablas
3. Cambio de color del botón Transformada Inversa
4. Limpieza de variables no utilizadas

---

## Pruebas Realizadas

✅ Generación de muestras con 1 función  
✅ Generación de muestras con 2 funciones  
✅ Verificación de que todas las filas aparecen en la tabla  
✅ Verificación de que los puntos se grafican correctamente  
✅ Verificación de colores diferentes para f1 y f2  
✅ Verificación de pasos detallados de la primera muestra  
✅ Simulación de Ejercicio 8 con diferentes configuraciones  
✅ Simulación de Ejercicio 9 con diferentes tamaños de equipo  
✅ Navegación entre ejercicios usando botones Anterior/Siguiente  
✅ Consistencia visual con el trabajo de otros integrantes  

---

## Problemas Resueltos

1. ❌ **Problema:** Tabla mostraba solo filas 1, 3, 5 en lugar de todas
   - ✅ **Solución:** Corregido loop de generación de muestras

2. ❌ **Problema:** Valores NaN en columna X
   - ✅ **Solución:** Implementada función `calcularRaizCubica` para manejar negativos

3. ❌ **Problema:** Puntos solo se graficaban en función 1
   - ✅ **Solución:** Evaluar la función correcta según `muestra.funcionUsada`

4. ❌ **Problema:** Colores inconsistentes con otros módulos
   - ✅ **Solución:** Cambiadas cabeceras a `bg-gray-200`

5. ❌ **Problema:** Advertencias de variables no utilizadas
   - ✅ **Solución:** Eliminadas declaraciones innecesarias

---

## Conclusiones

- Se implementaron exitosamente 3 componentes completos
- Se mantuvo consistencia visual con el trabajo del equipo
- Se aplicaron buenas prácticas de desarrollo (código limpio, sin warnings)
- Se documentaron todas las fórmulas y algoritmos utilizados
- Se probaron exhaustivamente todas las funcionalidades
- El código es mantenible y extensible para futuras mejoras

---

**Fecha de finalización:** 21 de diciembre de 2025  
**Estado:** ✅ Completado y testeado
