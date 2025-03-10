'use client';

import React, { createContext, useContext, useState } from 'react';

type UserDataContext = {
  files: FileInfo[] | null;
  setAssistantId: React.Dispatch<React.SetStateAction<string>>;
  setChatAssistantId: React.Dispatch<React.SetStateAction<string>>;
  setFiles: React.Dispatch<React.SetStateAction<FileInfo[]>>;
  setUserOwnedDocuments: React.Dispatch<React.SetStateAction<any[] | null | undefined>>;
  setUserTemplates: React.Dispatch<
    React.SetStateAction<Map<string, any>[] | null | undefined>
  >;
  setVectorStoreId: React.Dispatch<React.SetStateAction<string>>;
  assistantId?: string | null;
  chatAssistantId?: string | null;
  userOwnedDocuments?: any[] | null;
  userTemplates?: Map<string, any | string>[] | null;
  vectorStoreId?: string | null;
  setUserAssistants: React.Dispatch<React.SetStateAction<AssistantDefinition[] | null | undefined>>;
  userAssistants?: AssistantDefinition[] | null;
};
export const UserDataContext = createContext<UserDataContext | null>(null);

export interface FileInfo {
  fileName: string;
  openAiFileId: string;
}

export interface AssistantDefinition {
  id?: string;
  name: string;
  description: string;
  role: string;
  goals: string;
  rules: string;
  ownerId: string;
}

interface UserDataProviderProps {
  children: React.ReactNode;
  filesData: FileInfo[] | null;
  openAiAssistantId?: string | null;
  openAiChatAssistantId?: string | null;
  openAiVectorStoreId?: string | null;
  userDefinedTemplates?: Map<string, any | string>[] | null;
  userDocuments?: any[] | null;
  userDefinedAssistants?: AssistantDefinition[] | null;
}

export default function UserDataContextProvider({
  children,
  filesData,
  openAiAssistantId,
  openAiChatAssistantId,
  openAiVectorStoreId,
  userDefinedTemplates,
  userDocuments,
  userDefinedAssistants,
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
        setUserOwnedDocuments,
        setUserTemplates,
        setVectorStoreId,
        userOwnedDocuments,
        userTemplates,
        vectorStoreId,
        userAssistants,
        setUserAssistants,
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
