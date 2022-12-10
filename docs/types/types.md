## Types

### ComponentInfo

Component info.

```ts
interface ComponentInfo {
  // This determines the size of the component.
  size: number;
  // This determines the size array of the component.
  sizeArray: number[];
  // Sampel test field
  test: "World2"[];
  // Sampel test field
  test2: ("World2" | "Hello2")[];
  // Sampel test field
  test3: World[];
}
```

### Metadata

The metadata used for the test component.

```ts
interface Metadata {
  // The component ID.
  componentId: string;
  // The component information.
  componentInfo: ComponentInfo;
}
```

### Hello

Test normal type assign.

```ts
type Hello = "World2";
```

### World

Test normal type assign 2.

```ts
type World = ("Hello2" | "World2");
```

### XD

Test normal type object.

```ts
type XD = {
  test: string
};
```