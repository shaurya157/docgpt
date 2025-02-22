'use client';

import React, { createContext, useContext, useState } from 'react';

type DocumentSettings = {
  setActiveUserDocument: React.Dispatch<React.SetStateAction<any>>;
  activeTemplate?: Map<string, any | string> | null;
  activeUserDocument?: any | null;
  providedTemplates?: any[] | null;
  setActiveTemplate?: React.Dispatch<React.SetStateAction<Map<string, string>>>;
};
export const TemplateSettings = createContext<DocumentSettings | null>(null);

interface DocumentProviderProps {
  children: React.ReactNode;
  docgptProvidedTemplates?: any | null;
  template?: any | null;
  userDocument?: any | null;
}

export default function DocumentProvider({
  children,
  docgptProvidedTemplates,
  template,
  userDocument,
}: DocumentProviderProps) {
  const [activeTemplate, setActiveTemplate] = useState(template);
  const [providedTemplates] = useState(docgptProvidedTemplates);
  const [activeUserDocument, setActiveUserDocument] = useState(userDocument);

  return (
    <TemplateSettings.Provider
      value={{
        activeTemplate,
        activeUserDocument,
        providedTemplates,
        setActiveTemplate,
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
    throw new Error('useDocument must be used within an DocumentProvider');
  }

  return context;
}
