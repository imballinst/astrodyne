import { Child, ChildTypeUnion } from '../models/models';
import { JSXType, ReferenceType } from '../models/_base';
import { convertCommentToString } from './comment-converters';
import { mergeTypeIdRecord } from './type-id-record';
import { EffectiveTypeResultWithDescription } from './types';

export enum NewlinePresentation {
  LineBreak = '\n',
  HTMLLineBreak = '<br/>'
}

interface Options {
  extractInPlace?: boolean;
  isEscapePipes?: boolean;
}

export function getTypeStringArray(
  record: Record<string, Child>,
  typeIdRecord: Record<number, Child>,
  options?: Options
) {
  return Object.values(record).map((type) => {
    return [
      type.name,
      `
### ${type.name}

${convertCommentToString(type.comment, NewlinePresentation.LineBreak)}

${getTypeBlock(type, typeIdRecord, options)}
    `.trim()
    ];
  });
}

function getTypeBlock(
  child: Child,
  typeIdRecord: Record<number, Child>,
  options?: Options
) {
  if (child.kindString === 'Type alias') {
    const childTypeString = getChildType(child, typeIdRecord, options);

    if (options?.extractInPlace && child.type?.type === 'reflection') {
      // If it's reflection and we use extract in place, then it'll generate tables like usual.
      return childTypeString;
    }

    return `
\`\`\`ts
type ${child.name} = ${getChildType(child, typeIdRecord, options)};
\`\`\`
  `.trim();
  }

  if (child.kindString === 'Interface' || child.kindString === 'Type literal') {
    const { children = [] } = child;

    return processChildrenFields(children, typeIdRecord);
  }

  return '';
}

export function processChildrenFields(
  children: Child[],
  typeIdRecord: Record<number, Child>
) {
  const rows: string[] = [];
  children.sort((a, b) => a.id - b.id);

  for (const child of children) {
    // This only misses description, which we will extract from the tags below.
    const row = [
      child.name,
      getChildType(child, typeIdRecord, { isEscapePipes: true })
    ];

    row.push(
      convertCommentToString(child.comment, NewlinePresentation.HTMLLineBreak)
    );
    rows.push(`| ${row.join(' | ')} |`);
  }

  return `
| Prop | Type | Description |
| ---- | ---- | ----------- |
${rows.join('\n')}
  `.trim();
}

export function getChildType(
  child: Child,
  typeIdRecord: Record<number, Child>,
  options?: Options
): string {
  if (child.type?.type === undefined) {
    return '';
  }

  return getEffectiveType(child.type, child.name, typeIdRecord, options)
    .typeString;
}

export function getEffectiveType(
  type: ChildTypeUnion | undefined,
  name: string,
  typeIdRecord: Record<number, Child>,
  options?: Options
): EffectiveTypeResultWithDescription {
  const result: EffectiveTypeResultWithDescription = {
    typeString: '',
    description: '',
    localTypeIdRecord: {}
  };

  if (type === undefined) return result;

  if (type.type === 'array') {
    return getEffectiveType(type.elementType, name, typeIdRecord, options);
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
        const childResult = getEffectiveType(
          typeChild,
          name,
          typeIdRecord,
          options
        );
        unions.push(childResult.typeString);

        mergeTypeIdRecord(
          result.localTypeIdRecord,
          childResult.localTypeIdRecord
        );
      }

      result.typeString =
        '(' + unions.join(options?.isEscapePipes ? ' \\| ' : ' | ') + ')';
      break;
    case 'reflection': {
      if (options?.extractInPlace) {
        result.typeString = processChildrenFields(
          type.declaration.children || [],
          typeIdRecord
        );
      } else {
        result.typeString = `[Object](#${name}_${type.declaration.id})`;
      }

      const children = type.declaration.children || [];

      for (const child of children) {
        const childResult = getEffectiveType(
          child.type,
          name,
          typeIdRecord,
          options
        );
        mergeTypeIdRecord(
          result.localTypeIdRecord,
          childResult.localTypeIdRecord
        );
      }

      break;
    }
    default:
      break;
  }

  return result;
}
