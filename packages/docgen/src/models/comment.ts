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

export const Comment = z
  .object({
    summary: z.array(Content),
    blockTags: z.array(TagComment).optional()
  })
  .transform((result) => {
    if (result.blockTags) {
      return {
        type: 'tags',
        blockTags: result.blockTags
      };
    }

    return {
      type: 'description',
      summary: result.summary
    };
  });
export type Comment = z.infer<typeof Comment>;
