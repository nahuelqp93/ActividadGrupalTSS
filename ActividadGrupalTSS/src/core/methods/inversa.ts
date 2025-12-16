import type { SamplePoint } from "../types/Sample";
import type { GeneratorMethod } from "../methods/Types";

interface InverseParams {
  inverseCDF: (u: number) => number;
  pdf?: (x: number) => number;
}

export const inverseMethod: GeneratorMethod<InverseParams> = ({
  n,
  nextU,
  inverseCDF,
  pdf
}) => {
  const samples: SamplePoint[] = [];

  for (let i = 1; i <= n; i++) {
    const u = nextU();
    const x = inverseCDF(u);

    samples.push({
      i,
      u,
      x,
      fx: pdf ? pdf(x) : undefined,
      accepted: true
    });
  }

  return samples;
};
