import type { TMentionItemBase } from '@udecode/plate-mention';

export interface MyMentionItem extends TMentionItemBase {
  key: string;
}

export const MENTIONABLES: MyMentionItem[] = [
  { key: '0', text: 'docgpt' }
];
