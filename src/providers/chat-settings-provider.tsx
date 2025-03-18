'use client';

import { createContext, useContext, useState } from 'react';

import { useDocument } from '@/providers/document-provider';
import { useUserDataContext } from '@/providers/user-data-provider';

type ChatSettings = {
  selectedTemplate: {};
  userTemplates: any[] | null | undefined;
  handleSelectedTemplate: (id: string) => void;
};

export const ChatSettingsContext = createContext<ChatSettings | null>(null);

interface ChatSettingsProviderProps {
  children: React.ReactNode;
  changeEditorContent?: (content: any) => void;
}

export default function ChatSettingsProvider({
  children,
  changeEditorContent,
}: ChatSettingsProviderProps) {
  const { providedTemplates } = useDocument();
  const { userTemplates } = useUserDataContext();

  const [selectedTemplate, setSelectedTemplate] = useState({
    id: '0',
    template: [
      {
        children: [{ text: '' }],
        type: 'h1',
      }
    ],
    templateName: 'No Template',
  });

  const handleSelectedTemplate = (id: string) => {
    let template = providedTemplates
      ?.concat(userTemplates)
      .find((templ) => templ['id'] === id);

    if (!template) {
      template = {
        id: '',
        template: [
          {
            id: '1',
            children: [
              {
                text: '',
              },
            ],
            type: 'h1',
          },
        ],
        templateName: 'No Template',
      };
    }

    setSelectedTemplate(template);
    if (changeEditorContent) changeEditorContent(template['template']);
  };

  return (
    <ChatSettingsContext.Provider
      value={{
        selectedTemplate,
        userTemplates,
        handleSelectedTemplate,
      }}
    >
      {children}
    </ChatSettingsContext.Provider>
  );
}

export function useChatSettings() {
  const context = useContext(ChatSettingsContext);
  if (!context) {
    throw new Error(
      'useChatSettings must be used within a ChatSettingsProvider'
    );
  }

  return context;
}
