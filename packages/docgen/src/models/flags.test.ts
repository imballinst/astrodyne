import { describe, expect, test } from 'vitest';

import validFlags from '../test-resources/flags.json';
import { Flags } from './flags';

describe('Flag', () => {
  describe('valid flags', () => {
    for (const flags of validFlags) {
      let flagsStr = JSON.stringify(flags);
      if (flagsStr.length > 20) {
        flagsStr = `${flagsStr.slice(0, 20)}...`;
      }

      test(`parse ${flagsStr}`, () => {
        const parsed = Flags.safeParse(flags);
        expect(parsed.success).toBe(true);
      });
    }
  });

  describe('invalid flags', () => {
    test('invalid fields', () => {
      let invalidFlag: any = { title: 'hello' };
      expect(Flags.safeParse(invalidFlag).success).toBe(false);
    });
  });
});
