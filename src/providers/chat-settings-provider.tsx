'use client';

import { createContext, useContext, useState } from 'react';

import { useAssistantDefinitions } from '@/providers/assistants-provider';
import { useDocument } from '@/providers/document-provider';
import { useUserDataContext } from '@/providers/user-data-provider';
import { MenuItem } from '@/types';

type ChatSettings = {
  allAssistants: any[];
  selectedAssistant: {};
  selectedTemplate: {};
  userTemplates: any[] | null | undefined;
  handleSelectedAssistant: (name: string) => void;
  handleSelectedTemplate: (id: string) => void;
};

export const ChatSettingsContext = createContext<ChatSettings | null>(null);

interface ChatSettingsProviderProps {
  children: React.ReactNode;
  setActiveItem?: (id: MenuItem, documentRefreshOnly: boolean) => void;
}

export default function ChatSettingsProvider({
  children,
  setActiveItem,
}: ChatSettingsProviderProps) {
  const { docgptProvidedAssistantDefinitions } = useAssistantDefinitions();
  const { providedTemplates } = useDocument();
  const { userAssistants, userTemplates } = useUserDataContext();
  const { activeUserDocument, setActiveUserDocument } = useDocument();

  // Combine default and user assistants
  const allAssistants = [...docgptProvidedAssistantDefinitions, ...(userAssistants || [])];

  const [selectedAssistant, setSelectedAssistant] = useState(
    allAssistants.find(
      (assistant) => assistant['name'] === 'Default Assistant'
    )!
  );
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

  const handleSelectedAssistant = (name: string) => {
    const assistant = allAssistants.find(
      (assistant) => assistant['name'] === name
    );

    setSelectedAssistant(assistant!);
  };

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
    const currActiveDoc = { ...activeUserDocument };
    currActiveDoc['document'] = template['template'];
    if (setActiveItem) setActiveItem(currActiveDoc, true);
  };

  return (
    <ChatSettingsContext.Provider
      value={{
        allAssistants,
        selectedAssistant,
        selectedTemplate,
        userTemplates,
        handleSelectedAssistant,
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
