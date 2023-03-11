import { describe, expect, test } from 'vitest';

import * as fs from 'fs';
import * as path from 'path';
import { convertApiJSONToMarkdown } from './converters';

const apiJson = fs.readFileSync(
  path.join(process.cwd(), '../example/api.json'),
  'utf-8'
);

describe('convertApiJSONToMarkdown', () => {
  const result = convertApiJSONToMarkdown(JSON.parse(apiJson));

  test('components', () => {
    expect(result['docs/components/TestComponent.md']).toBe(
      `
## Components

### TestComponent

Renders a hello world text, the title, as well as the metadata.

## Types

### TestComponentProps

The props passed to TestComponent.

| Prop | Type | Description |
| ---- | ---- | ----------- |
| title | string | The title of the component. This is NOT the component ID. |
| metadata | Metadata | The metadata of the component. |
| information | Metadata | **[Deprecated]** Deprecated since 1.11.1. Please use \`metadata\` field instead as this might be<br/>removed in the future.<br/><br/>The component information. |
    `.trim()
    );
  });

  test('functions', () => {
    expect(result['docs/functions/metadata.md']).toBe(
      `
## Functions

### convertToMetadata

Converts the information to metadata.

#### Parameters

| Parameter | Type | Description |
| ---- | ---- | ----------- |
| information | [Object](#information_12) |  |

#### Returns

Metadata

### getInformation

Gets the component information from the given metadata.

#### Parameters

| Parameter | Type | Description |
| ---- | ---- | ----------- |
| metadata | Metadata | The metadata used for the test component. |

#### Returns

ComponentInfo
    `.trim()
    );
  });

  test('types', () => {
    expect(result['docs/types/types.md']).toBe(
      `
## Types

### ComponentInfo

Component info.

| Prop | Type | Description |
| ---- | ---- | ----------- |
| size | number | This determines the size of the component. |
| sizeArray | number | This determines the size array of the component. |
| test | "World2" | Sampel test field |
| test2 | ("World2" | "Hello2") | Sampel test field |
| test3 | World | Sampel test field |

### Hello

Test normal type assign.

\`\`\`ts
type Hello = "World2";
\`\`\`

### Metadata

The metadata used for the test component.

| Prop | Type | Description |
| ---- | ---- | ----------- |
| componentId | string | The component ID. |
| componentInfo | ComponentInfo | The component information. |

### World

Test normal type assign 2.

\`\`\`ts
type World = ("Hello2" | "World2");
\`\`\`

### XD

Test normal type object.

| Prop | Type | Description |
| ---- | ---- | ----------- |
| test | string |  |
    `.trim()
    );
  });
});