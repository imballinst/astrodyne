import { describe, expect, test } from 'vitest';

import validReflections from '../test-resources/reflections.json';
import { ReflectionType } from './models';

describe('Reflection', () => {
  for (const validReflection of validReflections) {
    let validReflectionStr = JSON.stringify(validReflection);
    if (validReflectionStr.length > 20) {
      validReflectionStr = `${validReflectionStr.slice(0, 20)}...`;
    }

    test(`parse ${validReflectionStr}`, () => {
      const parsed = ReflectionType.safeParse(validReflection);
      if (!parsed.success) {
        console.log(JSON.stringify(parsed.error, null, 2))
      }
      expect(parsed.success).toBe(true);
    });

  }
});
