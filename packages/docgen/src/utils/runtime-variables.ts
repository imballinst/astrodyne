import { FileExtension, OutputMode } from './mode';

export interface LeafConfig {
  base?: string;
  injectedFrontmatter?: {
    layout?: string;
  };
}

export const RUNTIME_VARIABLES = {
  fileExtension: FileExtension.MD,
  outputMode: OutputMode.PLAIN_MARKDOWN,
  // Assume this is true. For GitHub pages, mainly.
  isTrailingSlashUsed: true,
  config: {
    base: '',
    injectedFrontmatter: {
      layout: ''
    }
  } as LeafConfig
};
