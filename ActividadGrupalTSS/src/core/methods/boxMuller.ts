import { LCG } from '../random/lcg';

/**
 * Método Box-Muller para generar variables aleatorias normales estándar
 * Genera dos valores normales N(0,1) a partir de dos uniformes U(0,1)
 */
export class BoxMullerGenerator {
  private lcg: LCG;
  private spare: number | null = null;
  private hasSpare: boolean = false;

  constructor(seed: number = Date.now()) {
    // Parámetros estándar del LCG
    this.lcg = new LCG(seed, 1664525, 1013904223, Math.pow(2, 32));
  }

  /**
   * Genera un valor N(0,1) usando el método Box-Muller
   */
  nextStandard(): number {
    // Si tenemos un valor guardado, lo usamos
    if (this.hasSpare) {
      this.hasSpare = false;
      return this.spare!;
    }

    // Generar dos uniformes
    let u1: number, u2: number;
    do {
      u1 = this.lcg.next();
      u2 = this.lcg.next();
    } while (u1 === 0); // Evitar log(0)

    // Transformación Box-Muller
    const radius = Math.sqrt(-2 * Math.log(u1));
    const theta = 2 * Math.PI * u2;

    // Generar dos valores normales
    const z0 = radius * Math.cos(theta);
    const z1 = radius * Math.sin(theta);

    // Guardar uno para la próxima llamada
    this.spare = z1;
    this.hasSpare = true;

    return z0;
  }

  /**
   * Genera un valor N(μ, σ²)
   */
  next(mean: number = 0, stdDev: number = 1): number {
    return mean + stdDev * this.nextStandard();
  }

  /**
   * Reinicia la semilla del generador
   */
  reseed(seed: number): void {
    this.lcg.reseed(seed);
    this.hasSpare = false;
    this.spare = null;
  }
}

/**
 * Función auxiliar para generar un array de valores normales
 */
export function generateNormalSamples(
  n: number,
  mean: number = 0,
  stdDev: number = 1,
  seed?: number
): number[] {
  const generator = new BoxMullerGenerator(seed);
  const samples: number[] = [];
  
  for (let i = 0; i < n; i++) {
    samples.push(generator.next(mean, stdDev));
  }
  
  return samples;
}

