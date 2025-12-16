export interface Paso {
  titulo: string;
  descripcion: string;
}

export interface ResultadoInversa {
  pasos: Paso[];
  formula: string;
  generar: (R: number) => number;
}