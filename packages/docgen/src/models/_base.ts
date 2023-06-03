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

export const GenericType = z
  .object({
    type: z.literal('reference'),
    id: z.number().optional(),
    typeArguments: z.array(
      z.object({
        type: z.string(),
        id: z.number().optional(),
        name: z.string()
      })
    ),
    name: z.string(),
    qualifiedName: z.string().optional(),
    package: z.string().optional()
  })
  .strict();
export type GenericType = z.infer<typeof GenericType>;

// const ParameterType = z.object({
//   type: 'typeOperator',
//   operator: 'keyof',
//   target: {
//     type: 'reference',
//     id: 51,
//     name: 'T'
//   }
// });

// export const GenericDefinitionType = z.object({
//   type: z.literal('mapped'),
//   parameter: z.string(),
//   parameterType: {
//     type: 'typeOperator',
//     operator: 'keyof',
//     target: {
//       type: 'reference',
//       id: 51,
//       name: 'T'
//     }
//   },
//   templateType: z.any(),
//   nameType: z.any()
// });
