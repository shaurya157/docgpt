"use client"

import React, {createContext, useContext, useState} from "react";

type UserDataContext = {
    assistantId?: string | null;
    threadId?: string | null;
    setAssistantId: React.Dispatch<React.SetStateAction<string>>;
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
    openAiVectorStoreId?: string | null,
    openAiThreadId?: string | null,
    filesData: Map<string, string>[] | null,
    children: React.ReactNode,
    userDocument?: any | null,
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
                                                    userDocuments
                                                }: UserDataProviderProps) {
    const [assistantId, setAssistantId] = useState(openAiAssistantId)
    const [threadId, setThreadId] = useState(openAiThreadId)
    const [files, setFiles] = useState(filesData)
    const [vectorStoreId, setVectorStoreId] = useState(openAiVectorStoreId)
    const [userTemplates] = useState(userDefinedTemplates)
    const [userOwnedDocuments] = useState(userDocuments)

    return (
        <UserDataContext.Provider value={{
            assistantId,
            setAssistantId,
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
