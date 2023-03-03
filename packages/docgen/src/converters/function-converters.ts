import { Child, ReflectionType, Signature } from '../models/models';
import { getEffectiveType } from './type-converters';
import { ReferenceType } from '../models/_base';

export function getFunctionStringArray(
  entities: Record<string, Child>,
  typeIdRecord: Record<string, Child>
) {
  const result: string[] = [];
  const values = Object.values(entities);

  const localTypeIdRecord: Record<string, Child> = {};

  for (const value of values) {
    const overloads = value.signatures || [];

    for (const overload of overloads) {
      const content: string[] = [getFunctionSummary(overload)];

      if (overload.parameters.length) {
        content.push(getFunctionParameters(overload.parameters, typeIdRecord));
      }

      result.push(content.join('\n\n'));
    }
  }

  return result;
}

// Helper functions.
function getFunctionSummary(fn: Signature) {
  return `
### ${fn.name}

${(fn.comment.summary || []).map((block) => block.text)}
  `.trim();
}

function getFunctionParameters(
  children: Child[],
  typeIdRecord: Record<string, Child>
) {
  const localTypeIdRecord: Record<string, Child> = {};
  let result = '';

  for (const child of children) {
    const parameterBlockInformation = getParameterBlock(child, typeIdRecord);
  }

  return `
#### Parameters

${children.map((child) => {
  return getParameterBlock(child, typeIdRecord);
})}
  `.trim();
}

// Note that we can't use getTypeBlock here because Parameter has its own name.
function getParameterBlock(child: Child, typeIdRecord: Record<number, Child>) {
  let localTypeIdRecord: Record<string, Child> = {};

  // TODO: return string and localTypeIdRecord here.
  if (child.type?.type === 'reflection') {
    const result = getEffectiveType(child.type, child.name, typeIdRecord);
    const typeString = result.typeString;
    localTypeIdRecord = result.localTypeIdRecord;

    return `
| Parameter | Type | Description |
| ---- | ---- | ----------- |
| ${child.name} | ${typeString} | ${(child.comment?.summary || []).map(
      (block) => block.text
    )} |
  `.trim();
  }

  return '';
}
