'use client';

import React, { createContext, useContext, useState } from 'react';

import { Template } from '@/types';

type DocumentSettings = {
  setActiveTemplate: React.Dispatch<React.SetStateAction<Template | null>>
  setActiveUserDocument: React.Dispatch<React.SetStateAction<any>>;
  activeTemplate?: any | null;
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
  const [activeTemplate, setActiveTemplate] = useState(null)

  return (
    <TemplateSettings.Provider
      value={{
        activeTemplate,
        activeUserDocument,
        providedTemplates,
        setActiveTemplate,
        setActiveUserDocument
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
