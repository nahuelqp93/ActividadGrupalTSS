import type { ResultadoInversa } from "./inversa";

export function exponencialInversa(lambda: number): ResultadoInversa {

  return {
    pasos: [
      {
        titulo: "Paso 1: Función de densidad",
        descripcion: `f(x) = ${lambda} e^{-${lambda}x},   x ≥ 0`
      },
      {
        titulo: "Paso 2: Función acumulada",
        descripcion: `F(x) = 1 - e^{-${lambda}x}`
      },
      {
        titulo: "Paso 3: Igualar F(x) = R",
        descripcion: `1 - e^{-${lambda}x} = R`
      },
      {
        titulo: "Paso 4: Función inversa",
        descripcion: `x = -ln(1 - R) / ${lambda}`
      }
    ],

    formula: `x = -ln(1 - R) / ${lambda}`,

    generar: (R: number) => -Math.log(1 - R) / lambda
  };
}
