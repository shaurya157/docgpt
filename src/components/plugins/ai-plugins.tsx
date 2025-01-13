'use client';

import React from 'react';
import { editorPromptTemplate } from '@/utils/editor-prompt-util';
import { withProps } from '@udecode/cn';
import { AIChatPlugin, AIPlugin } from '@udecode/plate-ai/react';
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import {
  CodeBlockPlugin,
  CodeLinePlugin,
  CodeSyntaxPlugin,
} from '@udecode/plate-code-block/react';
import {
  createPlateEditor,
  ParagraphPlugin,
  PlateLeaf,
} from '@udecode/plate-common/react';
import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
} from '@udecode/plate-font/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { HeadingPlugin } from '@udecode/plate-heading/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { IndentListPlugin } from '@udecode/plate-indent-list/react';
import { IndentPlugin } from '@udecode/plate-indent/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import { MarkdownPlugin } from '@udecode/plate-markdown';
import { BlockSelectionPlugin } from '@udecode/plate-selection/react';
import Prism from 'prismjs';

import { useCustomAIChatHooks } from '@/hooks/custom-ai-chat-hook';

import { AIMenu } from '../plate-ui/ai-menu';
import { BlockquoteElement } from '../plate-ui/blockquote-element';
import { CodeBlockElement } from '../plate-ui/code-block-element';
import { CodeLeaf } from '../plate-ui/code-leaf';
import { CodeLineElement } from '../plate-ui/code-line-element';
import { CodeSyntaxLeaf } from '../plate-ui/code-syntax-leaf';
import { SelectionOverlayPlugin } from '../plate-ui/cursor-overlay';
import { HeadingElement } from '../plate-ui/heading-element';
import { HrElement } from '../plate-ui/hr-element';
import { LinkElement } from '../plate-ui/link-element';
import { LinkFloatingToolbar } from '../plate-ui/link-floating-toolbar';
import { ParagraphElement } from '../plate-ui/paragraph-element';

export const createAIEditor = () => {
  const editor = createPlateEditor({
    id: 'ai',
    override: {
      components: {
        [BlockquotePlugin.key]: BlockquoteElement,
        [BoldPlugin.key]: withProps(PlateLeaf, { as: 'strong' }),
        [CodeBlockPlugin.key]: CodeBlockElement,
        [CodeLinePlugin.key]: CodeLineElement,
        [CodePlugin.key]: CodeLeaf,
        [CodeSyntaxPlugin.key]: CodeSyntaxLeaf,
        [HEADING_KEYS.h1]: withProps(HeadingElement, { variant: 'h1' }),
        [HEADING_KEYS.h2]: withProps(HeadingElement, { variant: 'h2' }),
        [HEADING_KEYS.h3]: withProps(HeadingElement, { variant: 'h3' }),
        [HorizontalRulePlugin.key]: HrElement,
        [ItalicPlugin.key]: withProps(PlateLeaf, { as: 'em' }),
        [LinkPlugin.key]: LinkElement,
        [ParagraphPlugin.key]: ParagraphElement,
        [StrikethroughPlugin.key]: withProps(PlateLeaf, { as: 's' }),
        [UnderlinePlugin.key]: withProps(PlateLeaf, { as: 'u' }),
      },
    },
    plugins: [
      ParagraphPlugin,
      IndentPlugin.configure({
        inject: {
          targetPlugins: [
            ParagraphPlugin.key,
            HEADING_KEYS.h1,
            HEADING_KEYS.h2,
            HEADING_KEYS.h3,
            BlockquotePlugin.key,
            CodeBlockPlugin.key,
          ],
        },
      }),
      IndentListPlugin.configure({
        inject: {
          targetPlugins: [
            ParagraphPlugin.key,
            HEADING_KEYS.h1,
            HEADING_KEYS.h2,
            HEADING_KEYS.h3,
            BlockquotePlugin.key,
            CodeBlockPlugin.key,
          ],
        },
      }),
      HeadingPlugin.configure({ options: { levels: 3 } }),
      BlockquotePlugin,
      CodeBlockPlugin.configure({ options: { prism: Prism } }),
      HorizontalRulePlugin,
      LinkPlugin.configure({
        render: { afterEditable: () => <LinkFloatingToolbar /> },
      }),
      MarkdownPlugin.configure({ options: { indentList: false } }),
      // FIXME: Fixed the throw error: BlockSelectionPlugin is missing. readonly editor need'nt this plugin so using an empty plugin instead
      BlockSelectionPlugin.configure({
        api: {},
        extendEditor: null,
        options: {},
        render: {},
        useHooks: null,
        handlers: {},
      }),
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      StrikethroughPlugin,
      CodePlugin,
      FontColorPlugin,
      FontBackgroundColorPlugin,
    ],
    value: [{ children: [{ text: '' }], type: 'p' }],
  });

  return editor;
};

export const aiPlugins = [
  SelectionOverlayPlugin,
  MarkdownPlugin.configure({ options: { indentList: true } }),
  AIPlugin,
  AIChatPlugin.configure({
    options: {
      createAIEditor,
      promptTemplate: editorPromptTemplate,
      scrollContainerSelector: '#scroll_container',
      // systemTemplate: ({ isBlockSelecting, isSelecting }) => {
      //   console.log("isBlockSelecting", isBlockSelecting)
      //   console.log("isSelecting", isSelecting)
      //   return !isBlockSelecting
      //     ? PROMPT_TEMPLATES.systemBlockSelecting
      //     : isSelecting
      //       ? PROMPT_TEMPLATES.systemSelecting
      //       : PROMPT_TEMPLATES.systemDefault;
      // },
    },
    render: { afterEditable: () => <AIMenu /> },
  }).extend(() => ({
    useHooks: useCustomAIChatHooks,
  })),
] as const;
