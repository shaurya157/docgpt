"use client"

import React, {createContext, useContext, useState} from "react";

type UserDataContext = {
    assistantId?: string | null;
    threadId?: string | null;
    setAssistantId: React.Dispatch<React.SetStateAction<string>>;
    setThreadId: React.Dispatch<React.SetStateAction<string>>;
    fileIds: Map<string, string>[] | null;
    setFileIds: React.Dispatch<React.SetStateAction<Map<string, string>[]>>,
    vectorStoreId?: string | null;
    setVectorStoreId: React.Dispatch<React.SetStateAction<string>>;
    userDocument?: any | null;
}
export const UserDataContext = createContext<UserDataContext | null>(null)

interface UserDataProviderProps {
    openAiAssistantId?: string | null,
    openAiVectorStoreId?: string | null,
    openAiThreadId?: string | null,
    openAiFileIds: Map<string, string>[] | null,
    children: React.ReactNode,
    userDocument?: any | null
}

export default function UserDataContextProvider({
                                                    children,
                                                    openAiThreadId,
                                                    openAiAssistantId,
                                                    openAiFileIds,
                                                    openAiVectorStoreId,
                                                    userDocument
                                                }: UserDataProviderProps) {
    const [assistantId, setAssistantId] = useState(openAiAssistantId)
    const [threadId, setThreadId] = useState(openAiThreadId)
    const [fileIds, setFileIds] = useState(openAiFileIds)
    const [vectorStoreId, setVectorStoreId] = useState(openAiVectorStoreId)

    return (
        <UserDataContext.Provider value={{
            assistantId,
            setAssistantId,
            threadId,
            setThreadId,
            fileIds,
            setFileIds,
            vectorStoreId,
            setVectorStoreId,
            userDocument
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
