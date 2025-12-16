export interface SamplePoint {
  i: number;           // índice de simulación
  u: number;           // uniforme principal
  u2?: number;         // segundo uniforme (solo rechazo)
  x: number;           // valor generado
  y?: number;          // altura del punto (rechazo)
  fx?: number;         // densidad evaluada
  accepted?: boolean;  // solo rechazo
}
