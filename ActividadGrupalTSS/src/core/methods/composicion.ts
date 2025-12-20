import type { SamplePoint } from "../types/Sample";
import type { GeneratorMethod } from "./Types";

interface CompositionComponent {
  weight: number;
  inverseCDF: (u: number) => number;
  pdf?: (x: number) => number;
}

interface CompositionParams {
  components: CompositionComponent[];
}

export const compositionMethod: GeneratorMethod<CompositionParams> = ({
  n,
  nextU,
  components
}) => {
  const samples: SamplePoint[] = [];

  // Distribución acumulada de pesos
  const cumulative = components.reduce<number[]>((acc, c, i) => {
    acc.push((acc[i - 1] || 0) + c.weight);
    return acc;
  }, []);

  for (let i = 1; i <= n; i++) {
    const u = nextU();
    const v = nextU();

    const idx = cumulative.findIndex(c => u <= c);
    const component = components[idx];

    const x = component.inverseCDF(v);

    samples.push({
      i,
      u,
      u2: v,
      x,
      fx: component.pdf ? component.pdf(x) : undefined,
      accepted: true // Composición siempre acepta
    });
  }

  return samples;
};