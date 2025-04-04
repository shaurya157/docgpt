'use client';

import { useEffect, useRef, useState } from 'react';

import { AssistantStatus } from 'ai';
import { useSession } from 'next-auth/react';
import { redirect, useParams, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

import ChatContent from "@/components/chat/chat-content";
import {PlateEditor} from "@/components/editor/plate-editor";
import {useCreateEditor} from "@/components/editor/use-create-editor";
import DocumentHeader from "@/components/site/document-header";
import {createNewChat, saveCurrentDocumentState} from '@/firebase/firestore-dao';
import { ChatSettingsProvider } from '@/providers/chat-settings-provider';
import {useDocument} from "@/providers/document-provider";
import { useUserDataContext } from '@/providers/user-data-provider';
import { Document, Message, Template } from '@/types';
import { Plate } from '@udecode/plate/react';

export default function DocumentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const editor = useCreateEditor();
  const [status, setStatus] = useState<AssistantStatus>('awaiting_message');
  const [activeChatMessages, setActiveChatMessages] = useState<Message[]>([]);
  const { setActiveUserDocument } = useDocument();
  const { setUserChats, setUserOwnedDocuments, userChats, userOwnedDocuments, userTemplates } = useUserDataContext();
  const { providedTemplates } = useDocument();
  const initialized = useRef(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!session?.user) {
    redirect('/');
  }

  useEffect(() => {
    const initializePage = async () => {
      if (initialized.current) return;
      initialized.current = true;
      setIsLoading(true);

      const slug = params.slug as string;

      try {
        if (slug === 'new') {
          const templateId = searchParams.get('templateId');
          if (templateId) {
            // Find template from both user and provided templates
            const template = [...(userTemplates || []), ...(providedTemplates || [])]
              .find(t => t.id === templateId) as Template;

            if (!template) {
              toast.error('Template not found');
              redirect('/home');
            }

            // Create new document with template content
            const newDoc = await handleNewChat(template.template);
            if (!newDoc) {
              redirect('/home');
            }
            router.replace(`/document/${newDoc.id}`);
          } else {
            // Create new blank document
            const newDoc = await handleNewChat();
            if (!newDoc) {
              redirect('/home');
            }
            router.replace(`/document/${newDoc.id}`);
          }
        } else {
          // Find existing document
          const document = userOwnedDocuments?.find(doc => doc.id === slug);
          if (!document) {
            toast.error('Document not found');
            redirect('/home');
          }

          // Find corresponding chat
          const chat = userChats?.find(c => c.id === document.chatId);
          if (!chat) {
            toast.error('Chat not found');
            redirect('/home');
          }
          changeEditorContent(document.document)
          setActiveChatMessages(chat.messages)
          setActiveUserDocument(document);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing page:', error);
        toast.error('Error loading document');
        redirect('/home');
      }
    };

    initializePage();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const handleNewChat = async (initialContent?: any[]): Promise<Document> => {
    setActiveChatMessages([]);
    const chatId = uuidv4();
    const item: Document = {
      id: "",
      chatId: chatId,
      document: initialContent || [{
        id: '1',
        children: [{ text: '' }],
        type: 'p',
      }],
      documentName: 'Untitled document',
      documentOwnerId: session!.user!.email!
    };

    const res = await saveCurrentDocumentState(
      session!.user!.email!,
      item.documentName,
      chatId,
      item.document
    );

    if (res.error) {
      toast.error(`Error creating document: ${res.error}`);
    }

    item.id = res.result.id;

    const chatRes = await createNewChat(session!.user!.email!, res.result.id, chatId);
    if (chatRes.error) {
      toast.error(`Error creating chat: ${chatRes.error}`);
    }
    
    const newChat = {
      id: chatId,
      chatName: 'Untitled',
      documentIds: [res.result.id],
      messages: [],
      userId: session!.user!.email!
    };
    
    setUserChats(prev => prev ? [newChat, ...prev] : [newChat]);
    setUserOwnedDocuments(prev => prev ? [item, ...prev] : [item]);
    setActiveUserDocument(item);
    changeEditorContent(item.document);
    
    return item;
  };

  const changeEditorContent = (content: any[]) => {
    editor.tf.setValue(content);
  }

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col">
        <div className="h-16 border-b bg-gray-100">
          <div className="h-full w-48 animate-pulse bg-gray-200 rounded-md m-2" />
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
    <Plate editor={editor}>
      <ChatSettingsProvider>
      <div className="flex h-screen flex-col">
        <DocumentHeader editor={editor} />
        <div className='relative flex flex-1 overflow-hidden bg-gray-200'>
          {/* Document container with dynamic positioning */}
          <div 
            id="document-container"
            className="flex w-full h-full justify-center"
            style={{
              paddingRight: '0px', // Will be dynamically adjusted by chat pane width
              transition: 'padding-right 0.1s ease-out'
            }}
          >
            {/* Document editor area */}
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
                <PlateEditor />
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
