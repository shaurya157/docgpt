"use client"

import React, {createContext, useContext, useState} from "react";

type UserSettings = {
    ui: "document" | "chat";
    setUi:  React.Dispatch<React.SetStateAction<"document" | "chat">>;
}

export const UserSettings = createContext<UserSettings | null>(null)

interface UserProviderProps {
  initialUi?: "document" | "chat" | null;
  children: React.ReactNode;
}

export default function UserSettingsProvider({ children, initialUi }: UserProviderProps) {

  const [ui, setUi] = useState(initialUi ? initialUi : "document")

  return (
    <UserSettings.Provider value={{
      ui,
      setUi,
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
