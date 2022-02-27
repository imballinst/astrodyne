/**
 * The metadata used for the test component.
 */
export interface Metadata {
  /** The component ID. */
  componentId: string;
  /** The component information. */
  componentInfo: ComponentInfo;
}

/** Component info. */
export interface ComponentInfo {
  /** This determines the size of the component. */
  size: number;
  /** This determines the size array of the component. */
  sizeArray: number[];
  /** Sampel test field */
  test?: Hello[];
  /** Sampel test field */
  test2?: ('Hello2' | 'World2')[];
  /** Sampel test field */
  test3?: World[];
}

/**
 * Test normal type assign.
 */
export type Hello = 'World2';

/**
 * Test normal type assign 2.
 */
export type World = 'Hello2' | 'World2';
