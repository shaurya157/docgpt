export interface EditBlock {
  newText: string;
  original: string;
}

/**
 * Parses the assistant's response content to extract Edit blocks.
 * @param content The raw content string potentially containing <Edit> tags.
 * @returns An array of EditBlock objects.
 */
export const parseEdits = (content: string): EditBlock[] => {
  const edits: EditBlock[] = [];
  const editRegex = /<Edit>[\s\S]*?<Original>([\s\S]*?)<\/Original>[\s\S]*?<New>([\s\S]*?)<\/New>[\s\S]*?<\/Edit>/g;
  let match;

  while ((match = editRegex.exec(content)) !== null) {
    edits.push({
      newText: match[2].trim(),
      original: match[1].trim(),
    });
  }

  return edits;
};