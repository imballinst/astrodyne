import { describe, expect, test } from 'vitest';

import validReflections from '../test-resources/reflections.json';
import validSignatures from '../test-resources/signatures.json';
import { ReflectionType, Signature } from './models';

describe('Reflection', () => {
  for (const validReflection of validReflections) {
    let validReflectionStr = JSON.stringify(validReflection);
    if (validReflectionStr.length > 20) {
      validReflectionStr = `${validReflectionStr.slice(0, 20)}...`;
    }

    test(`parse ${validReflectionStr}`, () => {
      const parsed = ReflectionType.safeParse(validReflection);
      if (!parsed.success) {
        console.log(JSON.stringify(parsed.error, null, 2));
      }
      expect(parsed.success).toBe(true);
    });
  }
});

describe('Signature', () => {
  for (const signatures of validSignatures) {
    for (const signature of signatures) {
      let signatureStr = JSON.stringify(signature);
      if (signatureStr.length > 20) {
        signatureStr = `${signatureStr.slice(0, 20)}...`;
      }

      test(`parse ${signatureStr}`, () => {
        const parsed = Signature.safeParse(signature);
        if (!parsed.success) {
          console.log(JSON.stringify(parsed.error, null, 2));
        }
        expect(parsed.success).toBe(true);
      });
    }
  }
});
