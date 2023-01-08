import { z } from 'zod';

export const KindString = z.enum([
  'Module',
  'Interface',
  'Property',
  'Function',
  'Type alias',
  'Call signature',
  'Parameter',
  'Type literal'
]);
export type KindString = z.infer<typeof KindString>;
