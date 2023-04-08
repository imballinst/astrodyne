import { Metadata } from '../../helpers/types';

export function getObjectKeys(object: Record<string, any>) {
  return Object.keys(object);
}

export function getMetadataValues(object: Record<string, Metadata>) {
  return Object.values(object);
}
