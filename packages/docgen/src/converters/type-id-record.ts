import { EffectiveTypeResult } from './types';

/**
 * Merges `b` keys into `a`.
 * @param a
 * @param b
 */
export function mergeTypeIdRecord(
  a: EffectiveTypeResult['localTypeIdRecord'],
  b: EffectiveTypeResult['localTypeIdRecord']
) {
  for (const [k, v] of Object.entries(b)) {
    a[Number(k)] = v;
  }
}
