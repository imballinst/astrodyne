import { Metadata } from './types';

/**
 * Gets the component information from the given metadata.
 */
export function getInformation(metadata: Metadata) {
  return metadata.componentInfo;
}

/**
 * Converts the information to metadata.
 */
export function convertToMetadata(information: {
  id: string;
  size: number;
}): Metadata {
  return {
    componentId: information.id,
    componentInfo: {
      sizeArray: [],
      test: [],
      size: information.size
    }
  };
}
