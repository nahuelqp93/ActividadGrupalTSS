import type { SamplePoint } from "../types/Sample";
import type { GeneratorMethod } from "../methods/Types";

interface RejectionParams {
  xmin: number;
  xmax: number;
  pdf: (x: number) => number;
  fmax: number;
}

export const rejectionMethod: GeneratorMethod<RejectionParams> = ({
  n,
  nextU,
  xmin,
  xmax,
  pdf,
  fmax
}) => {
  const samples: SamplePoint[] = [];

  for (let i = 1; i <= n; i++) {
    const u1 = nextU();
    const u2 = nextU();

    const x = xmin + (xmax - xmin) * u1;
    const y = u2 * fmax;
    const fx = pdf(x);

    const accepted = y <= fx;

    samples.push({
      i,
      u: u1,
      u2,
      x,
      y,
      fx,
      accepted
    });
  }

  return samples;
};
