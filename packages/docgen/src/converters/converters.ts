import path from 'path';
import {
  ChildTypeUnion,
  Child,
  RecordEntry,
  TopLevelFields
} from '../models/models';
import { JSXType } from '../models/_base';
import {
  Frontmatter,
  prependWithFrontmatterIfExist
} from '../utils/frontmatter';
import { FileExtension, OutputMode } from '../utils/mode';
import { LeafConfig, RUNTIME_VARIABLES } from '../utils/runtime-variables';
import { convertCommentToString } from './comment-converters';
import { getFunctionStringArray } from './function-converters';
import { getTypeStringArray, NewlinePresentation } from './type-converters';

const FRONTMATTER_REGEX = /\$(\w+): ([\w\s]+)/;

export async function convertApiJSONToMarkdown({
  json,
  mode,
  fileExtension,
  isTrailingSlashUsed,
  input,
  outputDocsDir,
  leafConfig
}: {
  json: TopLevelFields;
  mode: OutputMode;
  fileExtension: FileExtension;
  isTrailingSlashUsed: boolean;
  input: string;
  outputDocsDir: string;
  leafConfig: LeafConfig;
}) {
  // Set global variables.
  RUNTIME_VARIABLES.fileExtension = fileExtension;
  RUNTIME_VARIABLES.outputMode = mode;
  RUNTIME_VARIABLES.isTrailingSlashUsed = isTrailingSlashUsed;

  // Process the things.
  const typeIdRecord: Record<number, Child> = {};
  const frontmatterRecord: Record<string, Frontmatter> = {};

  const componentsSection: Omit<RecordEntry, 'functions' | 'frontmatter'>[] =
    [];
  const functionsSection: Omit<RecordEntry, 'components' | 'frontmatter'>[] =
    [];
  const typesSection: Omit<
    RecordEntry,
    'functions' | 'components' | 'frontmatter'
  >[] = [];

  const baseReplacement = leafConfig.base || '';

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

    // Read the package's frontmatter.
    const fileComment = convertCommentToString(
      file.comment,
      NewlinePresentation.LineBreak
    );
    if (fileComment) {
      const lines = fileComment.split('\n');
      let frontmatterIndexEnd = -1;

      for (let i = 0; i < lines.length; i++) {
        if (!lines[i].startsWith('$')) {
          frontmatterIndexEnd = i;
          break;
        }
      }

      if (frontmatterIndexEnd > -1) {
        const frontmatters = lines.slice(0, frontmatterIndexEnd);
        for (const frontmatter of frontmatters) {
          const regexResult = FRONTMATTER_REGEX.exec(frontmatter);
          if (!regexResult) continue;

          const [, key, value] = regexResult;

          if (!frontmatterRecord[file.name]) {
            // Initialize if it doesn't exist in the record yet.
            frontmatterRecord[file.name] = {
              description: '',
              title: ''
            };
          }

          frontmatterRecord[file.name][key as keyof Frontmatter] = value;
        }
      }
    }

    // Iterate the children.
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
        source: file.sources?.[0],
        components: tempObj.components,
        types: tempObj.types
      });
    } else if (Object.keys(tempObj.functions).length > 0) {
      functionsSection.push({
        fileName: file.name,
        source: file.sources?.[0],
        functions: tempObj.functions,
        types: tempObj.types
      });
    } else {
      typesSection.push({
        fileName: file.name,
        source: file.sources?.[0],
        types: tempObj.types
      });
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

    types.push(
      ...getTypeStringArray({
        record: section.types,
        typeIdRecord,
        mode,
        options: { urls: { src: section.source } }
      })
    );

    const key = generateFileName(
      `components/${section.fileName}`,
      fileExtension
    );
    contents[key] = `
## Components

${components.join('\n\n')}

## Types

${sortAndMapTuple(types).join('\n\n')}
    `.trim();

    // Prepend frontmatter.
    contents[key] = prependWithFrontmatterIfExist(
      contents[key],
      frontmatterRecord[section.fileName],
      // TODO: refactor this.
      leafConfig.injectedFrontmatter?.layout
        ? {
            layout: getRelativePathToLayout(
              path.join(outputDocsDir, section.fileName),
              leafConfig.injectedFrontmatter.layout.replace(
                '{base}',
                baseReplacement
              )
            )
          }
        : undefined
    );
  }

  // Functions.
  for (const section of functionsSection) {
    const functions: string[] = [];
    const types: string[][] = [];

    const result = getFunctionStringArray({
      entities: section.functions,
      typeIdRecord,
      mode
    });

    functions.push(...result.textArray);

    for (const id of result.inlineTypeIds) {
      section.types[id] = typeIdRecord[id];
    }

    types.push(
      ...getTypeStringArray({
        record: section.types,
        typeIdRecord,
        options: {
          extractInPlace: true
        },
        mode
      })
    );

    const key = generateFileName(
      `functions/${section.fileName}`,
      fileExtension
    );
    contents[key] = addTextIfArrayIsNonEmpty('## Functions', functions);
    contents[key] += addTextIfArrayIsNonEmpty(
      '\n\n## Types',
      sortAndMapTuple(types)
    );

    // Prepend frontmatter.
    contents[key] = prependWithFrontmatterIfExist(
      contents[key],
      frontmatterRecord[section.fileName],
      // TODO: refactor this.
      leafConfig.injectedFrontmatter?.layout
        ? {
            layout: getRelativePathToLayout(
              path.join(outputDocsDir, section.fileName),
              leafConfig.injectedFrontmatter.layout.replace(
                '{base}',
                baseReplacement
              )
            )
          }
        : undefined
    );
  }

  // Types.
  for (const section of typesSection) {
    const types: string[][] = [];

    types.push(
      ...getTypeStringArray({
        record: section.types,
        typeIdRecord,
        options: {
          extractInPlace: true
        },
        mode
      })
    );

    const key = generateFileName(`types/${section.fileName}`, fileExtension);
    contents[key] = addTextIfArrayIsNonEmpty(
      '## Types',
      sortAndMapTuple(types)
    );

    // Prepend frontmatter.
    contents[key] = prependWithFrontmatterIfExist(
      contents[key],
      frontmatterRecord[section.fileName],
      // TODO: refactor this.
      leafConfig.injectedFrontmatter?.layout
        ? {
            layout: getRelativePathToLayout(
              path.join(outputDocsDir, section.fileName),
              leafConfig.injectedFrontmatter.layout.replace(
                '{base}',
                baseReplacement
              )
            )
          }
        : undefined
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

  return `${heading}

${content.join('\n\n')}`;
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

function generateFileName(section: string, extension: string) {
  return `${section}.${extension}`;
}

function getRelativePathToLayout(filePath: string, layoutPath: string) {
  return path.relative(filePath, layoutPath);
}
