export enum OutputMode {
  PLAIN_MARKDOWN = 'plain-markdown',
  PROCESSED_MARKDOWN = 'processed-markdown'
}
export enum FileExtension {
  MD = 'md',
  MDX = 'mdx'
}

export function generateTextBasedOnMode(
  text: string,
  fileExtension: FileExtension,
  mode: OutputMode
) {
  if (mode === OutputMode.PLAIN_MARKDOWN) {
    return `${text}.${fileExtension}`;
  }

  return text;
}
