'use client';

import React, { createContext, useContext, useState } from 'react';

type UserDataContext = {
  files: FileInfo[] | null;
  setAssistantId: React.Dispatch<React.SetStateAction<string>>;
  setChatAssistantId: React.Dispatch<React.SetStateAction<string>>;
  setFiles: React.Dispatch<React.SetStateAction<FileInfo[]>>;
  setUserAssistants: React.Dispatch<React.SetStateAction<AssistantDefinition[] | null | undefined>>;
  setUserOwnedDocuments: React.Dispatch<React.SetStateAction<any[] | null | undefined>>;
  setUserTemplates: React.Dispatch<
    React.SetStateAction<Map<string, any>[] | null | undefined>
  >;
  setVectorStoreId: React.Dispatch<React.SetStateAction<string>>;
  assistantId?: string | null;
  chatAssistantId?: string | null;
  userAssistants?: AssistantDefinition[] | null;
  userOwnedDocuments?: any[] | null;
  userTemplates?: Map<string, any | string>[] | null;
  vectorStoreId?: string | null;
};
export const UserDataContext = createContext<UserDataContext | null>(null);

export interface AssistantDefinition {
  description: string;
  goals: string;
  name: string;
  ownerId: string;
  role: string;
  rules: string;
  id?: string;
}

export interface FileInfo {
  fileName: string;
  openAiFileId: string;
}

interface UserDataProviderProps {
  children: React.ReactNode;
  filesData: FileInfo[] | null;
  openAiAssistantId?: string | null;
  openAiChatAssistantId?: string | null;
  openAiVectorStoreId?: string | null;
  userDefinedAssistants?: AssistantDefinition[] | null;
  userDefinedTemplates?: Map<string, any | string>[] | null;
  userDocuments?: any[] | null;
}

export default function UserDataContextProvider({
  children,
  filesData,
  openAiAssistantId,
  openAiChatAssistantId,
  openAiVectorStoreId,
  userDefinedAssistants,
  userDefinedTemplates,
  userDocuments,
}: UserDataProviderProps) {
  const [assistantId, setAssistantId] = useState(openAiAssistantId);
  const [chatAssistantId, setChatAssistantId] = useState(openAiChatAssistantId);
  const [files, setFiles] = useState(filesData);
  const [vectorStoreId, setVectorStoreId] = useState(openAiVectorStoreId);
  const [userTemplates, setUserTemplates] = useState(userDefinedTemplates);
  const [userOwnedDocuments, setUserOwnedDocuments] = useState(userDocuments);
  const [userAssistants, setUserAssistants] = useState(userDefinedAssistants);

  return (
    <UserDataContext.Provider
      value={{
        assistantId,
        chatAssistantId,
        files,
        setAssistantId,
        setChatAssistantId,
        setFiles,
        setUserAssistants,
        setUserOwnedDocuments,
        setUserTemplates,
        setVectorStoreId,
        userAssistants,
        userOwnedDocuments,
        userTemplates,
        vectorStoreId,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserDataContext() {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error(
      'useUserDataContext must be used within an UserDataContextProvider'
    );
  }

  return context;
}
