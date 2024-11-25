"use client"

import React, {createContext, useContext, useState} from "react";

type UserSettings = {
  template?: Map<string, string> | null;
  setTemplate?: React.Dispatch<React.SetStateAction<Map<string, string>>>
}
export const UserSettings = createContext<UserSettings | null>(null)

interface UserSettingsProviderProps {
  userTemplate?: Map<string, string> | null;
  children: React.ReactNode,
}

export default function UserSettingsProvider({ children, userTemplate }: UserSettingsProviderProps) {
  const [template, setTemplate] = useState(userTemplate)

  return (
    <UserSettings.Provider value={{
      template,
      setTemplate
    }}>
      {children}
    </UserSettings.Provider>
  )
}

export function useUserSettings() {
  const context = useContext(UserSettings);
  if (!context) {
    throw new Error('useUserSettings must be used within an UserSettingsProvider');
  }

  return context
}
