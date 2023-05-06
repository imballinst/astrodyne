import fs from 'fs-extra';
import { dirname, relative } from 'path';
import { Source } from '../models/source';
import { generateTextBasedOnMode } from './mode';
import { RUNTIME_VARIABLES } from './runtime-variables';

export function getRelativePath({
  src,
  dst
}: {
  src: Source | undefined;
  dst: Source | undefined;
}) {
  if (!src || !dst) return '';

  let srcDir = `docs/stub/${dirname(src.fileName)}`;
  if (RUNTIME_VARIABLES.isTrailingSlashUsed) {
    srcDir = `${srcDir}/stub`;
  }

  return relative(srcDir, `docs/types/${dst.fileName}`).replace(
    /\.tsx?/,
    generateTextBasedOnMode(
      '',
      RUNTIME_VARIABLES.fileExtension,
      RUNTIME_VARIABLES.outputMode
    )
  );
}

export async function isDirectoryExist(dir: string) {
  try {
    await fs.stat(dir);
    return true;
  } catch (err) {
    return false;
  }
}
