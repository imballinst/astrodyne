import { z } from 'zod';

export const IntrinsicType = z
  .object({
    type: z.literal('intrinsic'),
    name: z.string()
  })
  .strict();
export type IntrinsicType = z.infer<typeof IntrinsicType>;

export const ReferenceType = z
  .object({
    type: z.literal('reference'),
    id: z.number(),
    name: z.string()
  })
  .strict();
export type ReferenceType = z.infer<typeof ReferenceType>;

export const LiteralType = z
  .object({
    type: z.literal('literal'),
    value: z.string()
  })
  .strict();
export type LiteralType = z.infer<typeof LiteralType>;

export const JSXType = z
  .object({
    type: z.literal('reference'),
    qualifiedName: z.literal('global.JSX.Element'),
    package: z.literal('@types/react'),
    name: z.literal('Element')
  })
  .strict();
export type JSXType = z.infer<typeof JSXType>;
