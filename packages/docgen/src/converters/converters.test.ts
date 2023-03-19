import { describe, expect, test } from 'vitest';

import * as fs from 'fs';
import * as path from 'path';
import { convertApiJSONToMarkdown } from './converters';

const apiJson = fs.readFileSync(
  path.join(process.cwd(), '../example/api.json'),
  'utf-8'
);

describe('convertApiJSONToMarkdown', async () => {
  const result = await convertApiJSONToMarkdown({
    json: JSON.parse(apiJson),
    mode: 'github',
    input: 'src'
  });
  const resultAstro = await convertApiJSONToMarkdown({
    json: JSON.parse(apiJson),
    mode: 'astro',
    input: 'src'
  });

  test('components', () => {
    expect(result['components/components/TestComponent.md']).toBe(
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
    expect(resultAstro['components/components/TestComponent.mdx']).toBe(
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
    expect(result['functions/helpers/metadata.md']).toBe(
      `
## Functions

### convertToMetadata

Converts the information to metadata.

#### Parameters

| Parameter | Type | Description |
| ---- | ---- | ----------- |
| information | [Object](#convertToMetadata_information) |  |

#### Returns

[Metadata](../../types/helpers/types.md)

### getInformation

Gets the component information from the given metadata.

#### Parameters

| Parameter | Type | Description |
| ---- | ---- | ----------- |
| metadata | Metadata | The metadata used for the test component. |

#### Returns

[ComponentInfo](../../types/helpers/types.md)

## Types

### convertToMetadata_information

| Prop | Type | Description |
| ---- | ---- | ----------- |
| id | string |  |
| size | number |  |
    `.trim()
    );
    expect(resultAstro['functions/helpers/metadata.mdx']).toBe(
      `
## Functions

### convertToMetadata

Converts the information to metadata.

#### Parameters

| Parameter | Type | Description |
| ---- | ---- | ----------- |
| information | [Object](#convertToMetadata_information) |  |

#### Returns

[Metadata](../../types/helpers/types.mdx)

### getInformation

Gets the component information from the given metadata.

#### Parameters

| Parameter | Type | Description |
| ---- | ---- | ----------- |
| metadata | Metadata | The metadata used for the test component. |

#### Returns

[ComponentInfo](../../types/helpers/types.mdx)

## Types

### convertToMetadata_information

| Prop | Type | Description |
| ---- | ---- | ----------- |
| id | string |  |
| size | number |  |
    `.trim()
    );

    expect(result['functions/helpers/array.md']).toBe(
      `
---
title: Array helpers
description: This file contains the array helpers
---

## Functions

### splitCharacters

Converts a string into an array of each characters.

#### Parameters

#### Returns

[Object](#splitCharacters_returnValue)

## Types

### splitCharacters_returnValue

| Prop | Type | Description |
| ---- | ---- | ----------- |
| array | string |  |
    `.trim()
    );
    expect(resultAstro['functions/helpers/array.mdx']).toBe(
      `
---
title: Array helpers
description: This file contains the array helpers
---

## Functions

### splitCharacters

Converts a string into an array of each characters.

#### Parameters

#### Returns

[Object](#splitCharacters_returnValue)

## Types

### splitCharacters_returnValue

| Prop | Type | Description |
| ---- | ---- | ----------- |
| array | string |  |
    `.trim()
    );
  });

  test('types', () => {
    expect(result['types/helpers/types.md']).toBe(
      `
## Types

### ComponentInfo

Component info.

| Prop | Type | Description |
| ---- | ---- | ----------- |
| size | number | This determines the size of the component. |
| sizeArray | number | This determines the size array of the component. |
| test | "World2" | Sampel test field |
| test2 | ("World2" \\| "Hello2") | Sampel test field |
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
    expect(resultAstro['types/helpers/types.mdx']).toBe(
      `
## Types

### ComponentInfo

Component info.

| Prop | Type | Description |
| ---- | ---- | ----------- |
| size | number | This determines the size of the component. |
| sizeArray | number | This determines the size array of the component. |
| test | "World2" | Sampel test field |
| test2 | ("World2" \\| "Hello2") | Sampel test field |
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
