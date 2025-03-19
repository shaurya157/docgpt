'use client';

import { useEffect, useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useSearchParams, useParams, redirect, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { AssistantStatus } from 'ai';
import {cn} from "@udecode/cn";

import ChatContent from "@/components/chat/chat-content";
import {PlateEditor} from "@/components/editor/plate-editor";
import {useCreateEditor} from "@/components/editor/use-create-editor";
import DocumentHeader from "@/components/site/document-header";
import {createNewChat, deleteDocument, getChatMessages, saveCurrentDocumentState, deleteChat} from '@/firebase/firestore-dao';
import {useDocument} from "@/providers/document-provider";
import { useUserDataContext } from '@/providers/user-data-provider';
import { Message, Document, Template } from '@/types';

export default function DocumentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const editor = useCreateEditor();
  const [status, setStatus] = useState<AssistantStatus>('awaiting_message');
  const [activeChatMessages, setActiveChatMessages] = useState<Message[]>([]);
  const { setActiveUserDocument, activeUserDocument } = useDocument();
  const { setUserOwnedDocuments, userOwnedDocuments, userChats, setUserChats, userTemplates } = useUserDataContext();
  const { providedTemplates } = useDocument();
  const initialized = useRef(false);

  if (!session?.user) {
    redirect('/');
  }

  useEffect(() => {
    const initializePage = async () => {
      if (initialized.current) return;
      initialized.current = true;

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
              return;
            }

            // Create new document with template content
            const newDoc = await handleNewChat(template.template);
            if (!newDoc) {
              redirect('/home');
              return;
            }
            router.replace(`/document/${newDoc.id}`);
          } else {
            // Create new blank document
            const newDoc = await handleNewChat();
            if (!newDoc) {
              redirect('/home');
              return;
            }
            router.replace(`/document/${newDoc.id}`);
          }
        } else {
          // Find existing document
          const document = userOwnedDocuments?.find(doc => doc.id === slug);
          if (!document) {
            toast.error('Document not found');
            redirect('/home');
            return;
          }

          // Find corresponding chat
          const chat = userChats?.find(c => c.id === document.chatId);
          if (!chat) {
            toast.error('Chat not found');
            redirect('/home');
            return;
          }
          changeEditorContent(document.document)
          setActiveChatMessages(chat.messages)
          setActiveUserDocument(document);
        }
      } catch (error) {
        console.error('Error initializing page:', error);
        toast.error('Error loading document');
        redirect('/home');
      }
    };

    initializePage();
  }, [params.slug, searchParams, userOwnedDocuments, userChats, userTemplates, providedTemplates, router]);

  const handleNewChat = async (initialContent?: any[]): Promise<Document> => {
    setActiveChatMessages([]);
    const chatId = uuidv4();
    const item: Document = {
      document: initialContent || [{
        id: '1',
        children: [{ text: '' }],
        type: 'h1',
      }],
      documentName: 'Untitled document',
      chatId: chatId,
      documentOwnerId: session!.user!.email!,
      id: ""
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
      documentIds: [res.result.id],
      chatName: 'Untitled',
      userId: session!.user!.email!,
      messages: []
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

  return (
    <div className="flex h-screen flex-col">
      <DocumentHeader />
      <div className='relative flex flex-1 overflow-hidden'>
        <ChatContent
          activeChatMessages={activeChatMessages}
          editor={editor}
          setActiveChatMessages={setActiveChatMessages}
          changeEditorContent={changeEditorContent}
          setStatus={setStatus}
          status={status}
        />
        <div className='z-10 overflow-y-scroll border bg-background shadow h-full w-2/3'>
          <PlateEditor plateEditor={editor} />
        </div>
      </div>
    </div>
  );
}
