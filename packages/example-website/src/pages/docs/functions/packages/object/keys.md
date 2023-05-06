---
layout: ../../../../../layouts/Layout.astro
---

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

```ts
type ExampleValueWithoutNumber = OmitNumberValues<ExampleValue>;
```

### OmitNumberValues

```ts
type OmitNumberValues = ;
```