---
layout: ../../../../layouts/Layout.astro
---

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