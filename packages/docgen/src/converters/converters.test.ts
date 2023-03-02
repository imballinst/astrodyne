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

## API

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

| Prop | Type | Description |
| ---- | ---- | ----------- |
| information | object | The information object. |
| information.id | object | The component ID. |
| information.number | object | The component information's size. |

#### Returns

### getInformation

Gets the component information from the given metadata.

## Types
    `.trim()
    );
  });
});
