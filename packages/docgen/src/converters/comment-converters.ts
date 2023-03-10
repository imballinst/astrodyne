import { Comment } from '../models/comment';
import { NewlinePresentation } from './type-converters';

const TAG_TO_TAG_DESCRIPTION: Record<string, string> = {
  '@deprecated': 'Deprecated'
};

export function convertCommentToString(
  comment: Comment | undefined,
  newlineCharacter: NewlinePresentation
) {
  const tags = comment?.blockTags || [];
  const summary = comment?.summary || [];
  let description = '';

  if (tags.length > 0) {
    description += tags
      .map((tag) => {
        const description = tag.content
          .map((block) => block.text.replace(/\n/g, newlineCharacter))
          .join('');
        const tagName = TAG_TO_TAG_DESCRIPTION[tag.tag]
          ? `**[${TAG_TO_TAG_DESCRIPTION[tag.tag]}]** `
          : '';

        return `${tagName}${description}`;
      })
      .join('\n');
  }

  if (summary.length > 0) {
    description += (summary || [])
      .map((block) => block.text.replace(/\n/g, newlineCharacter))
      .join('');
  }

  return description;
}
