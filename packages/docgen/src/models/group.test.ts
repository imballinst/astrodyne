import { describe, expect, test } from 'vitest';

import validGroups from '../test-resources/groups.json';
import { Group } from './group';

describe('Group', () => {
  describe('valid group', () => {
    for (const groups of validGroups) {
      for (const group of groups) {
        let groupStr = JSON.stringify(group);
        if (groupStr.length > 20) {
          groupStr = `${groupStr.slice(0, 20)}...`;
        }

        test(`parse ${groupStr}`, () => {
          const parsed = Group.safeParse(group);
          expect(parsed.success).toBe(true);
        });
      }
    }
  });

  describe('invalid group', () => {
    test('insufficient fields', () => {
      let invalidGroup: any = {};
      expect(Group.safeParse(invalidGroup).success).toBe(false);
      
      invalidGroup = { title: 'hello' };
      expect(Group.safeParse(invalidGroup).success).toBe(false);
  
      invalidGroup = { children: 'hello' };
      expect(Group.safeParse(invalidGroup).success).toBe(false);
    });
  });
});
