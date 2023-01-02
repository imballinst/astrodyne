import { z } from 'zod';
import { Comment } from './comment';
import { Group } from './group';
import { Source } from './source';

export const KindString = z.enum([
  'Module',
  'Interface',
  'Property',
  'Function',
  'Type alias'
]);
export type KindString = z.infer<typeof KindString>;

export const Flags = z.object({
  isOptional: z.boolean().optional()
});
export type Flags = z.infer<typeof Flags>;

export interface Child {
  id: number;
  name: string;
  kind: number;
  kindString: KindString;
  flags: Flags;
  comment: Comment;
  type?: ChildTypeUnion;
  groups: Group[];
  signatures?: Signature[];
  sources: Source[];
  children?: Child[];
}
export const Child: z.ZodType<Child> = z.object({
  id: z.number(),
  name: z.string(),
  kind: z.number(),
  kindString: KindString,
  flags: Flags,
  comment: Comment,
  type: z.lazy(() => ChildTypeUnion).optional(),
  groups: z.array(Group),
  signatures: z.array(z.lazy(() => Signature)).optional(),
  sources: z.array(z.lazy(() => Source)),
  children: z.array(z.lazy(() => Child)).optional()
});

export const Signature = z.object({
  id: z.number(),
  name: z.string(),
  kind: z.number(),
  kindString: KindString,
  flags: Flags,
  comment: Comment,
  type: z.lazy(() => ChildTypeUnion).optional(),
  parameters: z.array(Child)
});
export type Signature = z.infer<typeof Signature>;

export const ReflectionType = z.object({
  type: z.literal('reflection'),
  declaration: Child
});
export type ReflectionType = z.infer<typeof ReflectionType>;

export const IntrinsicType = z.object({
  type: z.literal('intrinsic'),
  name: z.string()
});
export type IntrinsicType = z.infer<typeof IntrinsicType>;

export const ReferenceType = z.object({
  type: z.literal('reference'),
  id: z.number(),
  name: z.string()
});
export type ReferenceType = z.infer<typeof ReferenceType>;

export const LiteralType = z.object({
  type: z.literal('literal'),
  value: z.string()
});
export type LiteralType = z.infer<typeof LiteralType>;

export const JSXType = z.object({
  type: z.literal('reference'),
  qualifiedName: z.literal('global.JSX.Element'),
  package: z.literal('@types/react'),
  name: z.literal('Element')
});
export type JSXType = z.infer<typeof JSXType>;

export const TopLevelFields = z.object({
  id: z.number(),
  name: z.string(),
  kind: z.number(),
  flags: Flags,
  originalName: z.string(),
  children: z.array(Child),
  groups: z.array(Group)
});
export type TopLevelFields = z.infer<typeof TopLevelFields>;

export const RecordEntry = z.object({
  fileName: z.string(),
  components: z.record(Child),
  functions: z.record(Child),
  types: z.record(Child)
});
export type RecordEntry = z.infer<typeof RecordEntry>;

const NonArrayType = z.union([
  IntrinsicType,
  ReferenceType,
  ReflectionType,
  JSXType,
  LiteralType
]);
type NonArrayType = z.infer<typeof NonArrayType>;

export const UnionType = z.object({
  type: z.literal('union'),
  types: z.array(NonArrayType)
});
export type UnionType = z.infer<typeof UnionType>;

export const ArrayType = z.object({
  type: z.literal('array'),
  elementType: NonArrayType
});
export type ArrayType = z.infer<typeof ArrayType>;

export const ChildTypeUnion = z.union([NonArrayType, ArrayType]);
export type ChildTypeUnion = z.infer<typeof ChildTypeUnion>;
