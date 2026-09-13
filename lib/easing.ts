/** Minimal cubic-bezier easing evaluator (Newton-Raphson), matching CSS's cubic-bezier(). */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const a = (aA1: number, aA2: number) => 1.0 - 3.0 * aA2 + 3.0 * aA1;
  const b = (aA1: number, aA2: number) => 3.0 * aA2 - 6.0 * aA1;
  const c = (aA1: number) => 3.0 * aA1;

  const calcBezier = (t: number, aA1: number, aA2: number) =>
    ((a(aA1, aA2) * t + b(aA1, aA2)) * t + c(aA1)) * t;
  const getSlope = (t: number, aA1: number, aA2: number) =>
    3.0 * a(aA1, aA2) * t * t + 2.0 * b(aA1, aA2) * t + c(aA1);

  return (x: number): number => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 4; i++) {
      const slope = getSlope(t, x1, x2);
      if (slope === 0) break;
      t -= (calcBezier(t, x1, x2) - x) / slope;
    }
    return calcBezier(t, y1, y2);
  };
}

/** The spec's zoom-transition easing: cubic-bezier(0.4, 0, 0.2, 1). */
export const standardEasing = cubicBezier(0.4, 0, 0.2, 1);
