'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Plate } from '@udecode/plate/react';
import { AssistantStatus } from 'ai';
import { useSession } from 'next-auth/react';
import { redirect, useParams, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

import ChatContent from "@/components/chat/chat-content";
import {PlateEditor as PlateEditorComponent} from "@/components/editor/plate-editor";
import {useCreateEditor} from "@/components/editor/use-create-editor";
import DocumentHeader, { SaveStatus } from "@/components/site/document-header";
import {createNewChat, getChatMessages, getDocumentById, saveCurrentDocumentState} from '@/firebase/firestore-dao';
import { ChatSettingsProvider } from '@/providers/chat-settings-provider';
import { CustomContextProvider } from '@/providers/custom-context-provider';
import {useDocument} from "@/providers/document-provider";
import { useUserDataContext } from '@/providers/user-data-provider';
import { Document, Message, Template } from '@/types';

export default function DocumentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const editor = useCreateEditor();
  const [status, setStatus] = useState<AssistantStatus>('awaiting_message');
  const [activeChatMessages, setActiveChatMessages] = useState<Message[]>([]);
  const { activeUserDocument, setActiveUserDocument } = useDocument();
  const { setUserChats, setUserOwnedDocuments, userTemplates } = useUserDataContext();
  const { providedTemplates } = useDocument();
  const initialized = useRef(false);
  const isProgrammaticChangeRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('Saved');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isChatVisible, setIsChatVisible] = useState(true);

  if (!session?.user) {
    redirect('/');
  }

  useEffect(() => {
    const initializePage = async () => {
      if (initialized.current) return;
      initialized.current = true;
      setSaveStatus('Loading...');
      setIsLoading(true);

      const slug = params.slug as string;

      try {
        let docToLoad: Document | undefined;
        let chatToLoad: { id: string; messages: Message[] } | undefined;

        if (slug === 'new') {
          const templateId = searchParams.get('templateId');
          if (templateId) {
            if (!userTemplates || !providedTemplates) {
                console.warn("Templates not ready, deferring 'new' document creation from template.");
                initialized.current = false;
                setIsLoading(false);
                return;
            }
            const template = [...(userTemplates || []), ...(providedTemplates || [])]
              .find(t => t.id === templateId) as Template;

            if (!template) {
              toast.error('Template not found');
              return router.replace('/home');
            }
            docToLoad = await handleNewChat(template.template);
          } else {
            docToLoad = await handleNewChat();
          }
          if (!docToLoad) return router.replace('/home');
          window.history.replaceState(null, '', `/document/${docToLoad.id}`);

        } else {
          // Fetch document first
          const docResult = await getDocumentById(slug);

          if (docResult.error || !docResult.result) {
            toast.error('Document not found');
            setIsLoading(false);
            setSaveStatus('Error');
            return router.replace('/home');
          }
          docToLoad = docResult.result as Document;

          // Then fetch chat messages using the chatId from the loaded document
          const chatResult = await getChatMessages(docToLoad.chatId); // Ensure only chatId is passed

          if (chatResult.error) {
            // Log the error but proceed, initializing chat messages as empty
            console.warn(`Error fetching chat messages for chat ${docToLoad.chatId}:`, chatResult.error);
            chatToLoad = { id: docToLoad.chatId, messages: [] };
          } else {
            // Chat messages fetched successfully (or document had no messages)
            chatToLoad = {
              id: docToLoad.chatId,
              messages: chatResult.result || [], // Use fetched messages or empty array
            };
          }
        }

        if (!docToLoad) {
             console.error("docToLoad is undefined after initialization logic.");
             toast.error("Failed to load or create document.");
             setSaveStatus('Error');
             setIsLoading(false);
             return;
        }

        setActiveUserDocument(docToLoad);
        changeEditorContent(docToLoad.document, true);
        if (docToLoad.id) {
            const initialContentString = JSON.stringify(docToLoad.document);
            localStorage.setItem(`docgpt-save-${docToLoad.id}`, initialContentString);
        }
        if (chatToLoad) {
            setActiveChatMessages(chatToLoad.messages.filter(msg => msg) || []);
        } else {
            setActiveChatMessages([]);
        }
        setSaveStatus('Saved');
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing page:', error);
        toast.error('Error loading document');
        setSaveStatus('Error');
        setIsLoading(false);
        router.replace('/home');
      }
    };

    if (session?.user) {
        initializePage();
    } else {
      console.log("Waiting for session...");
    }

    return () => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
    };
  }, [params.slug, session, router, searchParams, userTemplates, providedTemplates]);

  const handleNewChat = async (initialContent?: any[]): Promise<Document | undefined> => {
    if (!session?.user?.email) return;
    setActiveChatMessages([]);
    const chatId = uuidv4();
    const newDocId = uuidv4();
    const initialDocName = 'Untitled document';
    const initialDocValue = initialContent || [
        { id: '1', children: [{ text: '' }], type: 'p' },
    ];

    const optimisticDoc: Document = {
      id: newDocId,
      chatId: chatId,
      document: initialDocValue,
      documentName: initialDocName,
      documentOwnerId: session.user.email,
    };

    setUserChats(prev => prev ? [{ id: chatId, chatName: 'Untitled', documentIds: [newDocId], messages: [], userId: session.user!.email! }, ...prev] : [{ id: chatId, chatName: 'Untitled', documentIds: [newDocId], messages: [], userId: session.user!.email! }]);
    setUserOwnedDocuments(prev => prev ? [optimisticDoc, ...prev] : [optimisticDoc]);
    setActiveUserDocument(optimisticDoc);
    changeEditorContent(optimisticDoc.document, true);

    const res = await saveCurrentDocumentState(
      session.user.email,
      initialDocName,
      chatId,
      initialDocValue
    );

    if (res.error || !res.result?.id) {
      toast.error(`Error creating document: ${res.error?.message || 'Unknown error'}`);
      // Clean up optimistic updates if creation fails
      setUserChats(prev => prev?.filter(chat => chat.id !== chatId) || []);
      setUserOwnedDocuments(prev => prev?.filter(doc => doc.id !== newDocId) || []);
      setActiveUserDocument(undefined);
      return undefined;
    }

    const finalDocId = res.result.id;

    const chatRes = await createNewChat(session.user.email, finalDocId, chatId);
    if (chatRes.error) {
      toast.error(`Error creating chat: ${chatRes.error.message}`);
      // Consider how to handle partial success (document created, chat failed)
      // Maybe delete the created document or allow user to retry chat creation?
      // For now, return undefined, leaving the created doc potentially orphaned in terms of chat linkage UI
       setUserChats(prev => prev?.filter(chat => chat.id !== chatId) || []); // remove optimistic chat
      return undefined;
    }

    const finalDoc: Document = { ...optimisticDoc, id: finalDocId };
    setActiveUserDocument(finalDoc);
    // Update optimistic states with final ID
    setUserOwnedDocuments(prev => prev?.map(doc => doc.id === newDocId ? finalDoc : doc) || [finalDoc]);
    setUserChats(prev => prev?.map(chat => chat.id === chatId ? { ...chat, documentIds: [finalDocId] } : chat) || []);

    return finalDoc;
  };

  const changeEditorContent = (content: any, isInitialLoad = false) => {
    // Mark programmatic changes to avoid triggering save logic unnecessarily
    isProgrammaticChangeRef.current = true;
    editor.tf.setValue(content);

    // If it's an initial load, update localStorage baseline immediately.
    if (isInitialLoad && activeUserDocument?.id) {
        const contentString = JSON.stringify(content);
        localStorage.setItem(`docgpt-save-${activeUserDocument.id}`, contentString);
        // Reflect the loaded state
        setSaveStatus('Saved');
        // Clear any pending save timeout from previous interactions
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = null;
        }
    }
    // Important: Reset the flag *after* the update operation that might trigger onChange
    // Use setTimeout to ensure it resets after the current event loop tick
    setTimeout(() => {
        isProgrammaticChangeRef.current = false;
    }, 0);
  }

  const handleEditorChange = useCallback(({ value }: { value: any }) => {
    // Ignore changes triggered by programmatic updates (like initial load or AI response)
    if (isProgrammaticChangeRef.current) {
        // Do not reset the flag here; changeEditorContent handles resetting it after update
        return;
    }

    if (isLoading || !activeUserDocument?.id || !session?.user?.email) return;

    const currentContentString = JSON.stringify(value);
    const localStorageKey = `docgpt-save-${activeUserDocument.id}`;
    const storedContentString = localStorage.getItem(localStorageKey);

    console.log("Current content:", currentContentString);
    // If content matches localStorage, ensure status is Saved and clear any pending save.
    if (currentContentString === storedContentString) {
        if (saveStatus !== 'Saved') {
            setSaveStatus('Saved');
        }
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = null;
        }
        return;
    }

    // Content has changed and differs from localStorage baseline
    setSaveStatus('Unsaved');

    // Clear existing debounce timeout and set a new one for auto-save
    if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
        // Re-read the editor state at the moment of saving to get the latest value
        const finalContentValue = editor.children;
        const finalContentString = JSON.stringify(finalContentValue);

        // Double-check against localStorage *again* before saving
        // User might have quickly undone changes back to the saved state
        const finalStoredString = localStorage.getItem(localStorageKey);
        if (finalContentString !== finalStoredString) {
            setSaveStatus('Saving');
            const res = await saveCurrentDocumentState(
                session.user!.email!,
                activeUserDocument.documentName,
                activeUserDocument.chatId,
                finalContentValue,
                activeUserDocument.id
            );

            if (res.error) {
                toast.error(`Auto-save failed: ${res.error.message}`);
                setSaveStatus('Error');
            } else {
                // Update localStorage baseline *after* successful save
                localStorage.setItem(localStorageKey, finalContentString);
                setSaveStatus('Saved');
            }
        } else {
            // Content matches saved state again, just ensure status is Saved.
            setSaveStatus('Saved');
        }
        saveTimeoutRef.current = null; // Clear the ref after execution
    }, 2000); // 2-second debounce delay

  }, [editor, activeUserDocument, isLoading, session, saveStatus]); // Dependencies for the editor change handler

  // Function to toggle chat visibility
  const toggleChatVisibility = () => {
    setIsChatVisible(prev => !prev);
  };

  // Loading state display
  if (isLoading) {
    return (
      <div className="flex h-screen flex-col">
        {/* Simplified Skeleton Loader */}
        <div className="h-16 border-b bg-gray-100 flex items-center px-4">
            <div className="h-8 w-8 bg-gray-200 animate-pulse rounded-full mr-3" />
            <div className="h-6 w-48 bg-gray-200 animate-pulse rounded-md" />
        </div>
        <div className='relative flex flex-1 overflow-hidden bg-gray-100 justify-center items-start p-4'>
            <div className="z-10 border bg-white shadow mt-12 w-full max-w-[816px] rounded-lg overflow-hidden p-4 space-y-3">
              <div className="h-8 w-3/4 bg-gray-200 animate-pulse rounded-md" />
              <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded-md" />
              <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded-md" />
              <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded-md" />
              <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded-md" />
            </div>
        </div>
      </div>
    );
  }

  // Main component return when not loading
  return (
    <CustomContextProvider>
      <Plate onValueChange={handleEditorChange} editor={editor}>
      <ChatSettingsProvider>
      <div className="flex h-screen flex-col">
        <DocumentHeader onToggleChat={toggleChatVisibility} editor={editor} saveStatus={saveStatus} />
        
        <div className='relative flex flex-1 overflow-hidden bg-gray-200'>
          <div
            id="document-container"
            className="flex w-full h-full justify-center overflow-y-auto" // Added overflow-y-auto
            style={{
              paddingRight: '0px', // Consider if chat panel width needs to affect this
              transition: 'padding-right 0.1s ease-out'
            }}
          >
            <div
              id="document-editor"
              className='border bg-background shadow-lg h-fit min-h-full my-4 md:my-12'
              style={{
                  boxSizing: 'border-box', // Include padding in width calculation
                  maxWidth: 'min(816px, 90vw)', // Max width, responsive
                  // Responsive width using max-w and viewport units
                  width: '100%',
              }}
            >
              <PlateEditorComponent />
            </div>
          </div>

          <ChatContent
            onToggleChat={toggleChatVisibility}
            activeChatMessages={activeChatMessages}
            changeEditorContent={changeEditorContent}
            editor={editor}
            isVisible={isChatVisible}
            setStatus={setStatus}
            status={status}
          />
        </div>
      </div>
      </ChatSettingsProvider>
      </Plate>
    </CustomContextProvider>
  );
}
