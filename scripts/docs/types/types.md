## Types

### ComponentInfo

Component info.

```ts
interface ComponentInfo {
  size: number;
  sizeArray: number[];
  test: "World2"[];
  test2: ("World2" | "Hello2")[];
  test3: World[];
}
```

### Metadata

The metadata used for the test component.

```ts
interface Metadata {
  componentId: string;
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