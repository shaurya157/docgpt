'use client';

import { createContext, useContext, useState } from 'react';
import { useAssistantDefinitions } from '@/providers/AssistantsProvider';
import { useDocument } from '@/providers/DocumentProvider';
import { useUserDataContext } from '@/providers/UserDataProvider';

type ChatSettings = {
  selectedAssistant: {};
  selectedTemplate: {};
  handleSelectedAssistant: (name: string) => void;
  handleSelectedTemplate: (id: string) => void;
};

export const ChatSettingsContext = createContext<ChatSettings | null>(null);

interface ChatSettingsProviderProps {
  children: React.ReactNode;
}

export default function ChatSettingsProvider({
  children,
}: ChatSettingsProviderProps) {
  const { docgptProvidedAssistantDefinitions } = useAssistantDefinitions();
  const { providedTemplates } = useDocument();
  const { userTemplates } = useUserDataContext();
  const { setActiveUserDocument } = useDocument();

  const [selectedAssistant, setSelectedAssistant] = useState(
    docgptProvidedAssistantDefinitions.find(
      (assistant) => assistant['name'] === 'Default'
    )!!
  );
  const [selectedTemplate, setSelectedTemplate] = useState({
    templateName: 'No Template',
    id: '',
  });

  // We are querying based on name here. This works fine as we do not support custom assistants yet.
  // Case: when users define 2 assistants with the same name, only assistant 1 will show up due to the find below
  // TODO: CHANGE to query based on ID, similar to handleSelectedTemplate method
  const handleSelectedAssistant = (name: string) => {
    const assistant = docgptProvidedAssistantDefinitions.find(
      (assistant) => assistant['name'] === name
    );

    setSelectedAssistant(assistant!!);
  };

  const handleSelectedTemplate = (id: string) => {
    let template = providedTemplates
      ?.concat(userTemplates)
      .find((templ) => templ['id'] === id);

    if (template) {
      setSelectedTemplate(template);
    } else {
      setSelectedTemplate({
        templateName: 'No Template',
        id: '',
      });
    }
  };

  return (
    <ChatSettingsContext.Provider
      value={{
        selectedAssistant,
        selectedTemplate,
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
