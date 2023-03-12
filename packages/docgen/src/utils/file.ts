import { relative } from 'path';
import { Source } from '../models/source';

export function getRelativePath(
  src: Source | undefined,
  dst: Source | undefined
) {
  if (!src || !dst) return '';

  return relative(
    `docs/stub/${src.fileName}`,
    `docs/types/${dst.fileName}`
  ).replace(/\.tsx?/, '.md');
}
