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

```ts
type Hello = "World2";
```

### Metadata

The metadata used for the test component.

| Prop | Type | Description |
| ---- | ---- | ----------- |
| componentId | string | The component ID. |
| componentInfo | ComponentInfo | The component information. |

### World

Test normal type assign 2.

```ts
type World = ("Hello2" | "World2");
```

### XD

Test normal type object.

| Prop | Type | Description |
| ---- | ---- | ----------- |
| test | string |  |