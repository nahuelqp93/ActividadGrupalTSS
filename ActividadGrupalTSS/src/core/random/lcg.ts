export class LCG {
  private state: number;
  private readonly a: number;
  private readonly c: number;
  private readonly m: number;

  constructor(
    seed: number,
    a: number,
    c: number,
    m: number
  ) {
    this.state = seed;
    this.a = a;
    this.c = c;
    this.m = m;
  }

  /** Devuelve U ~ U(0,1) */
  next(): number {
    this.state = (this.a * this.state + this.c) % this.m;
    return this.state / this.m;
  }

  /** Permite reiniciar la semilla */
  reseed(seed: number) {
    this.state = seed;
  }
}
