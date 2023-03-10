import path from 'path';
import {
  ChildTypeUnion,
  Child,
  RecordEntry,
  TopLevelFields
} from '../models/models';
import { JSXType } from '../models/_base';
import { convertCommentToString } from './comment-converters';
import { getFunctionStringArray } from './function-converters';
import { getTypeStringArray, NewlinePresentation } from './type-converters';

export function convertApiJSONToMarkdown(json: TopLevelFields) {
  const typeIdRecord: Record<number, Child> = {};

  const componentsSection: Omit<RecordEntry, 'functions'>[] = [];
  const functionsSection: Omit<RecordEntry, 'components'>[] = [];
  const typesSection: Omit<RecordEntry, 'functions' | 'components'>[] = [];

  for (const file of json.children) {
    if (!file.children) {
      continue;
    }

    const tempObj: RecordEntry = {
      fileName: '',
      components: {},
      functions: {},
      types: {}
    };

    for (const child of file.children) {
      if (child.signatures && isJsxReturnType(child.signatures[0].type)) {
        // Component: JSX.
        tempObj.components[child.name] = child;
      } else if (
        child.kindString === 'Interface' ||
        child.kindString === 'Type alias'
      ) {
        // Types.
        tempObj.types[child.name] = child;
        typeIdRecord[child.id] = child;
      } else if (child.kindString === 'Function') {
        // Functions.
        tempObj.functions[child.name] = child;
      } else if (child.kindString === 'Module') {
        const moduleChildren = child.children || [];

        for (const moduleChild of moduleChildren) {
          tempObj.types[moduleChild.name] = moduleChild;
          typeIdRecord[moduleChild.id] = moduleChild;
        }
      }
    }

    // Re-structure.
    if (Object.keys(tempObj.components).length > 0) {
      componentsSection.push({
        fileName: file.name,
        components: tempObj.components,
        types: tempObj.types
      });
    } else if (Object.keys(tempObj.functions).length > 0) {
      functionsSection.push({
        fileName: file.name,
        functions: tempObj.functions,
        types: tempObj.types
      });
    } else {
      typesSection.push({ fileName: file.name, types: tempObj.types });
    }
  }

  const contents: Record<string, string> = {};

  // Components.
  for (const section of componentsSection) {
    const components: string[] = [];
    const types: string[][] = [];

    for (const componentKey in section.components) {
      const component = section.components[componentKey];

      components.push(
        `
### ${component.name}

${convertCommentToString(
  component.signatures?.[0].comment,
  NewlinePresentation.LineBreak
)}

      `.trim()
      );
    }

    types.push(...getTypeStringArray(section.types, typeIdRecord));

    const key = `docs/components/${path.basename(section.fileName)}.md`;
    contents[key] = `
## Components

${components.join('\n\n')}

## Types

${sortAndMapTuple(types).join('\n\n')}
    `.trim();
  }

  // Functions.
  for (const section of functionsSection) {
    const functions: string[] = [];
    const types: string[][] = [];

    functions.push(...getFunctionStringArray(section.functions, typeIdRecord));
    types.push(...getTypeStringArray(section.types, typeIdRecord));

    const key = `docs/functions/${path.basename(section.fileName)}.md`;
    contents[key] = addTextIfArrayIsNonEmpty('## Functions', functions);
    contents[key] += addTextIfArrayIsNonEmpty(
      '## Types',
      sortAndMapTuple(types)
    );
  }

  // Types.
  for (const section of typesSection) {
    const types: string[][] = [];

    types.push(
      ...getTypeStringArray(section.types, typeIdRecord, {
        extractInPlace: true
      })
    );

    const key = `docs/types/${path.basename(section.fileName)}.md`;
    contents[key] = addTextIfArrayIsNonEmpty(
      '## Types',
      sortAndMapTuple(types)
    );
  }

  return contents;
}

// Helper functions.
function isJsxReturnType(type: ChildTypeUnion | undefined): type is JSXType {
  if (type === undefined) {
    return false;
  }

  return type.type === 'reference' && type.name === 'Element';
}

function addTextIfArrayIsNonEmpty(heading: string, content: string[]) {
  if (content.length === 0) return '';

  return `
${heading}

${content.join('\n\n')}
  `.trim();
}

function sortAndMapTuple(array: string[][]) {
  const newArray = [...array];
  newArray.sort((a, b) => {
    if (a[0] < b[0]) return -1;
    if (a[0] > b[0]) return 1;
    return 0;
  });

  return newArray.map((item) => item[1]);
}
