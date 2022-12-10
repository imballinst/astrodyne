import fs from 'fs-extra';
import path from 'path';

const currentPath = new URL(import.meta.url).pathname;

type KindString =
  | 'Module'
  | 'Function'
  | 'Interface'
  | 'Parameter'
  | 'Call signature'
  | 'Type alias';

interface Flags {
  isOptional?: true;
}

interface TagComment {
  tag: string;
  text: string;
}

interface Child {
  id: number;
  name: string;
  kind: number;
  kindString: KindString;
  flags: Flags;
  comment: Comment;
  type?: ChildType;
  groups: Group[];
  signatures?: Signature[];
  sources: Source[];
  children?: Child[];
}

interface Signature {
  id: number;
  name: string;
  kind: number;
  kindString: KindString;
  flags: Flags;
  comment: Comment;
  type?: ChildType;
  parameters: Child[];
}

interface Group {
  title: string;
  kind: number;
  children: number[];
}

interface Source {
  fileName: string;
  line: number;
  character: number;
}

interface Comment {
  shortText?: string;
  tags?: TagComment[];
}

type NonArrayType =
  | IntrinsicType
  | ReferenceType
  | ReflectionType
  | JSXType
  | LiteralType
  | UnionType;
type ChildType = NonArrayType | ArrayType;

interface ReflectionType {
  type: 'reflection';
  declaration: Child;
}

interface IntrinsicType {
  type: 'intrinsic';
  name: string;
}

interface ReferenceType {
  type: 'reference';
  id: number;
  name: string;
}

interface LiteralType {
  type: 'literal';
  value: string;
}

interface UnionType {
  type: 'union';
  types: NonArrayType[];
}

interface JSXType {
  type: 'reference';
  qualifiedName: 'global.JSX.Element';
  package: '@types/react';
  name: 'Element';
}

interface ArrayType {
  type: 'array';
  elementType: NonArrayType;
}

interface TopLevelFields {
  id: number;
  name: string;
  kind: number;
  flags: Flags;
  originalName: string;
  children: Child[];
  groups: Group[];
}

interface RecordEntry {
  fileName: string;
  components: Record<string, Child>;
  functions: Record<string, Child>;
  types: Record<string, Child>;
}

(async () => {
  const file = await fs.readFile(
    path.join(path.dirname(currentPath), '../api.json'),
    'utf-8'
  );
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

${component.signatures![0].comment.shortText || ''}

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
function isJsxReturnType(type: ChildType | undefined): type is JSXType {
  if (type === undefined) {
    return false;
  }

  return type.type === 'reference' && type.name === 'Element';
}

function getFunctionStringArray(record: Record<string, Child>) {
  return Object.values(record).map((fn) => {
    return `
### ${fn.name}

${fn.signatures![0].comment.shortText || ''}
  
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

${type.comment.shortText || ''}

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
        .map(
          (child) => `  ${child.name}: ${getChildType(child, typeIdRecord)};\n`
        )
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
  type: ChildType,
  name: string,
  typeIdRecord: Record<number, Child>
): string {
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
  }

  return '';
}
