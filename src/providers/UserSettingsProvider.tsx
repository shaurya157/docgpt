"use client"

import React, {createContext, useContext, useState} from "react";

type UserSettings = {
  activeTemplate?: Map<string, string | any> | null;
  setActiveTemplate?: React.Dispatch<React.SetStateAction<Map<string, string>>>
}
export const UserSettings = createContext<UserSettings | null>(null)

interface UserSettingsProviderProps {
  userTemplate?: any | null;
  children: React.ReactNode,
}

export default function UserSettingsProvider({ children, userTemplate }: UserSettingsProviderProps) {
  const [activeTemplate, setActiveTemplate] = useState(userTemplate)
  return (
    <UserSettings.Provider value={{
      activeTemplate,
      setActiveTemplate
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
