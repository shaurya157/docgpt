import { TDescendant } from '@udecode/plate-common';
import { PlateEditor } from '@udecode/plate-common/react';
import { deserializeInlineMd } from '@udecode/plate-markdown';

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
      type: 'p',
      id: Math.floor(Math.random() * 1000).toString(),
      listStyleType,
      indent: indent,
      children: deserialized,
    },
  ] as TDescendant[];
}

export function classifyStart(input: string): 'disc' | 'decimal' | null {
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
