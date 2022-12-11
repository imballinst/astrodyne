import { describe, expect, test } from 'vitest';
import { KindString } from './models';

import validKinds from './test-resources/kind-strings.json';

describe('KindString', () => {
  describe('valid kind', () => {
    test('valid kind: has length > 0', () => {
      expect(validKinds.length > 0).toBe(true);
    });

    for (const kind of validKinds) {
      test(`valid kind: ${kind}`, () => {
        expect(KindString.safeParse(kind).success).toBe(true);
      });
    }
  });

  describe('invalid kind', () => {
    const invalidKinds = [
      'zz Module',
      'zz Function',
      'zz Interface',
      'zz Parameter',
      'zz Call signature',
      'zz Type alias'
    ];

    for (const kind of invalidKinds) {
      test(`invalid kind: ${kind}`, () => {
        expect(KindString.safeParse(kind).success).toBe(false);
      });
    }
  });
});
