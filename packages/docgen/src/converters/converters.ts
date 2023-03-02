import path from 'path';
import {
  ChildTypeUnion,
  Child,
  RecordEntry,
  TopLevelFields
} from '../models/models';
import { JSXType } from '../models/_base';
import { getFunctionStringArray } from './function-converters';
import {
  getChildDescription,
  getTypeBlock,
  NewlinePresentation
} from './type-converters';

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
    const types: string[] = [];

    for (const componentKey in section.components) {
      const component = section.components[componentKey];

      // TODO(imballinst): handle deprecated tags, etc.
      components.push(
        `
### ${component.name}

${(component.signatures![0].comment.summary || []).map((block) => block.text)}

      `.trim()
      );
    }

    types.push(...getTypeStringArray(section.types, typeIdRecord));

    const key = `docs/components/${path.basename(section.fileName)}.md`;
    contents[key] = `
## Components

${components.join('\n\n')}

## API

${types.join('\n\n')}
    `.trim();
  }

  // Functions.
  for (const section of functionsSection) {
    const functions: string[] = [];
    const types: string[] = [];

    functions.push(...getFunctionStringArray(section.functions, typeIdRecord));
    types.push(...getTypeStringArray(section.types, typeIdRecord));

    const key = `docs/functions/${path.basename(section.fileName)}.md`;
    contents[key] = `
## Functions

${functions.join('\n\n')}

## Types

${types.join('\n\n')}
        `.trim();
  }

  // Types.
  for (const section of typesSection) {
    const types: string[] = [];

    types.push(...getTypeStringArray(section.types, typeIdRecord));

    const key = `docs/types/${path.basename(section.fileName)}.md`;
    contents[key] = `
## Types

${types.join('\n\n')}
        `.trim();
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

function getTypeStringArray(
  record: Record<string, Child>,
  typeIdRecord: Record<number, Child>
) {
  return Object.values(record).map((type) => {
    return `
### ${type.name}

${getChildDescription(type, NewlinePresentation.LineBreak)}

${getTypeBlock(type, typeIdRecord)}
    `.trim();
  });
}
