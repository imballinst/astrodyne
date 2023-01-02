import { z } from 'zod';

const Content = z.object({
  kind: z.enum(['text', 'code']),
  text: z.string()
});

const TagComment = z.object({
  tag: z.string(),
  content: z.array(Content)
});
type TagComment = z.infer<typeof TagComment>;

export const Comment = z.union([
  z.object({
    summary: z.array(Content),
    blockTags: z.undefined()
  }).strict(),
  z.object({
    summary: z.array(Content),
    blockTags: z.array(TagComment)
  }).strict()
]);
export type Comment = z.infer<typeof Comment>;
