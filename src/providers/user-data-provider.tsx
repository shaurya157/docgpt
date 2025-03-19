'use client';

import React, { createContext, useContext, useState } from 'react';
import { Document, Template } from '@/types';
type UserDataContext = {
  files: FileInfo[] | null;
  setFiles: React.Dispatch<React.SetStateAction<FileInfo[]>>;
  setUserChats: React.Dispatch<React.SetStateAction<any[] | null | undefined>>;
  setUserOwnedDocuments: React.Dispatch<React.SetStateAction<Document[] | null | undefined>>;
  setUserTemplates: React.Dispatch<React.SetStateAction<Template[] | null | undefined>>;
  userChats?: any[] | null;
  userOwnedDocuments?: Document[] | null;
  userTemplates?: Template[] | null;
};
export const UserDataContext = createContext<UserDataContext | null>(null);

export interface FileInfo {
  fileName: string;
  fileIds: string[];
  status?: string;
  error?: string;
}

interface UserDataProviderProps {
  children: React.ReactNode;
  filesData: FileInfo[] | null;
  userChats?: any[] | null;
  userDefinedTemplates?: Template[] | null;
  userDocuments?: Document[] | null;
}

export default function UserDataContextProvider({
  children,
  filesData,
  userChats: initialUserChats,
  userDefinedTemplates,
  userDocuments,
}: UserDataProviderProps) {
  const [files, setFiles] = useState(filesData);
  const [userTemplates, setUserTemplates] = useState(userDefinedTemplates);
  const [userOwnedDocuments, setUserOwnedDocuments] = useState(userDocuments);
  const [userChats, setUserChats] = useState(initialUserChats);

  return (
    <UserDataContext.Provider
      value={{
        files,
        setFiles,
        setUserChats,
        setUserOwnedDocuments,
        setUserTemplates,
        userChats,
        userOwnedDocuments,
        userTemplates,
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
