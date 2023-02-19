import fs from 'fs-extra';
import path from 'path';
import { convertApiJSONToMarkdown } from './converters/converters';
import {
  TopLevelFields,
  Child,
  RecordEntry,
  ChildTypeUnion
} from './models/models';
import { JSXType } from './models/_base';

(async () => {
  const file = await fs.readFile(path.join(process.cwd(), 'api.json'), 'utf-8');

  // Clean output folder.
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

  const json = JSON.parse(file) as TopLevelFields;
  const contents = convertApiJSONToMarkdown(json);

  await Promise.allSettled(
    Object.entries(contents).map(([filePath, content]) =>
      fs.writeFile(filePath, content, { encoding: 'utf-8' })
    )
  );
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
${(type.comment?.blockTags || []).map((block) =>
  block.content.map((c) => c.text).join('')
)}

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
