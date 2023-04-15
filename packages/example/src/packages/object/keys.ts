import { Metadata } from '../../helpers/types';

type OmitNumberValues<T extends object> = {
  [K in keyof T as T[K] extends number ? never : K]: T[K] extends number
    ? never
    : T[K];
};

interface ExampleValue {
  field: string;
  num: number;
}
export type ExampleValueWithoutNumber = OmitNumberValues<ExampleValue>;

export function getObjectKeys(object: Record<string, any>) {
  return Object.keys(object);
}

export function getMetadataValues(object: Record<string, Metadata>) {
  return Object.values(object);
}
