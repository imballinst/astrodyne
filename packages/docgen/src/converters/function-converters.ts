import { ArrayType, Child, ReflectionType, Signature } from '../models/models';
import { Source } from '../models/source';
import { ReferenceType } from '../models/_base';
import { getRelativePath } from '../utils/file';
import { OutputMode } from '../utils/mode';
import { convertCommentToString } from './comment-converters';
import { getEffectiveType, NewlinePresentation } from './type-converters';
import { EffectiveTypeResult, TypeIdRecord } from './types';

export function getFunctionStringArray({
  entities,
  typeIdRecord,
  mode
}: {
  entities: Record<string, Child>;
  typeIdRecord: Record<string, Child>;
  mode: OutputMode;
}) {
  const result: {
    textArray: string[];
    inlineTypeIds: number[];
  } = {
    textArray: [],
    inlineTypeIds: []
  };
  const values = Object.values(entities);

  for (const value of values) {
    const functionSource = value.sources?.[0];
    const overloads = value.signatures || [];

    for (const overload of overloads) {
      const content: string[] = [getFunctionSummary(overload)];

      if (overload.parameters.length) {
        const childResult = getFunctionParameters({
          overload,
          typeIdRecord,
          functionSource,
          mode
        });

        content.push(childResult.parameters);
        result.inlineTypeIds = [
          ...result.inlineTypeIds,
          ...childResult.inlineTypeIds
        ];
      }
      const childResult = getFunctionReturns({
        signature: overload,
        typeIdRecord,
        functionSource: value.sources?.[0],
        mode
      });
      content.push(childResult.returns);
      result.inlineTypeIds = [
        ...result.inlineTypeIds,
        ...childResult.inlineTypeIds
      ];

      result.textArray.push(content.join('\n\n'));
    }
  }

  return result;
}

// Helper functions.
function getFunctionSummary(fn: Signature) {
  return `
### ${fn.name}

${(fn.comment?.summary || []).map((block) => block.text)}
  `.trim();
}

function getFunctionParameters({
  overload,
  typeIdRecord,
  functionSource,
  mode
}: {
  overload: Signature;
  typeIdRecord: Record<string, Child>;
  functionSource: Source | undefined;
  mode: OutputMode;
}) {
  const result: EffectiveTypeResult = {
    typeString: '',
    inlineTypeIds: []
  };

  for (const child of overload.parameters) {
    const childResult = getParameterBlock({
      child,
      typeIdRecord,
      functionName: overload.name,
      functionSource,
      mode
    });

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
function getParameterBlock({
  child,
  typeIdRecord,
  functionName,
  functionSource,
  mode
}: {
  child: Child;
  typeIdRecord: Record<number, Child>;
  functionName: string;
  functionSource: Source | undefined;
  mode: OutputMode;
}) {
  let result: EffectiveTypeResult = {
    typeString: '',
    inlineTypeIds: []
  };

  if (child.type?.type === 'reflection') {
    const temp = getEffectiveType({
      type: child.type,
      name: getLocalFunctionParameterName(functionName, child),
      typeIdRecord
    });

    result.typeString = `
| Parameter | Type | Description |
| ---- | ---- | ----------- |
| ${child.name} | ${temp.typeString} | ${convertCommentToString(
      child.comment,
      NewlinePresentation.HTMLLineBreak
    )} |
  `.trim();
    result.inlineTypeIds.push(...temp.inlineTypeIds);
  } else if (child.type?.type === 'reference') {
    const temp = getEffectiveType({
      type: child.type,
      name: getLocalFunctionParameterName(functionName, child),
      typeIdRecord,
      options: {
        urls: functionSource ? { src: functionSource } : undefined
      }
    });

    result.typeString = `
| Parameter | Type | Description |
| ---- | ---- | ----------- |
| ${child.name} | ${temp.typeString} | ${temp.description} |
  `.trim();
    result.inlineTypeIds.push(...temp.inlineTypeIds);
  }

  return result;
}

function getFunctionReturns({
  signature,
  typeIdRecord,
  functionSource,
  mode
}: {
  signature: Signature;
  typeIdRecord: TypeIdRecord;
  functionSource: Source | undefined;
  mode: OutputMode;
}) {
  const array = ArrayType.safeParse(signature.type);
  let object = signature.type;
  let isArray = false;

  if (array.success) {
    object = array.data.elementType;
    isArray = true;
  }

  const isIntrinsic = object?.type === 'intrinsic';
  const reference = ReferenceType.safeParse(object);
  const reflection = ReflectionType.safeParse(object);
  const inlineTypeIds: number[] = [];
  let link = '';

  if (reference.success) {
    link = getRelativePath({
      src: functionSource,
      dst: typeIdRecord[reference.data.id].sources?.[0]
    });
  } else if (reflection.success) {
    link = getLocalFunctionParameterName(signature.name, {
      ...reflection.data.declaration,
      name: 'returnValue'
    });
    typeIdRecord[reflection.data.declaration.id] = {
      ...typeIdRecord[reflection.data.declaration.id],
      name: link
    };
    inlineTypeIds.push(reflection.data.declaration.id);
  }

  const effectiveType = getEffectiveType({
    type: signature.type,
    name: link,
    typeIdRecord
  }).typeString;
  let rendered =
    !effectiveType.includes('[Object]') && !isIntrinsic
      ? `[${effectiveType}](${link})`
      : effectiveType;

  if (isArray) {
    rendered = `Array<${rendered}>`;
  }

  return {
    returns: `
#### Returns

${rendered}
      `.trim(),
    inlineTypeIds
  };
}

function getLocalFunctionParameterName(functionName: string, child: Child) {
  return `${functionName}_${child.name}`;
}
