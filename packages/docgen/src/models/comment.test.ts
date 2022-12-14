import { describe, expect, test } from 'vitest';

import validComments from '../test-resources/comment.json';
import { Comment } from './comment';

describe('Comment', () => {
  describe('valid comment', () => {
    for (const comment of validComments) {
      let commentStr = JSON.stringify(comment);
      if (commentStr.length > 20) {
        commentStr = `${commentStr.slice(0, 20)}...`;
      }

      test(`parse ${commentStr}`, () => {
        const parsed = Comment.safeParse(comment);
        expect(parsed.success).toBe(true);
      });
    }

    test('parse comment with just summary', () => {
      const comment = validComments.find(
        (item) => item.blockTags === undefined
      );
      const parsed = Comment.safeParse(comment);
      if (!parsed.success) throw new Error();

      expect(parsed.data.summary).toEqual(comment?.summary);
      expect(parsed.data.blockTags).toBeUndefined();
    });

    test('parse comment with blockTags', () => {
      const comment = validComments.find(
        (item) => item.blockTags !== undefined
      );
      const parsed = Comment.safeParse(comment);
      if (!parsed.success) throw new Error();

      expect(parsed.data.summary).toEqual(comment?.summary);
      expect(parsed.data.blockTags).toEqual(comment?.blockTags);
    });
  });

  describe('invalid comment', () => {
    test('insufficient fields', () => {
      const invalidComment = {};
      expect(Comment.safeParse(invalidComment).success).toBe(false);
    });

    test('invalid field type', () => {
      let invalidComment: any = { blockTags: '' };
      expect(Comment.safeParse(invalidComment).success).toBe(false);

      invalidComment = { summary: '' };
      expect(Comment.safeParse(invalidComment).success).toBe(false);
    });

    test('blockTags without summary', () => {
      const invalidComment = { blockTags: [] };
      expect(Comment.safeParse(invalidComment).success).toBe(false);
    });
  });
});
