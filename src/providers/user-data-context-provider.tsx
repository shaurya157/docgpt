"use client"

import React, {createContext, useContext, useState} from "react";

type UserDataContext = {
    assistantId?: string | null;
    chatAssistantId?: string | null;
    threadId?: string | null;
    setAssistantId: React.Dispatch<React.SetStateAction<string>>;
    setChatAssistantId: React.Dispatch<React.SetStateAction<string>>;
    setThreadId: React.Dispatch<React.SetStateAction<string>>;
    files: Map<string, string>[] | null;
    setFiles: React.Dispatch<React.SetStateAction<Map<string, string>[]>>,
    vectorStoreId?: string | null;
    setVectorStoreId: React.Dispatch<React.SetStateAction<string>>;
    userTemplates?: Map<string, string | any>[] | null;
    userOwnedDocuments?: any[] | null,
}
export const UserDataContext = createContext<UserDataContext | null>(null)

interface UserDataProviderProps {
  openAiAssistantId?: string | null,
  openAiChatAssistantId?: string | null,
  openAiVectorStoreId?: string | null,
  openAiThreadId?: string | null,
  filesData: Map<string, string>[] | null,
  children: React.ReactNode,
  userDefinedTemplates?: Map<string, string | any>[] | null,
  userDocuments?: any[] | null,
}

export default function UserDataContextProvider({
                                                  children,
                                                  openAiThreadId,
                                                  openAiAssistantId,
                                                  filesData,
                                                  openAiVectorStoreId,
                                                  userDefinedTemplates,
                                                  userDocuments,
                                                  openAiChatAssistantId
                                                }: UserDataProviderProps) {
    const [assistantId, setAssistantId] = useState(openAiAssistantId)
    const [chatAssistantId, setChatAssistantId] = useState(openAiChatAssistantId)
    const [threadId, setThreadId] = useState(openAiThreadId)
    const [files, setFiles] = useState(filesData)
    const [vectorStoreId, setVectorStoreId] = useState(openAiVectorStoreId)
    const [userTemplates] = useState(userDefinedTemplates)
    const [userOwnedDocuments] = useState(userDocuments)

    return (
        <UserDataContext.Provider value={{
          assistantId,
          setAssistantId,
          chatAssistantId,
          setChatAssistantId,
          threadId,
          setThreadId,
          files,
          setFiles,
          vectorStoreId,
          setVectorStoreId,
          userTemplates,
          userOwnedDocuments,
        }}>
            {children}
        </UserDataContext.Provider>
    )
}

export function useUserDataContext() {
    const context = useContext(UserDataContext);
    if (!context) {
        throw new Error('useUserDataContext must be used within an UserDataContextProvider');
    }

    return context
}
