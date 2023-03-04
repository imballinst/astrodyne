import { Child } from "../models/models";

export type TypeIdRecord = Record<number, Child>

export interface EffectiveTypeResult {
  typeString: string;
  localTypeIdRecord: TypeIdRecord;
}

export interface EffectiveTypeResultWithDescription extends EffectiveTypeResult {
  description: string
}