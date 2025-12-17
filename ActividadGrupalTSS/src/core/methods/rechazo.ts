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
  const c = 1 / fmax; 

  for (let i = 1; i <= n; i++) {
    const u1 = nextU();
    const u2 = nextU();

    const x = xmin + (xmax - xmin) * u1;
    const fx = pdf(x);
    const yRechazado = u2 * 1/c; 
    
    const accepted = u2 <= fx * c;
    
    const y = accepted ? fx : yRechazado;

    samples.push({
      i,
      u: u1,
      u2,
      x,
      y,
      fx,
      c,
      accepted
    });
  }

  return samples;
};
