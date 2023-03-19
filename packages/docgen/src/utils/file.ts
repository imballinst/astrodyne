import fs from 'fs-extra';
import { dirname, relative } from 'path';
import { Source } from '../models/source';
import { generateTextBasedOnMode, OutputMode } from './mode';

export function getRelativePath(
  src: Source | undefined,
  dst: Source | undefined,
  mode: OutputMode
) {
  if (!src || !dst) return '';

  return relative(
    `docs/stub/${dirname(src.fileName)}`,
    `docs/types/${dst.fileName}`
  ).replace(/\.tsx?/, generateTextBasedOnMode('', mode));
}

export async function isDirectoryExist(dir: string) {
  try {
    await fs.stat(dir);
    return true;
  } catch (err) {
    return false;
  }
}
