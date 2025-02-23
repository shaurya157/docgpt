'use client';

import React, { createContext, useContext, useState } from 'react';

type DocumentSettings = {
  setActiveUserDocument: React.Dispatch<React.SetStateAction<any>>;
  activeUserDocument?: any | null;
  providedTemplates?: any[] | null;
};

export const TemplateSettings = createContext<DocumentSettings | null>(null);

interface DocumentProviderProps {
  children: React.ReactNode;
  docgptProvidedTemplates?: any | null;
  userDocument?: any | null;
}

export default function DocumentProvider({
  children,
  docgptProvidedTemplates,
  userDocument,
}: DocumentProviderProps) {
  const [providedTemplates] = useState(docgptProvidedTemplates);
  const [activeUserDocument, setActiveUserDocument] = useState(userDocument);

  return (
    <TemplateSettings.Provider
      value={{
        activeUserDocument,
        providedTemplates,
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
