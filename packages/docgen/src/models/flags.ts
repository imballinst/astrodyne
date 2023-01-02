import { z } from 'zod';

export const Flags = z.object({
  isOptional: z.boolean().optional()
}).strict();
export type Flags = z.infer<typeof Flags>;
