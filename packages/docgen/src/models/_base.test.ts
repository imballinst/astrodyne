import { describe, expect, test } from 'vitest';

import validIntrinsics from '../test-resources/intrinsics.json';
import validLiterals from '../test-resources/literals.json';
import validReferences from '../test-resources/references.json';
import { IntrinsicType, LiteralType, JSXType, ReferenceType } from './_base';

describe('IntrinsicType', () => {
  for (const validIntrinsic of validIntrinsics) {
    let validIntrinsicStr = JSON.stringify(validIntrinsic);
    if (validIntrinsicStr.length > 20) {
      validIntrinsicStr = `${validIntrinsicStr.slice(0, 20)}...`;
    }

    test(`parse ${validIntrinsicStr}`, () => {
      const parsed = IntrinsicType.safeParse(validIntrinsic);
      expect(parsed.success).toBe(true);
    });
  }
});

describe('LiteralType', () => {
  for (const validLiteral of validLiterals) {
    let validLiteralStr = JSON.stringify(validLiteral);
    if (validLiteralStr.length > 20) {
      validLiteralStr = `${validLiteralStr.slice(0, 20)}...`;
    }

    test(`parse ${validLiteralStr}`, () => {
      const parsed = LiteralType.safeParse(validLiteral);
      expect(parsed.success).toBe(true);
    });
  }
});

describe('ReferenceType and JSXType', () => {
  for (const validReference of validReferences) {
    let validReferenceStr = JSON.stringify(validReference);
    if (validReferenceStr.length > 20) {
      validReferenceStr = `${validReferenceStr.slice(0, 20)}...`;
    }

    test(`parse ${validReferenceStr}`, () => {
      const parsedReference = ReferenceType.safeParse(validReference);
      const parsedJSX = JSXType.safeParse(validReference);

      expect(parsedReference.success || parsedJSX.success).toBe(true);
    });
  }
});
