'use client';

import React, { createContext, useContext, useState } from 'react';

type DocumentSettings = {
  activeTemplate?: Map<string, string | any> | null;
  setActiveTemplate?: React.Dispatch<React.SetStateAction<Map<string, string>>>;
  providedTemplates?: any[] | null;
  activeUserDocument?: any | null;
  setActiveUserDocument: React.Dispatch<React.SetStateAction<any>>;
};
export const TemplateSettings = createContext<DocumentSettings | null>(null);

interface DocumentProviderProps {
  template?: any | null;
  docgptProvidedTemplates?: any | null;
  children: React.ReactNode;
  userDocument?: any | null;
}

export default function DocumentProvider({
  children,
  template,
  docgptProvidedTemplates,
  userDocument,
}: DocumentProviderProps) {
  const [activeTemplate, setActiveTemplate] = useState(template);
  const [providedTemplates] = useState(docgptProvidedTemplates);
  const [activeUserDocument, setActiveUserDocument] = useState(userDocument);

  return (
    <TemplateSettings.Provider
      value={{
        activeTemplate,
        setActiveTemplate,
        providedTemplates,
        activeUserDocument,
        setActiveUserDocument,
      }}
    >
      {children}
    </TemplateSettings.Provider>
  );
}

export function useDocument() {
  const context = useContext(TemplateSettings);
  if (!context) {
    throw new Error(
      'useUserSettings must be used within an UserSettingsProvider'
    );
  }

  return context;
}
