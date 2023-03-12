import fs from 'fs-extra';
import { dirname, relative } from 'path';
import { Source } from '../models/source';

export function getRelativePath(
  src: Source | undefined,
  dst: Source | undefined
) {
  if (!src || !dst) return '';

  return relative(
    `docs/stub/${dirname(src.fileName)}`,
    `docs/types/${dst.fileName}`
  ).replace(/\.tsx?/, '.md');
}

export async function isDirectoryExist(dir: string) {
  try {
    await fs.stat(dir);
    return true;
  } catch (err) {
    return false;
  }
}
