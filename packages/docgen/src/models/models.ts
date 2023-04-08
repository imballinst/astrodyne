import { z } from 'zod';
import { Comment } from './comment';
import { Flags } from './flags';
import { Group } from './group';
import { KindString } from './kindString';
import { Source } from './source';
import { IntrinsicType, ReferenceType, JSXType, LiteralType } from './_base';

// These are the remaining types that need to be in 1 file together so we're not do circular imports.
export interface Child {
  id: number;
  name: string;
  kind: number;
  kindString: KindString;
  flags: Flags;
  comment?: Comment;
  type?: ChildTypeUnion;
  groups?: Group[];
  signatures?: Signature[];
  sources?: Source[];
  children?: Child[];
}
export const Child: z.ZodType<Child> = z
  .object({
    id: z.number(),
    name: z.string(),
    kind: z.number(),
    kindString: KindString,
    flags: Flags,
    comment: Comment.optional(),
    type: z.lazy(() => ChildTypeUnion).optional(),
    groups: z.array(Group).optional(),
    signatures: z.array(z.lazy(() => Signature)).optional(),
    sources: z.array(z.lazy(() => Source)).optional(),
    children: z.array(z.lazy(() => Child)).optional()
  })
  .strict();

export const Signature = z
  .object({
    id: z.number(),
    name: z.string(),
    kind: z.number(),
    kindString: KindString,
    flags: Flags,
    comment: Comment.optional(),
    type: z.lazy(() => ChildTypeUnion).optional(),
    parameters: z.array(Child)
  })
  .strict();
export type Signature = z.infer<typeof Signature>;

// TODO: we need to handle Record any many more TypeScript types -_- this is going to be PITA
export const TypeScriptRecordType = z
  .object({
    type: z.literal('reference'),
    typeArguments: z.array(
      z.object({
        type: z.string(),
        name: z.string()
      })
    ),
    name: z.literal('Record'),
    qualifiedName: z.literal('Record'),
    package: z.literal('typescript')
  })
  .strict();
export type TypeScriptRecordType = z.infer<typeof TypeScriptRecordType>;

export const ReflectionType = z
  .object({
    type: z.literal('reflection'),
    declaration: Child
  })
  .strict();
export type ReflectionType = z.infer<typeof ReflectionType>;

export const TopLevelFields = z
  .object({
    id: z.number(),
    name: z.string(),
    kind: z.number(),
    flags: Flags,
    originalName: z.string(),
    children: z.array(Child),
    groups: z.array(Group)
  })
  .strict();
export type TopLevelFields = z.infer<typeof TopLevelFields>;

export const RecordEntry = z
  .object({
    fileName: z.string(),
    components: z.record(Child),
    functions: z.record(Child),
    types: z.record(Child)
  })
  .strict();
export type RecordEntry = z.infer<typeof RecordEntry>;

const NonArrayType = z.union([
  IntrinsicType,
  ReferenceType,
  ReflectionType,
  JSXType,
  LiteralType,
  TypeScriptRecordType
]);
type NonArrayType = z.infer<typeof NonArrayType>;

export const UnionType = z
  .object({
    type: z.literal('union'),
    types: z.array(NonArrayType)
  })
  .strict();
export type UnionType = z.infer<typeof UnionType>;

export const ArrayType = z
  .object({
    type: z.literal('array'),
    elementType: NonArrayType
  })
  .strict();
export type ArrayType = z.infer<typeof ArrayType>;

export const ChildTypeUnion = z.union([NonArrayType, UnionType, ArrayType]);
export type ChildTypeUnion = z.infer<typeof ChildTypeUnion>;
