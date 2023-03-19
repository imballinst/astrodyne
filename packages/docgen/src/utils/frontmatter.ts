export interface Frontmatter {
  title: string;
  description: string;
}

export function prependWithFrontmatterIfExist(
  text: string,
  frontmatter: Frontmatter | undefined
) {
  if (!frontmatter) return text;

  return `
---
title: ${frontmatter.title}
description: ${frontmatter.description}
---

${text}
  `.trim();
}
