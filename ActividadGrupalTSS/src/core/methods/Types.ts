import type { SamplePoint } from "../types/Sample";

export interface MethodParams {
  n: number;
  nextU: () => number;
}

export type GeneratorMethod<TParams = any> = (
  params: MethodParams & TParams
) => SamplePoint[];
