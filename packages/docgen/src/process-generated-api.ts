import fs from 'fs-extra';
import path from 'path';
import {
  TopLevelFields,
  Child,
  RecordEntry,
  ChildTypeUnion
} from './models/models';
import { JSXType } from './models/_base';

(async () => {
  const file = await fs.readFile(path.join(process.cwd(), 'api.json'), 'utf-8');
  const json = JSON.parse(file) as TopLevelFields;
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

  await Promise.allSettled([
    fs.rm('docs/components', { force: true }),
    fs.rm('docs/types', { force: true }),
    fs.rm('docs/functions', { force: true })
  ]);

  await Promise.allSettled([
    fs.mkdirp('docs/components'),
    fs.mkdirp('docs/types'),
    fs.mkdirp('docs/functions')
  ]);

  const promises: Array<Promise<void>> = [];

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

    promises.push(
      fs.writeFile(
        `docs/components/${path.basename(section.fileName)}.md`,
        `
## Components

${components.join('\n\n')}

## Types

${types.join('\n\n')}
    `.trim()
      )
    );
  }

  // Functions.
  for (const section of functionsSection) {
    const functions: string[] = [];
    const types: string[] = [];

    functions.push(...getFunctionStringArray(section.functions));
    types.push(...getTypeStringArray(section.types, typeIdRecord));

    promises.push(
      fs.writeFile(
        `docs/functions/${path.basename(section.fileName)}.md`,
        `
## Functions

${functions.join('\n\n')}

## Types

${types.join('\n\n')}
        `.trim()
      )
    );
  }

  // Types.
  for (const section of typesSection) {
    const types: string[] = [];

    types.push(...getTypeStringArray(section.types, typeIdRecord));
    promises.push(
      fs.writeFile(
        `docs/types/${path.basename(section.fileName)}.md`,
        `
## Types

${types.join('\n\n')}
        `.trim()
      )
    );
  }

  await Promise.allSettled(promises);
})();

// Helper functions.
function isJsxReturnType(type: ChildTypeUnion | undefined): type is JSXType {
  if (type === undefined) {
    return false;
  }

  return type.type === 'reference' && type.name === 'Element';
}

function getFunctionStringArray(record: Record<string, Child>) {
  return Object.values(record).map((fn) => {
    return `
### ${fn.name}

${(fn.signatures![0].comment.summary || []).map((block) => block.text)}
  
    `.trim();
  });
}

function getTypeStringArray(
  record: Record<string, Child>,
  typeIdRecord: Record<number, Child>
) {
  return Object.values(record).map((type) => {
    return `
### ${type.name}

${(type.comment?.summary || []).map((block) => block.text)}
${(type.comment?.blockTags || []).map((block) => block.content.map(c => c.text).join(''))}

${getTypeBlock(type, typeIdRecord)}
    `.trim();
  });
}

// TODO(imballinst): perhaps table is better.
function getTypeBlock(type: Child, typeIdRecord: Record<number, Child>) {
  let content = '';

  if (type.kindString === 'Type alias') {
    content = `type ${type.name} = ${getChildType(type, typeIdRecord)};\n`;
  } else if (type.kindString === 'Interface') {
    content = `
interface ${type.name} {
${
  type.children
    ? type.children
        .map((child) => {
          const tags = child.comment?.blockTags;
          let fieldDescription = '';
          if (tags) {
            fieldDescription = tags
              .map((tag) => {
                const description = tag.content
                  .map((block) => `  // ${block.text}`)
                  .join('\n');

                return `// @${tag.tag}\n${description}`;
              })
              .join('\n');
          } else {
            fieldDescription = `// ${(child.comment?.summary || []).map(
              (block) => block.text
            )}`;
          }

          return `  ${fieldDescription}\n  ${child.name}: ${getChildType(
            child,
            typeIdRecord
          )};\n`;
        })
        .join('')
    : ''
}}`;
  }

  return `
\`\`\`ts
${content.trim()}
\`\`\`
  `.trim();
}

function getChildType(
  child: Child,
  typeIdRecord: Record<number, Child>
): string {
  if (child.type?.type === undefined) {
    return '';
  }

  return `${getEffectiveType(child.type, child.name, typeIdRecord)}`;
}

function getEffectiveType(
  type: ChildTypeUnion | undefined,
  name: string,
  typeIdRecord: Record<number, Child>
): string {
  if (type === undefined) return '';

  if (type.type === 'array') {
    return `${getEffectiveType(type.elementType, name, typeIdRecord)}[]`;
  }

  switch (type.type) {
    case 'reference':
    case 'intrinsic':
      return type.name;
    case 'literal':
      return typeof type.value === 'string' ? `"${type.value}"` : type.value;
    case 'union':
      return (
        '(' +
        type.types
          .map((inner) => getEffectiveType(inner, name, typeIdRecord))
          .join(' | ') +
        ')'
      );
    case 'reflection': {
      const fields = (type.declaration.children || [])
        .map((inner) => {
          return `  ${inner.name}: ${getEffectiveType(
            inner.type,
            name,
            typeIdRecord
          )}`;
        })
        .join(';\n');

      return `{\n${fields}\n}`;
    }
  }

  return '';
}
