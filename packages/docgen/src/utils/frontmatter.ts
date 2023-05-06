export interface Frontmatter {
  title: string;
  description: string;
}

export function prependWithFrontmatterIfExist(
  text: string,
  frontmatter?: Frontmatter,
  additionalFrontmatter?: Record<string, string>
) {
  const allFrontmatter: Record<string, string> = {};
  if (frontmatter) {
    for (const key in frontmatter) {
      allFrontmatter[key] = frontmatter[key as keyof Frontmatter];
    }
  }
  if (additionalFrontmatter) {
    for (const key in additionalFrontmatter) {
      allFrontmatter[key] = additionalFrontmatter[key];
    }
  }

  const keys = Object.keys(allFrontmatter);
  if (keys.length === 0) return text;

  return `
---
${keys.map((key) => `${key}: ${allFrontmatter[key]}`).join('\n')}
---

${text}
  `.trim();
}
