import { Child, Signature } from '../models/models';
import { getEffectiveType } from './type-converters';
import { EffectiveTypeResult, TypeIdRecord } from './types';
import { mergeTypeIdRecord } from './type-id-record';

export function getFunctionStringArray(
  entities: Record<string, Child>,
  typeIdRecord: Record<string, Child>
) {
  const result: string[] = [];
  const values = Object.values(entities);

  for (const value of values) {
    const overloads = value.signatures || [];

    for (const overload of overloads) {
      const content: string[] = [getFunctionSummary(overload)];

      if (overload.parameters.length) {
        content.push(getFunctionParameters(overload.parameters, typeIdRecord));
      }

      content.push(getFunctionReturns(overload, typeIdRecord));
      // TODO: add types here and have it hyperlinked.
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
    const childResult = getParameterBlock(child, typeIdRecord);
    result += childResult.typeString;

    mergeTypeIdRecord(localTypeIdRecord, childResult.localTypeIdRecord);
  }

  return `
#### Parameters

${children.map((child) => {
  return getParameterBlock(child, typeIdRecord).typeString;
})}
  `.trim();
}

// Note that we can't use getTypeBlock here because Parameter has its own name.
function getParameterBlock(child: Child, typeIdRecord: Record<number, Child>) {
  let result: EffectiveTypeResult = {
    typeString: '',
    localTypeIdRecord: {}
  };

  if (child.type?.type === 'reflection') {
    const temp = getEffectiveType(child.type, child.name, typeIdRecord);

    result.typeString = `
| Parameter | Type | Description |
| ---- | ---- | ----------- |
| ${child.name} | ${temp.typeString} | ${(child.comment?.summary || [])
      .map((block) => block.text)
      .join('')} |
  `.trim();
    result.localTypeIdRecord = temp.localTypeIdRecord;
  }

  if (child.type?.type === 'reference') {
    const temp = getEffectiveType(child.type, child.name, typeIdRecord);

    result.typeString = `
| Parameter | Type | Description |
| ---- | ---- | ----------- |
| ${child.name} | ${temp.typeString} | ${temp.description} |
  `.trim();
    result.localTypeIdRecord = temp.localTypeIdRecord;
  }

  return result;
}

function getFunctionReturns(fn: Signature, typeIdRecord: TypeIdRecord) {
  return `
#### Returns

${getEffectiveType(fn.type, '', typeIdRecord).typeString}
  `.trim();
}
