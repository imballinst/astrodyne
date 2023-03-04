import { Child, ChildTypeUnion } from '../models/models';
import { mergeTypeIdRecord } from './type-id-record';
import { EffectiveTypeResult } from './types';

export enum NewlinePresentation {
  LineBreak = '\n',
  HTMLLineBreak = '<br/>'
}

const TAG_TO_TAG_DESCRIPTION: Record<string, string> = {
  '@deprecated': 'Deprecated'
};

export function getTypeBlock(
  child: Child,
  typeIdRecord: Record<number, Child>
) {
  if (child.kindString === 'Type alias') {
    return `
\`\`\`ts
type ${child.name} = ${getChildType(child, typeIdRecord)};\n
\`\`\`
  `.trim();
  }

  if (child.kindString === 'Interface' || child.kindString === 'Type literal') {
    const { children = [] } = child;

    return `
| Prop | Type | Description |
| ---- | ---- | ----------- |
${processChildrenFields(children, typeIdRecord)}
`.trim();
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
    const row = [child.name, getChildType(child, typeIdRecord)];

    row.push(getChildDescription(child, NewlinePresentation.HTMLLineBreak));
    rows.push(`| ${row.join(' | ')} |`);
  }

  return rows.join('\n');
}

export function getChildType(
  child: Child,
  typeIdRecord: Record<number, Child>
): string {
  if (child.type?.type === undefined) {
    return '';
  }

  return `${getEffectiveType(child.type, child.name, typeIdRecord).typeString}`;
}

export function getChildDescription(
  child: Child,
  newlineCharacter: NewlinePresentation
) {
  const tags = child.comment?.blockTags || [];
  const summary = child.comment?.summary || [];
  let description = '';

  if (tags.length > 0) {
    description += tags
      .map((tag) => {
        const description = tag.content
          .map((block) => block.text.replace(/\n/g, newlineCharacter))
          .join('');
        const tagName = TAG_TO_TAG_DESCRIPTION[tag.tag]
          ? `**[${TAG_TO_TAG_DESCRIPTION[tag.tag]}]** `
          : '';

        return `${tagName}${description}`;
      })
      .join('\n');
  }

  if (summary.length > 0) {
    description += (summary || [])
      .map((block) => block.text.replace(/\n/g, newlineCharacter))
      .join('');
  }

  return description;
}

export function getEffectiveType(
  type: ChildTypeUnion | undefined,
  name: string,
  typeIdRecord: Record<number, Child>
): EffectiveTypeResult {
  const result: EffectiveTypeResult = {
    typeString: '',
    localTypeIdRecord: {}
  };

  if (type === undefined) return result;

  if (type.type === 'array') {
    return getEffectiveType(type.elementType, name, typeIdRecord);
  }

  switch (type.type) {
    case 'reference':
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
        const childResult = getEffectiveType(typeChild, name, typeIdRecord);
        unions.push(childResult.typeString);

        mergeTypeIdRecord(
          result.localTypeIdRecord,
          childResult.localTypeIdRecord
        );
      }

      result.typeString = '(' + unions.join(' | ') + ')';
      break;
    case 'reflection': {
      result.typeString = `[Object](#${name}_${type.declaration.id})`;
      const children = type.declaration.children || [];

      for (const child of children) {
        const childResult = getEffectiveType(child.type, name, typeIdRecord);
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
