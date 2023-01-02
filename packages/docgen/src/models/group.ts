import { z } from 'zod';

export const Group = z.object({
  title: z.string(),
  children: z.array(z.number())
}).strict();
export type Group = z.infer<typeof Group>;
