import { z } from 'zod';

export const Source = z.object({
  fileName: z.string(),
  line: z.number(),
  character: z.number()
}).strict();
export type Source = z.infer<typeof Source>;
