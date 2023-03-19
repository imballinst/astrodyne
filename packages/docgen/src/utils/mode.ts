export type OutputMode = 'github' | 'astro';

export function generateTextBasedOnMode(text: string, mode: OutputMode) {
  if (mode === 'github') {
    return `${text}.md`;
  }

  return `${text}.mdx`;
}
