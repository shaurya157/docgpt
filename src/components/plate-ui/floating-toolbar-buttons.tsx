'use client';

import React from 'react';

import { getEditorPrompt } from '@udecode/plate-ai/react';
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import { useEditorReadOnly, useEditorRef } from '@udecode/plate/react';
import {
  BoldIcon,
  Code2Icon,
  ItalicIcon,
  StrikethroughIcon,
  UnderlineIcon,
  WandSparklesIcon,
} from 'lucide-react';
import { MessageSquarePlusIcon } from 'lucide-react';

import { Button } from '@/components/plate-ui/button';
import { useCustomContext } from '@/providers/custom-context-provider';
import { editorSelectionBlockTemplate } from '@/utils/editor-prompt-util';

import { AIToolbarButton } from './ai-toolbar-button';
import { CommentToolbarButton } from './comment-toolbar-button';
import { InlineEquationToolbarButton } from './inline-equation-toolbar-button';
import { LinkToolbarButton } from './link-toolbar-button';
import { MarkToolbarButton } from './mark-toolbar-button';
import { MoreDropdownMenu } from './more-dropdown-menu';
import { SuggestionToolbarButton } from './suggestion-toolbar-button';
import { ToolbarGroup } from './toolbar';
import { TurnIntoDropdownMenu } from './turn-into-dropdown-menu';
export function FloatingToolbarButtons() {
  const readOnly = useEditorReadOnly();
  const editor = useEditorRef();
  const { addCustomContext } = useCustomContext();

  const handleAddToChat = () => {
    const formattedSelection = getEditorPrompt(editor, {
      promptTemplate: editorSelectionBlockTemplate,
    });

    if (formattedSelection && formattedSelection.trim()) {
      addCustomContext(formattedSelection.trim());
    }
  };

  return (
    <>
      {!readOnly && (
        <>
          <ToolbarGroup>
            <AIToolbarButton tooltip="AI commands">
              <WandSparklesIcon />
              Quick Edit
            </AIToolbarButton>
          </ToolbarGroup>

          <ToolbarGroup>
            <Button variant="ghost" className="flex items-center" onClick={handleAddToChat}>
              <MessageSquarePlusIcon />
              <span>Add to chat</span>
            </Button>
          </ToolbarGroup>

          <ToolbarGroup>
            <TurnIntoDropdownMenu />

            <MarkToolbarButton nodeType={BoldPlugin.key} tooltip="Bold (⌘+B)">
              <BoldIcon />
            </MarkToolbarButton>

            <MarkToolbarButton
              nodeType={ItalicPlugin.key}
              tooltip="Italic (⌘+I)"
            >
              <ItalicIcon />
            </MarkToolbarButton>

            <MarkToolbarButton
              nodeType={UnderlinePlugin.key}
              tooltip="Underline (⌘+U)"
            >
              <UnderlineIcon />
            </MarkToolbarButton>

            <MarkToolbarButton
              nodeType={StrikethroughPlugin.key}
              tooltip="Strikethrough (⌘+⇧+M)"
            >
              <StrikethroughIcon />
            </MarkToolbarButton>

            <MarkToolbarButton nodeType={CodePlugin.key} tooltip="Code (⌘+E)">
              <Code2Icon />
            </MarkToolbarButton>

            <InlineEquationToolbarButton />

            <LinkToolbarButton />
          </ToolbarGroup>
        </>
      )}

      <ToolbarGroup>
        <CommentToolbarButton />
        <SuggestionToolbarButton />

        {!readOnly && <MoreDropdownMenu />}
      </ToolbarGroup>
    </>
  );
}
