import { Child, ChildTypeUnion } from '../models/models';
import { JSXType, ReferenceType } from '../models/_base';
import { OutputMode } from '../utils/mode';
import { convertCommentToString } from './comment-converters';
import { EffectiveTypeResultWithDescription } from './types';

export enum NewlinePresentation {
  LineBreak = '\n',
  HTMLLineBreak = '<br/>'
}

interface Options {
  extractInPlace?: boolean;
}

export function getTypeStringArray({
  record,
  typeIdRecord,
  options,
  mode
}: {
  record: Record<string, Child>;
  typeIdRecord: Record<number, Child>;
  options?: Options;
  mode: OutputMode;
}) {
  return Object.values(record).map((child) => {
    const text = [
      `### ${child.name}`,
      convertCommentToString(child.comment, NewlinePresentation.LineBreak),
      getTypeBlock({ child, typeIdRecord, options, mode })
    ].filter(Boolean);

    return [child.name, text.join('\n\n')];
  });
}

function getTypeBlock({
  child,
  typeIdRecord,
  options,
  mode
}: {
  child: Child;
  typeIdRecord: Record<number, Child>;
  options?: Options;
  mode: OutputMode;
}) {
  if (child.kindString === 'Type alias') {
    const childTypeString = getChildType({
      child,
      typeIdRecord,
      options,
      mode
    });

    if (options?.extractInPlace && child.type?.type === 'reflection') {
      // If it's reflection and we use extract in place, then it'll generate tables like usual.
      return childTypeString;
    }

    return `
\`\`\`ts
type ${child.name} = ${getChildType({ child, typeIdRecord, options, mode })};
\`\`\`
  `.trim();
  }

  if (child.kindString === 'Interface' || child.kindString === 'Type literal') {
    const { children = [] } = child;

    return processChildrenFields({ children, typeIdRecord, mode });
  }

  return '';
}

export function processChildrenFields({
  children,
  typeIdRecord,
  mode
}: {
  children: Child[];
  typeIdRecord: Record<number, Child>;
  mode: OutputMode;
}) {
  const rows: string[] = [];
  children.sort((a, b) => a.id - b.id);

  for (const child of children) {
    // This only misses description, which we will extract from the tags below.
    const columns = [
      child.name,
      getChildType({ child, typeIdRecord, mode }).replace(/\|/, '\\|')
    ];
    columns.push(
      convertCommentToString(child.comment, NewlinePresentation.HTMLLineBreak)
    );

    rows.push(`| ${columns.join(' | ')} |`);
  }

  return `
| Prop | Type | Description |
| ---- | ---- | ----------- |
${rows.join('\n')}
  `.trim();
}

export function getChildType({
  child,
  typeIdRecord,
  options,
  mode
}: {
  child: Child;
  typeIdRecord: Record<number, Child>;
  options?: Options;
  mode: OutputMode;
}): string {
  if (child.type?.type === undefined) {
    return '';
  }

  return getEffectiveType({
    type: child.type,
    name: child.name,
    typeIdRecord,
    options,
    mode
  }).typeString;
}

export function getEffectiveType({
  type,
  name,
  typeIdRecord,
  options,
  mode
}: {
  type: ChildTypeUnion | undefined;
  name: string;
  typeIdRecord: Record<number, Child>;
  options?: Options;
  mode: OutputMode;
}): EffectiveTypeResultWithDescription {
  const result: EffectiveTypeResultWithDescription = {
    typeString: '',
    description: '',
    inlineTypeIds: []
  };

  if (type === undefined) return result;

  if (type.type === 'array') {
    return getEffectiveType({
      type: type.elementType,
      name,
      typeIdRecord,
      options,
      mode
    });
  }

  switch (type.type) {
    case 'reference': {
      const parsedJSX = JSXType.safeParse(type);
      if (parsedJSX.success) {
        result.typeString = 'ReactElement';
      }

      const parsedReference = ReferenceType.safeParse(type);
      if (parsedReference.success) {
        result.typeString = type.name;
        result.description = convertCommentToString(
          typeIdRecord[parsedReference.data.id].comment,
          NewlinePresentation.HTMLLineBreak
        );
      }

      break;
    }
    case 'intrinsic':
      result.typeString = type.name;
      break;
    case 'literal':
      result.typeString =
        typeof type.value === 'string' ? `"${type.value}"` : type.value;
      break;
    case 'union':
      const unions: string[] = [];

      for (const typeChild of type.types) {
        const childResult = getEffectiveType({
          type: typeChild,
          name,
          typeIdRecord,
          options,
          mode
        });
        unions.push(childResult.typeString);
      }

      result.typeString = '(' + unions.join(' | ') + ')';
      break;
    case 'reflection': {
      if (options?.extractInPlace) {
        result.typeString = processChildrenFields({
          children: type.declaration.children || [],
          typeIdRecord,
          mode
        });
      } else {
        const id = type.declaration.id;

        result.typeString = `[Object](#${name})`;
        result.inlineTypeIds.push(id);

        typeIdRecord[id] = {
          ...type.declaration,
          name: typeIdRecord[id]?.name || name
        };
      }

      break;
    }
    default:
      break;
  }

  return result;
}
