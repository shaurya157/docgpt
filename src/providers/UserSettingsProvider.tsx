"use client"

import React, {createContext, useContext, useState} from "react";

type UserSettings = {
  template?: string | null;
  setTemplate?: React.Dispatch<React.SetStateAction<string>>
}
export const UserSettings = createContext<UserSettings | null>(null)

interface UserSettingsProviderProps {
  userTemplate?: string | null;
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
