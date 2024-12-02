"use client"

import React, {createContext, useContext, useState} from "react";

type UserSettings = {
  activeTemplate?: Map<string, string | any> | null;
  setActiveTemplate?: React.Dispatch<React.SetStateAction<Map<string, string>>>;
  providedTemplates?: any[] | null;
}
export const TemplateSettings = createContext<UserSettings | null>(null)

interface TemplateProviderProps {
  displayedTemplate?: any | null;
  docgptProvidedTemplates?: any | null;
  children: React.ReactNode;
  slug?: string
}

export default function TemplateProvider({ children, displayedTemplate, docgptProvidedTemplates, slug }: TemplateProviderProps) {

  const [activeTemplate, setActiveTemplate] = useState(displayedTemplate)
  const [providedTemplates] = useState(docgptProvidedTemplates)


  return (
    <TemplateSettings.Provider value={{
      activeTemplate,
      setActiveTemplate,
      providedTemplates
    }}>
      {children}
    </TemplateSettings.Provider>
  )
}

export function useTemplate() {
  const context = useContext(TemplateSettings);
  if (!context) {
    throw new Error('useUserSettings must be used within an UserSettingsProvider');
  }

  return context
}
