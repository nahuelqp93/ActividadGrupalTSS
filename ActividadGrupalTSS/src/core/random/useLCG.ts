import { useRef } from "react";
import { LCG } from "./lcg";

interface LCGParams {
  seed: number;
  a: number;
  c: number;
  m: number;
}

export function useLCG(params: LCGParams) {
  const rngRef = useRef<LCG | null>(null);

  if (!rngRef.current) {
    rngRef.current = new LCG(
      params.seed,
      params.a,
      params.c,
      params.m
    );
  }

  const next = () => rngRef.current!.next();

  const reseed = (seed: number) => {
    rngRef.current!.reseed(seed);
  };

  return { next, reseed };
}
