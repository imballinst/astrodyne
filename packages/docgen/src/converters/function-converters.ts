import { Child, ReflectionType, Signature } from '../models/models';
import { Source } from '../models/source';
import { ReferenceType } from '../models/_base';
import { getRelativePath } from '../utils/file';
import { convertCommentToString } from './comment-converters';
import { getEffectiveType, NewlinePresentation } from './type-converters';
import { EffectiveTypeResult, TypeIdRecord } from './types';

export function getFunctionStringArray(
  entities: Record<string, Child>,
  typeIdRecord: Record<string, Child>
) {
  const result: {
    textArray: string[];
    inlineTypeIds: number[];
  } = {
    textArray: [],
    inlineTypeIds: []
  };
  const values = Object.values(entities);

  for (const value of values) {
    const overloads = value.signatures || [];

    for (const overload of overloads) {
      const content: string[] = [getFunctionSummary(overload)];

      if (overload.parameters.length) {
        const childResult = getFunctionParameters(overload, typeIdRecord);

        content.push(childResult.parameters);
        result.inlineTypeIds = [
          ...result.inlineTypeIds,
          ...childResult.inlineTypeIds
        ];
      }

      content.push(
        getFunctionReturns(overload, typeIdRecord, value.sources?.[0])
      );
      result.textArray.push(content.join('\n\n'));
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
  overload: Signature,
  typeIdRecord: Record<string, Child>
) {
  const result: EffectiveTypeResult = {
    typeString: '',
    inlineTypeIds: []
  };

  for (const child of overload.parameters) {
    const childResult = getParameterBlock(child, typeIdRecord, overload.name);

    result.typeString += childResult.typeString;
    result.inlineTypeIds.push(...childResult.inlineTypeIds);
  }

  return {
    parameters: `
#### Parameters

${result.typeString}
      `.trim(),
    inlineTypeIds: result.inlineTypeIds
  };
}

// Note that we can't use getTypeBlock here because Parameter has its own name.
function getParameterBlock(
  child: Child,
  typeIdRecord: Record<number, Child>,
  functionName: string
) {
  let result: EffectiveTypeResult = {
    typeString: '',
    inlineTypeIds: []
  };

  if (child.type?.type === 'reflection') {
    const temp = getEffectiveType(
      child.type,
      getLocalFunctionParameterName(functionName, child),
      typeIdRecord
    );

    result.typeString = `
| Parameter | Type | Description |
| ---- | ---- | ----------- |
| ${child.name} | ${temp.typeString} | ${convertCommentToString(
      child.comment,
      NewlinePresentation.HTMLLineBreak
    )} |
  `.trim();
    result.inlineTypeIds.push(...temp.inlineTypeIds);
  }

  if (child.type?.type === 'reference') {
    const temp = getEffectiveType(
      child.type,
      getLocalFunctionParameterName(functionName, child),
      typeIdRecord
    );

    result.typeString = `
| Parameter | Type | Description |
| ---- | ---- | ----------- |
| ${child.name} | ${temp.typeString} | ${temp.description} |
  `.trim();
    result.inlineTypeIds.push(...temp.inlineTypeIds);
  }

  return result;
}

function getFunctionReturns(
  fn: Signature,
  typeIdRecord: TypeIdRecord,
  functionSource: Source | undefined
) {
  const reference = ReferenceType.safeParse(fn.type);
  const reflection = ReflectionType.safeParse(fn.type);
  let link: string | undefined;

  if (reference.success) {
    link = getRelativePath(
      functionSource,
      typeIdRecord[reference.data.id].sources?.[0]
    );
  } else if (reflection.success) {
    link = getLocalFunctionParameterName(fn.name, reflection.data.declaration);
  }

  const effectiveType = getEffectiveType(fn.type, '', typeIdRecord).typeString;
  const rendered = link ? `[${effectiveType}](${link})` : effectiveType;

  return `
#### Returns

${rendered}
  `.trim();
}

function getLocalFunctionParameterName(functionName: string, child: Child) {
  return `${functionName}_${child.name}`;
}
