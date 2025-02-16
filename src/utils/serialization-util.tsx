import { Descendant } from '@udecode/plate';
import { deserializeInlineMd } from '@udecode/plate-markdown';
import { PlateEditor } from "@udecode/plate/react";

export const deserializeText = (text) => {};

export default function deserializeListMd(
  input: string,
  editor: PlateEditor,
  listStyleType: string
) {
  const match = input.match(/^\s*/);
  const indent = match ? (match[0].length % 2) + 1 : 1;
  const deserialized = deserializeInlineMd(editor, input.trim());

  return [
    {
      id: Math.floor(Math.random() * 1000).toString(),
      children: deserialized,
      indent: indent,
      listStyleType,
      type: 'p',
    },
  ] as Descendant[];
}

export function classifyStart(input: string): 'decimal' | 'disc' | null {
  // Regex to match '- ' or a digit followed by '.'
  const regex = /^\s*(-\s|\d+\.)/;

  const match = input.match(regex);
  if (!match) {
    return null;
  }

  // Check the matched group
  if (match[1].startsWith('-')) {
    return 'disc';
  } else if (/\d+\./.test(match[1])) {
    return 'decimal';
  }

  return null;
}
