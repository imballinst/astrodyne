import { Metadata } from '../helpers/types';

/**
 * The props passed to TestComponent.
 */
interface TestComponentProps {
  /** The title of the component. This is NOT the component ID. */
  title: string;
  /** The metadata of the component. */
  metadata: Metadata;
  /**
   * @deprecated Deprecated since 1.11.1. Please use `metadata` field instead as this might be
   * removed in the future.
   *
   * The component information.
   */
  information: Metadata;
}

/**
 * Renders a hello world text, the title, as well as the metadata.
 */
export function TestComponent({ title, metadata }: TestComponentProps) {
  return (
    <div>
      <div>Hello world</div>

      <h2>{title}</h2>

      <pre>{JSON.stringify(metadata, null, 2)}</pre>
    </div>
  );
}
