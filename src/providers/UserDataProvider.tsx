'use client';

import React, { createContext, useContext, useState } from 'react';

type UserDataContext = {
  assistantId?: string | null;
  chatAssistantId?: string | null;
  setAssistantId: React.Dispatch<React.SetStateAction<string>>;
  setChatAssistantId: React.Dispatch<React.SetStateAction<string>>;
  files: FileInfo[] | null;
  setFiles: React.Dispatch<React.SetStateAction<FileInfo[]>>;
  vectorStoreId?: string | null;
  setVectorStoreId: React.Dispatch<React.SetStateAction<string>>;
  userTemplates?: Map<string, string | any>[] | null;
  setUserTemplates: React.Dispatch<
    React.SetStateAction<Map<string, any>[] | null | undefined>
  >;
  userOwnedDocuments?: any[] | null;
};
export const UserDataContext = createContext<UserDataContext | null>(null);

interface UserDataProviderProps {
  openAiAssistantId?: string | null;
  openAiChatAssistantId?: string | null;
  openAiVectorStoreId?: string | null;
  filesData: FileInfo[] | null;
  children: React.ReactNode;
  userDefinedTemplates?: Map<string, string | any>[] | null;
  userDocuments?: any[] | null;
}

export interface FileInfo {
  openAiFileId: string;
  fileName: string;
}

export default function UserDataContextProvider({
  children,
  openAiAssistantId,
  filesData,
  openAiVectorStoreId,
  userDefinedTemplates,
  userDocuments,
  openAiChatAssistantId,
}: UserDataProviderProps) {
  const [assistantId, setAssistantId] = useState(openAiAssistantId);
  const [chatAssistantId, setChatAssistantId] = useState(openAiChatAssistantId);
  const [files, setFiles] = useState(filesData);
  const [vectorStoreId, setVectorStoreId] = useState(openAiVectorStoreId);
  const [userTemplates, setUserTemplates] = useState(userDefinedTemplates);
  const [userOwnedDocuments] = useState(userDocuments);

  return (
    <UserDataContext.Provider
      value={{
        assistantId,
        setAssistantId,
        chatAssistantId,
        setChatAssistantId,
        files,
        setFiles,
        vectorStoreId,
        setVectorStoreId,
        userTemplates,
        setUserTemplates,
        userOwnedDocuments,
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
