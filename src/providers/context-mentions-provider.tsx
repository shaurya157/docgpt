import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useFileAttachments } from '@/hooks/use-file-attachments';
import { ContextMentionOption, ContextMentionProvider, File } from '@/types';
import { useUserDataContext } from '@/providers/user-data-provider';
import { useDocument } from '@/providers/document-provider';

interface ContextMentionsProviderProps {
  children: ReactNode;
}

interface ContextMentionsContextValue {
  providers: ContextMentionProvider[];
  registerProvider: (provider: ContextMentionProvider) => void;
  unregisterProvider: (id: string) => void;
}

const ContextMentionsContext = createContext<ContextMentionsContextValue | undefined>(undefined);

export const ContextMentionsProvider = ({ children }: ContextMentionsProviderProps) => {
  const [customProviders, setCustomProviders] = useState<ContextMentionProvider[]>([]);
  const { data: session } = useSession();
  const userId = session?.user?.email || '';
  const { activeUserDocument } = useDocument();
  const { userChats } = useUserDataContext();
  
  // Get the current chat's files
  const currentChatFiles = useMemo(() => {
    if (!userChats || !activeUserDocument) return [];
    
    const currentChat = userChats.find(chat => chat.id === activeUserDocument.chatId);
    return currentChat?.files || [];
  }, [userChats, activeUserDocument]);
  
  // Initialize file upload provider with our existing file handling
  const { updateAttachments } = useFileAttachments(userId);

  // Define built-in providers
  const builtInProviders = useMemo<ContextMentionProvider[]>(() => {
    // Files provider that shows existing uploaded files
    const filesProvider: ContextMentionProvider = {
      id: 'files',
      name: 'Uploaded Files',
      icon: 'file',
      matcher: (query: string) => {
        // Match if query is empty or if any file name includes the query
        if (!query) return true;
        
        return currentChatFiles.some(file => 
          file.fileName.toLowerCase().includes(query.toLowerCase())
        ) || 'files'.includes(query.toLowerCase());
      },
      getOptions: (query: string) => {
        let options: ContextMentionOption[] = [];
        
        // Add "Files" option which could show all files
        if ('files'.includes(query.toLowerCase())) {
          options.push({
            id: 'files-all',
            type: 'files',
            label: 'Files',
            value: 'files',
            icon: 'file',
          });
        }
        
        // Add specific file options
        const fileOptions = currentChatFiles
          .filter(file => !query || file.fileName.toLowerCase().includes(query.toLowerCase()))
          .map(file => ({
            id: `file-${file.fileName}`,
            type: 'file',
            label: file.fileName,
            value: file.fileName,
            icon: 'file',
            data: file
          }));
        
        return [...options, ...fileOptions];
      },
      handleSelection: (option: ContextMentionOption) => {
        // Handle file selection - could reference the file in the chat
        // For now, we'll just append the file name
        console.log('Selected file:', option);
      }
    };
    
    // Upload provider
    const uploadProvider: ContextMentionProvider = {
      id: 'upload',
      name: 'Upload File',
      icon: 'upload',
      matcher: (query: string) => 'upload'.includes(query.toLowerCase()),
      getOptions: (query: string) => [
        {
          id: 'upload',
          type: 'upload',
          label: 'Upload File',
          value: 'upload',
          icon: 'upload',
        }
      ],
      handleSelection: (option: ContextMentionOption) => {
        // Simulate click on file input when upload is selected
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
          fileInput.click();
        }
      }
    };
    
    return [filesProvider, uploadProvider];
    // In the future we can add more built-in providers here:
    // Slack, Gmail, Drive, etc.
  }, [currentChatFiles]);

  // Combine built-in and custom providers
  const providers = useMemo(() => [
    ...builtInProviders,
    ...customProviders
  ], [builtInProviders, customProviders]);

  // Register a new provider
  const registerProvider = (provider: ContextMentionProvider) => {
    setCustomProviders(prev => [...prev, provider]);
  };

  // Unregister a provider
  const unregisterProvider = (id: string) => {
    setCustomProviders(prev => prev.filter(p => p.id !== id));
  };

  const value = {
    providers,
    registerProvider,
    unregisterProvider
  };

  return (
    <ContextMentionsContext.Provider value={value}>
      {children}
    </ContextMentionsContext.Provider>
  );
};

export const useContextMentionsProviders = () => {
  const context = useContext(ContextMentionsContext);
  if (context === undefined) {
    throw new Error('useContextMentionsProviders must be used within a ContextMentionsProvider');
  }
  return context;
};