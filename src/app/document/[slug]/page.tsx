'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

import { AssistantStatus, CreateMessage } from 'ai';
import { useSession } from 'next-auth/react';
import { redirect, useParams, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { type PlateEditor } from '@udecode/plate/react';

import ChatContent from "@/components/chat/chat-content";
import {PlateEditor as PlateEditorComponent} from "@/components/editor/plate-editor";
import {useCreateEditor} from "@/components/editor/use-create-editor";
import DocumentHeader, { SaveStatus } from "@/components/site/document-header";
import {createNewChat, getDocumentById, saveCurrentDocumentState, getChatMessages} from '@/firebase/firestore-dao';
import { ChatSettingsProvider } from '@/providers/chat-settings-provider';
import {useDocument} from "@/providers/document-provider";
import { useUserDataContext } from '@/providers/user-data-provider';
import { Document, Message, Template, Chat } from '@/types';
import { Plate } from '@udecode/plate/react';

export default function DocumentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const editor = useCreateEditor();
  const [status, setStatus] = useState<AssistantStatus>('awaiting_message');
  const [activeChatMessages, setActiveChatMessages] = useState<Message[]>([]);
  const { activeUserDocument, setActiveUserDocument } = useDocument();
  const { setUserChats, setUserOwnedDocuments, userChats, userOwnedDocuments, userTemplates } = useUserDataContext();
  const { providedTemplates } = useDocument();
  const initialized = useRef(false);
  const isProgrammaticChangeRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('Saved');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  if (!session?.user) {
    redirect('/');
  }

  useEffect(() => {
    const initializePage = async () => {
      if (initialized.current) return;
      initialized.current = true;
      setSaveStatus('Loading...');

      const slug = params.slug as string;

      try {
        let docToLoad: Document | undefined;
        let chatToLoad: { id: string; messages: Message[] } | undefined;

        if (slug === 'new') {
          const templateId = searchParams.get('templateId');
          if (templateId) {
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
          const docResult = await getDocumentById(slug);
          if (docResult.error || !docResult.result) {
            toast.error('Document not found');
            return router.replace('/home');
          }
          docToLoad = docResult.result as Document;
          
          const chatResult = await getChatMessages(docToLoad.chatId);
          if (chatResult.error || !session?.user?.email) {
            toast.error('Chat not found');
            return router.replace('/home');
          }
          chatToLoad = {
            id: docToLoad.chatId,
            chatName: 'Untitled',
            documentIds: [docToLoad.id],
            files: [],
            messages: chatResult.result || [],
            userId: session.user.email
          } as Chat;
        }

        setActiveUserDocument(docToLoad);
        changeEditorContent(docToLoad.document, true);
        // Initialize localStorage on load
        if (docToLoad.id) {
            const initialContentString = JSON.stringify(docToLoad.document);
            localStorage.setItem(`docgpt-save-${docToLoad.id}`, initialContentString);
        }
        if (chatToLoad) {
            setActiveChatMessages(chatToLoad.messages);
        }
        setSaveStatus('Saved');
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing page:', error);
        toast.error('Error loading document');
        setSaveStatus('Error');
        router.replace('/home');
      }
    };

    if(session?.user && userOwnedDocuments !== undefined && userChats !== undefined && userTemplates !== undefined && providedTemplates !== undefined) {
        initializePage();
    }
    
    // Cleanup timeout on unmount or when dependencies change significantly (like slug)
    return () => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
    };
  }, [params.slug, searchParams, session, userOwnedDocuments, userChats, userTemplates, providedTemplates]);

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
      return undefined;
    }

    const finalDocId = res.result.id;

    const chatRes = await createNewChat(session.user.email, finalDocId, chatId);
    if (chatRes.error) {
      toast.error(`Error creating chat: ${chatRes.error.message}`);
      return undefined;
    }

    const finalDoc: Document = { ...optimisticDoc, id: finalDocId };
    setActiveUserDocument(finalDoc);
    setUserOwnedDocuments(prev => prev?.map(doc => doc.id === newDocId ? finalDoc : doc) || [finalDoc]);
    setUserChats(prev => prev?.map(chat => chat.id === chatId ? { ...chat, documentIds: [finalDocId] } : chat) || []);

    return finalDoc;
  };

  const changeEditorContent = (content: any, isInitialLoad = false) => {
    // Always mark programmatic changes to avoid triggering save logic
    isProgrammaticChangeRef.current = true;
    editor.tf.setValue(content);

    // If it's an initial load or a programmatic change that should update the baseline,
    // update localStorage immediately.
    if (isInitialLoad && activeUserDocument?.id) {
        const contentString = JSON.stringify(content);
        localStorage.setItem(`docgpt-save-${activeUserDocument.id}`, contentString);
        // Ensure save status reflects the loaded state
        setSaveStatus('Saved');
        // Clear any pending save timeout from previous interactions if any
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = null;
        }
    }
  }

  const handleEditorChange = useCallback(({ value }: { value: any }) => {
    if (isProgrammaticChangeRef.current) {
        isProgrammaticChangeRef.current = false;
        return;
    }

    if (isLoading || !activeUserDocument?.id || !session?.user?.email) return;

    const currentContentString = JSON.stringify(value);
    const localStorageKey = `docgpt-save-${activeUserDocument.id}`;
    const storedContentString = localStorage.getItem(localStorageKey);

    if (currentContentString === storedContentString) {
        // If content matches localStorage, no need to do anything, ensure status is Saved
        if (saveStatus !== 'Saved') {
            setSaveStatus('Saved');
        }
        // Clear any potentially lingering timeout if user reverts to saved state
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = null;
        }
        return;
    }

    // Content has changed and differs from localStorage
    setSaveStatus('Unsaved');

    // Clear existing timeout and set a new one
    if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
        const finalContentValue = editor.children; // Get the latest value directly from the editor state
        const finalContentString = JSON.stringify(finalContentValue);
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
                localStorage.setItem("documentJson", finalContentString); // Use static key
                setSaveStatus('Saved');
            }
        } else {
            // If, after the timeout, the content matches localStorage again (e.g., undo), mark as saved.
            setSaveStatus('Saved');
        }
        saveTimeoutRef.current = null; // Clear the ref after execution
    }, 2000); // 2-second delay

  }, [editor, activeUserDocument, isLoading, session, saveStatus]); // Added saveStatus to dependencies

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col">
        <div className="h-16 border-b bg-gray-100">
          <div className="h-full flex items-center px-4">
              <div className="h-8 w-8 bg-gray-200 animate-pulse rounded-full mr-3" />
              <div className="h-6 w-48 bg-gray-200 animate-pulse rounded-md" />
          </div>
        </div>
        <div className='relative flex flex-1 overflow-hidden bg-gray-100'>
          <div className="flex w-full h-full justify-center">
            <div className="flex items-start justify-center w-full">
              <div className="z-10 border bg-white shadow h-[calc(100vh-4rem)] mt-12 w-[816px] rounded-lg overflow-hidden">
                <div className="h-8 w-3/4 bg-gray-200 animate-pulse m-4 rounded-md" />
                <div className="h-4 w-1/2 bg-gray-200 animate-pulse mx-4 my-2 rounded-md" />
                <div className="h-4 w-2/3 bg-gray-200 animate-pulse mx-4 my-2 rounded-md" />
                <div className="h-4 w-3/4 bg-gray-200 animate-pulse mx-4 my-2 rounded-md" />
                <div className="h-4 w-1/2 bg-gray-200 animate-pulse mx-4 my-2 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Plate editor={editor} onValueChange={handleEditorChange}>
      <ChatSettingsProvider>
      <div className="flex h-screen flex-col">
        <DocumentHeader editor={editor} saveStatus={saveStatus} />
        <div className='relative flex flex-1 overflow-hidden bg-gray-200'>
          <div
            id="document-container"
            className="flex w-full h-full justify-center"
            style={{
              paddingRight: '0px',
              transition: 'padding-right 0.1s ease-out'
            }}
          >
            <div className="flex items-start justify-center">
              <div
                id="document-editor"
                className='z-10 border bg-background shadow h-full mt-12
                        w-[816px]
                        sm:w-[90%]
                        md:w-[700px]
                        lg:w-[816px]'
                style={{
                    maxWidth: 'min(816px, 65vw)',
                    minWidth: 'min(500px, 65vw)'
                }}
              >
                <PlateEditorComponent />
              </div>
            </div>
          </div>
          
          <ChatContent
            activeChatMessages={activeChatMessages}
            changeEditorContent={changeEditorContent}
            editor={editor}
            setStatus={setStatus}
            status={status}
          />
        </div>
      </div>
      </ChatSettingsProvider>
    </Plate>
  );
}
