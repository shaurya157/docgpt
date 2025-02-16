'use client';

import { createContext, useContext, useState } from 'react';

type AssistantDefinitions = {
  docgptProvidedAssistantDefinitions: {}[];
};

export const AssistantDefinitionsContext =
  createContext<AssistantDefinitions | null>(null);

interface AssistantsProviderProps {
  children: React.ReactNode;
  providedAssistantDefinitions: {}[];
}

export default function AssistantsProvider({
  children,
  providedAssistantDefinitions,
}: AssistantsProviderProps) {
  const [docgptProvidedAssistantDefinitions] = useState(
    providedAssistantDefinitions
  );

  return (
    <AssistantDefinitionsContext.Provider
      value={{
        docgptProvidedAssistantDefinitions,
      }}
    >
      {children}
    </AssistantDefinitionsContext.Provider>
  );
}

export function useAssistantDefinitions() {
  const context = useContext(AssistantDefinitionsContext);
  if (!context) {
    throw new Error(
      'useAssistantDefintions must be used within a AssistantsProvider'
    );
  }

  return context;
}
