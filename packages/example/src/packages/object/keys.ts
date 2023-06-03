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
/**
 * Use this utility type to omit field with number values.
 */
export type ExampleValueWithoutNumber = OmitNumberValues<ExampleValue>;

export type OmitValuesOfType<T extends object, IgnoredType> = {
  [K in keyof T as T[K] extends IgnoredType
    ? never
    : K]: T[K] extends IgnoredType ? never : T[K];
};

export type ExampleValueWithoutNumber2 = OmitValuesOfType<ExampleValue, number>;

export function getObjectKeys(object: Record<string, any>) {
  return Object.keys(object);
}

export function getMetadataValues(object: Record<string, Metadata>) {
  return Object.values(object);
}
