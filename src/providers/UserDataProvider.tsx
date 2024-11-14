"use client"

import React, {createContext} from "react";

const UserDataContext = createContext({})

interface UserDataProviderProps {
  assistantId?: unknown
}

interface UserDataProviderProps {
  threadId?: unknown
}

export default function UserDataProvider({children, assistantId, threadId}) {
  return (
    <UserDataContext.Provider value="dark">
      {children}
    </UserDataContext.Provider>
  )
}
