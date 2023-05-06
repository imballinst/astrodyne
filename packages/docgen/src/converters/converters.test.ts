import { describe, expect, test } from 'vitest';

import * as fs from 'fs';
import * as path from 'path';
import { convertApiJSONToMarkdown } from './converters';
import { FileExtension, OutputMode } from '../utils/mode';

const apiJson = fs.readFileSync(
  path.join(process.cwd(), '../example/api.json'),
  'utf-8'
);

describe('convertApiJSONToMarkdown', async () => {
  const resultMd = await convertApiJSONToMarkdown({
    json: JSON.parse(apiJson),
    mode: OutputMode.PLAIN_MARKDOWN,
    isTrailingSlashUsed: true,
    fileExtension: FileExtension.MD,
    input: 'src'
  });
  const resultMdx = await convertApiJSONToMarkdown({
    json: JSON.parse(apiJson),
    mode: OutputMode.PROCESSED_MARKDOWN,
    isTrailingSlashUsed: true,
    fileExtension: FileExtension.MDX,
    input: 'src'
  });

  test('components', () => {
    expect(resultMd['components/components/TestComponent.md']).toBe(
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
| metadata | [Metadata](../../../types/helpers/types.md) | The metadata of the component. |
| information | [Metadata](../../../types/helpers/types.md) | **[Deprecated]** Deprecated since 1.11.1. Please use \`metadata\` field instead as this might be<br/>removed in the future.<br/><br/>The component information. |
    `.trim()
    );
    expect(resultMdx['components/components/TestComponent.mdx']).toBe(
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
| metadata | [Metadata](../../../types/helpers/types) | The metadata of the component. |
| information | [Metadata](../../../types/helpers/types) | **[Deprecated]** Deprecated since 1.11.1. Please use \`metadata\` field instead as this might be<br/>removed in the future.<br/><br/>The component information. |
    `.trim()
    );
  });

  test('functions', () => {
    expect(resultMd['functions/helpers/metadata.md']).toBe(
      `
## Functions

### convertToMetadata

Converts the information to metadata.

#### Parameters

| Parameter | Type | Description |
| ---- | ---- | ----------- |
| information | [Object](#convertToMetadata_information) |  |

#### Returns

[Metadata](../../../types/helpers/types.md)

### getInformation

Gets the component information from the given metadata.

#### Parameters

| Parameter | Type | Description |
| ---- | ---- | ----------- |
| metadata | [Metadata](../../../types/helpers/types.md) | The metadata used for the test component. |

#### Returns

[ComponentInfo](../../../types/helpers/types.md)

## Types

### convertToMetadata_information

| Prop | Type | Description |
| ---- | ---- | ----------- |
| id | string |  |
| size | number |  |
    `.trim()
    );
    expect(resultMdx['functions/helpers/metadata.mdx']).toBe(
      `
## Functions

### convertToMetadata

Converts the information to metadata.

#### Parameters

| Parameter | Type | Description |
| ---- | ---- | ----------- |
| information | [Object](#convertToMetadata_information) |  |

#### Returns

[Metadata](../../../types/helpers/types)

### getInformation

Gets the component information from the given metadata.

#### Parameters

| Parameter | Type | Description |
| ---- | ---- | ----------- |
| metadata | [Metadata](../../../types/helpers/types) | The metadata used for the test component. |

#### Returns

[ComponentInfo](../../../types/helpers/types)

## Types

### convertToMetadata_information

| Prop | Type | Description |
| ---- | ---- | ----------- |
| id | string |  |
| size | number |  |
    `.trim()
    );

    expect(resultMd['functions/helpers/array.md']).toBe(
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
    expect(resultMdx['functions/helpers/array.mdx']).toBe(
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

    expect(resultMd['functions/packages/object/keys.md']).toBe(
      `
## Functions

### getMetadataValues

#### Parameters

| Parameter | Type | Description |
| ---- | ---- | ----------- |
| object | Record<string, [Metadata](../../../../types/helpers/types.md)> |  |

#### Returns

Array<[Metadata](../../../../types/helpers/types.md)>

### getObjectKeys

#### Parameters

| Parameter | Type | Description |
| ---- | ---- | ----------- |
| object | Record<string, any> |  |

#### Returns

Array<string>

## Types

### ExampleValue

| Prop | Type | Description |
| ---- | ---- | ----------- |
| field | string |  |
| num | number |  |

### ExampleValueWithoutNumber

Use this utility type to omit field with number values.

\`\`\`ts
type ExampleValueWithoutNumber = OmitNumberValues<ExampleValue>;
\`\`\`

### OmitNumberValues

\`\`\`ts
type OmitNumberValues = ;
\`\`\`
    `.trim()
    );
    expect(resultMdx['functions/packages/object/keys.mdx']).toBe(
      `
## Functions

### getMetadataValues

#### Parameters

| Parameter | Type | Description |
| ---- | ---- | ----------- |
| object | Record<string, [Metadata](../../../../types/helpers/types)> |  |

#### Returns

Array<[Metadata](../../../../types/helpers/types)>

### getObjectKeys

#### Parameters

| Parameter | Type | Description |
| ---- | ---- | ----------- |
| object | Record<string, any> |  |

#### Returns

Array<string>

## Types

### ExampleValue

| Prop | Type | Description |
| ---- | ---- | ----------- |
| field | string |  |
| num | number |  |

### ExampleValueWithoutNumber

Use this utility type to omit field with number values.

\`\`\`ts
type ExampleValueWithoutNumber = OmitNumberValues<ExampleValue>;
\`\`\`

### OmitNumberValues

\`\`\`ts
type OmitNumberValues = ;
\`\`\`
    `.trim()
    );
  });

  test('types', () => {
    expect(resultMd['types/helpers/types.md']).toBe(
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
    expect(resultMdx['types/helpers/types.mdx']).toBe(
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
