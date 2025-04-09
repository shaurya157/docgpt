import React, { useEffect, useMemo } from 'react';

import { type SlateEditor, NodeApi } from '@udecode/plate';
// Removed incorrect import: import { getEditorString } from '@udecode/plate-common';
import { AIChatPlugin, AIPlugin } from '@udecode/plate-ai/react';
import { useIsSelecting } from '@udecode/plate-selection/react';
import {
  type PlateEditor,
  useEditorString, // Use the suggested hook
  useEditorRef,
  usePluginOption,
} from '@udecode/plate/react';
import {
  Album,
  BadgeHelp,
  Check,
  CornerUpLeft,
  FeatherIcon,
  ListEnd,
  ListMinus,
  ListPlus,
  MessageSquarePlus, // Added Icon
  PenLine,
  SmileIcon,
  Wand,
  X,
} from 'lucide-react';

import { useCustomContext } from '@/providers/custom-context-provider'; // Added import
import { CommandGroup, CommandItem } from './command';

export type EditorChatState =
  | 'cursorCommand'
  | 'cursorSuggestion'
  | 'selectionCommand'
  | 'selectionSuggestion';

// Define the type for onSelect more explicitly to satisfy TypeScript
type AiChatItemOnSelect = ({
  aiEditor,
  editor,
}: {
  aiEditor: SlateEditor;
  editor: PlateEditor;
}) => void;

// Define the structure for each item, including the optional onSelect
interface AiChatItem {
  icon: React.ReactNode;
  label: string;
  value: string;
  component?: React.ComponentType<{ menuState: EditorChatState }>;
  filterItems?: boolean;
  items?: { label: string; value: string }[];
  shortcut?: string;
  onSelect?: AiChatItemOnSelect;
}

// Helper function to get the custom context hook within the component's render cycle
const useAddToChatHandler = (editor: PlateEditor) => {
  const { addCustomContext } = useCustomContext();
  // Get selected text using the hook without arguments
  const selectedText = useEditorString();

  return () => {
    // selectedText is now derived from the hook call above
    if (selectedText && selectedText.trim()) { // Check if text exists and is not just whitespace
      addCustomContext(selectedText.trim());
      editor.getApi(AIChatPlugin).aiChat.hide(); // Hide the menu after adding
    }
  };
};


export const aiChatItems: Record<string, AiChatItem> = {
  accept: {
    icon: <Check />,
    label: 'Accept',
    value: 'accept',
    onSelect: ({ editor }) => {
      editor.getTransforms(AIChatPlugin).aiChat.accept();
      editor.tf.focus({ edge: 'end' });
    },
  },
  continueWrite: {
    icon: <PenLine />,
    label: 'Continue writing',
    value: 'continueWrite',
    onSelect: ({ editor }) => {
      const ancestorNode = editor.api.block({ highest: true });

      if (!ancestorNode) return;

      const isEmpty = NodeApi.string(ancestorNode[0]).trim().length === 0;

      void editor.getApi(AIChatPlugin).aiChat.submit({
        mode: 'insert',
        prompt: isEmpty
          ? `<Document>
{editor}
</Document>
Start writing a new paragraph AFTER <Document> ONLY ONE SENTENCE`
          : 'Continue writing AFTER <Block> ONLY ONE SENTENCE. DONT REPEAT THE TEXT.',
      });
    },
  },
  discard: {
    icon: <X />,
    label: 'Discard',
    shortcut: 'Escape',
    value: 'discard',
    onSelect: ({ editor }) => {
      editor.getTransforms(AIPlugin).ai.undo();
      editor.getApi(AIChatPlugin).aiChat.hide();
    },
  },
  emojify: {
    icon: <SmileIcon />,
    label: 'Emojify',
    value: 'emojify',
    onSelect: ({ editor }) => {
      void editor.getApi(AIChatPlugin).aiChat.submit({
        prompt: 'Emojify',
      });
    },
  },
  explain: {
    icon: <BadgeHelp />,
    label: 'Explain',
    value: 'explain',
    onSelect: ({ editor }) => {
      void editor.getApi(AIChatPlugin).aiChat.submit({
        prompt: {
          default: 'Explain {editor}',
          selecting: 'Explain',
        },
      });
    },
  },
  fixSpelling: {
    icon: <Check />,
    label: 'Fix spelling & grammar',
    value: 'fixSpelling',
    onSelect: ({ editor }) => {
      void editor.getApi(AIChatPlugin).aiChat.submit({
        prompt: 'Fix spelling and grammar',
      });
    },
  },
  improveWriting: {
    icon: <Wand />,
    label: 'Improve writing',
    value: 'improveWriting',
    onSelect: ({ editor }) => {
      void editor.getApi(AIChatPlugin).aiChat.submit({
        prompt: 'Improve the writing',
      });
    },
  },
  insertBelow: {
    icon: <ListEnd />,
    label: 'Insert below',
    value: 'insertBelow',
    onSelect: ({ aiEditor, editor }) => {
      void editor.getTransforms(AIChatPlugin).aiChat.insertBelow(aiEditor);
    },
  },
  makeLonger: {
    icon: <ListPlus />,
    label: 'Make longer',
    value: 'makeLonger',
    onSelect: ({ editor }) => {
      void editor.getApi(AIChatPlugin).aiChat.submit({
        prompt: 'Make longer',
      });
    },
  },
  makeShorter: {
    icon: <ListMinus />,
    label: 'Make shorter',
    value: 'makeShorter',
    onSelect: ({ editor }) => {
      void editor.getApi(AIChatPlugin).aiChat.submit({
        prompt: 'Make shorter',
      });
    },
  },
  replace: {
    icon: <Check />,
    label: 'Replace selection',
    value: 'replace',
    onSelect: ({ aiEditor, editor }) => {
      void editor.getTransforms(AIChatPlugin).aiChat.replaceSelection(aiEditor);
    },
  },
  simplifyLanguage: {
    icon: <FeatherIcon />,
    label: 'Simplify language',
    value: 'simplifyLanguage',
    onSelect: ({ editor }) => {
      void editor.getApi(AIChatPlugin).aiChat.submit({
        prompt: 'Simplify the language',
      });
    },
  },
  summarize: {
    icon: <Album />,
    label: 'Add a summary',
    value: 'summarize',
    onSelect: ({ editor }) => {
      void editor.getApi(AIChatPlugin).aiChat.submit({
        mode: 'insert',
        prompt: {
          default: 'Summarize {editor}',
          selecting: 'Summarize',
        },
      });
    },
  },
  tryAgain: {
    icon: <CornerUpLeft />,
    label: 'Try again',
    value: 'tryAgain',
    onSelect: ({ editor }) => {
      void editor.getApi(AIChatPlugin).aiChat.reload();
    },
  },
  addToChat: { // Added new item definition
    icon: <MessageSquarePlus />,
    label: 'Add to chat',
    value: 'addToChat',
    // onSelect will be handled specially within the component
    // to correctly use the hook context.
  },
};

const menuStateItems: Record<
  EditorChatState,
  {
    items: AiChatItem[]; // Use the defined interface
    heading?: string;
  }[]
> = {
  cursorCommand: [
    {
      items: [
        aiChatItems.continueWrite,
        aiChatItems.summarize,
        aiChatItems.explain,
      ],
    },
  ],
  cursorSuggestion: [
    {
      items: [aiChatItems.accept, aiChatItems.discard, aiChatItems.tryAgain],
    },
  ],
  selectionCommand: [
    {
      items: [
        aiChatItems.improveWriting,
        aiChatItems.emojify,
        aiChatItems.makeLonger,
        aiChatItems.makeShorter,
        aiChatItems.fixSpelling,
        aiChatItems.simplifyLanguage,
        aiChatItems.addToChat, // Added item to selection commands
      ],
    },
  ],
  selectionSuggestion: [
    {
      items: [
        aiChatItems.replace,
        aiChatItems.insertBelow,
        aiChatItems.discard,
        aiChatItems.tryAgain,
      ],
    },
  ],
};

export const AIMenuItems = ({
  setValue,
}: {
  setValue: (value: string) => void;
}) => {
  const editor = useEditorRef();
  const { messages } = usePluginOption(AIChatPlugin, 'chat');
  const aiEditor = usePluginOption(AIChatPlugin, 'aiEditor')!;
  const isSelecting = useIsSelecting();
  const handleAddToChat = useAddToChatHandler(editor); // Get the handler function

  const menuState = useMemo(() => {
    if (messages && messages.length > 0) {
      return isSelecting ? 'selectionSuggestion' : 'cursorSuggestion';
    }

    return isSelecting ? 'selectionCommand' : 'cursorCommand';
  }, [isSelecting, messages]);

  const menuGroups = useMemo(() => {
    return menuStateItems[menuState];
  }, [menuState]);

  useEffect(() => {
    if (menuGroups.length > 0 && menuGroups[0].items.length > 0) {
      setValue(menuGroups[0].items[0].value);
    }
  }, [menuGroups, setValue]);

  return (
    <>
      {menuGroups.map((group, index) => (
        <CommandGroup key={index} heading={group.heading}>
          {group.items.map((menuItem) => (
            <CommandItem
              key={menuItem.value}
              className="[&_svg]:text-muted-foreground"
              value={menuItem.value}
              onSelect={() => {
                // Call the specific onSelect OR handle addToChat directly
                if (menuItem.value === 'addToChat') {
                  handleAddToChat(); // Call the handler from the hook
                } else {
                  menuItem.onSelect?.({ // Call the item's defined onSelect
                    aiEditor,
                    editor: editor,
                  });
                }
              }}
            >
              {menuItem.icon}
              <span>{menuItem.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      ))}
    </>
  );
};
