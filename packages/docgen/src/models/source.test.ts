import { describe, expect, test } from 'vitest';

import validSources from '../test-resources/sources.json';
import { Source } from './source';

describe('Source', () => {
  describe('valid source', () => {
    for (const sources of validSources) {
      for (const source of sources) {
        let sourceStr = JSON.stringify(source);
        if (sourceStr.length > 20) {
          sourceStr = `${sourceStr.slice(0, 20)}...`;
        }

        test(`parse ${sourceStr}`, () => {
          const parsed = Source.safeParse(source);
          expect(parsed.success).toBe(true);
        });
      }
    }
  });

  describe('invalid source', () => {
    test('insufficient fields', () => {
      let invalidSource = {};
      expect(Source.safeParse(invalidSource).success).toBe(false);

      // 1 field.
      invalidSource = {
        fileName: ''
      };
      expect(Source.safeParse(invalidSource).success).toBe(false);

      invalidSource = {
        line: ''
      };
      expect(Source.safeParse(invalidSource).success).toBe(false);

      invalidSource = {
        character: 2
      };
      expect(Source.safeParse(invalidSource).success).toBe(false);

      // 2 fields.
      invalidSource = {
        fileName: '',
        line: ''
      };
      expect(Source.safeParse(invalidSource).success).toBe(false);

      invalidSource = {
        line: '',
        character: 0
      };
      expect(Source.safeParse(invalidSource).success).toBe(false);

      invalidSource = {
        fileName: '',
        character: 0
      };
      expect(Source.safeParse(invalidSource).success).toBe(false);
    });

    test('invalid field type', () => {
      const invalidSource = {
        fileName: '',
        line: 0,
        character: ''
      };
      expect(Source.safeParse(invalidSource).success).toBe(false);
    });
  });
});
