import { FileExtension, OutputMode } from './mode';

export const RUNTIME_VARIABLES = {
  fileExtension: FileExtension.MD,
  outputMode: OutputMode.PLAIN_MARKDOWN,
  // Assume this is true. For GitHub pages, mainly.
  isTrailingSlashUsed: true
};
