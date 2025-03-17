'use client';

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import {cn} from "@udecode/cn";
import { AssistantStatus, Message } from 'ai';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { toast } from 'sonner';

import ChatContent from "@/components/chat/chat-content";
import {PlateEditor} from "@/components/editor/plate-editor";
import {useCreateEditor} from "@/components/editor/use-create-editor";
import Sidebar from "@/components/sidebar/sidebar";
import HomeHeader from "@/components/site/home-header";
import OnboardingTooltip from "@/components/site/onboarding-tooltip";
import {createNewChat, deleteDocument, getChatMessages, saveCurrentDocumentState} from '@/firebase/firestore-dao';
import ChatSettingsProvider, {useChatSettings} from "@/providers/chat-settings-provider";
import {useDocument} from "@/providers/document-provider";
import { useUserDataContext } from '@/providers/user-data-provider';


export default function Home() {
  const [activeTab, setActiveTab] = useState<'chat' | 'settings'>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const { activeUserDocument, setActiveUserDocument } = useDocument();
  const [activeChatMessages, setActiveChatMessages] = useState<Message[]>([]);
  const { data: session } = useSession();
  const { setUserOwnedDocuments, userOwnedDocuments, userChats, setUserChats } = useUserDataContext();
  const [status, setStatus] = useState<AssistantStatus>('awaiting_message');
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const { selectedTemplate, handleSelectedTemplate } = useChatSettings();
  const [hideChat, setHideChat] = useState(false);

  // TODO: can prolly move this out to layout instead and provide it globally with a provider.
  // TODO: fix here and the other page.tsx file
  const editor = useCreateEditor();

  // TODO: a bit hacky...
  if (!session?.user) {
    redirect('/');
  }

  const handleNewChat = async () => {
    setActiveChatMessages([]);
    const chatId = uuidv4();
    const item = {
      document: selectedTemplate["template"],
      documentName: `Untitled document`,
      chatId: chatId
    };

    const res = await saveCurrentDocumentState(
      session!.user!.email!,
      item['documentName'],
      chatId,
      item['document']
    );

    if (res.error) {
      toast.error(`Error creating document: ${res.error}`);
      return;
    }

    item['id'] = res.result.id;

    const chatRes = await createNewChat(session!.user!.email!, res.result.id, chatId);
    if (chatRes.error) {
      toast.error(`Error creating chat: ${chatRes.error}`);
      return;
    }
    
    const newChat = {
      id: chatId,
      documentIds: [res.result.id],
      chatName: 'Untitled',
      userId: session!.user!.email!,
      messages: []
    };
    
    // Update both chats and documents state
    setUserChats(prev => prev ? [newChat, ...prev] : [newChat]);
    setUserOwnedDocuments(prev => prev ? [item, ...prev] : [item]);
    
    setActiveUserDocument(item);
    setActiveTab('chat');
    return item;
  };

  const handleDeleteChat = async (chatId: string) => {
    console.log("chatId", chatId)
  };

  const handleSetActiveItem = async (chat, documentRefreshOnly?: boolean) => {
    setStatus('in_progress');
    
    // Find the corresponding document from userOwnedDocuments
    const document = userOwnedDocuments?.find(doc => doc.id === chat.documentIds[0]);
    if (!document) {
      toast.error('Could not find associated document');
      return;
    }

    setActiveUserDocument(document);

    if (document.document.length > 1) {
      setEditorOpen(true)
    } else {
      setEditorOpen(false)
    }
    editor.tf.setValue(document.document)
    
    if (!documentRefreshOnly) {
      setActiveChatMessages([]);
      try {
        const { error, result: messages } = await getChatMessages(chat.id);
        if (error) {
          toast.error(`Error fetching messages: ${error}`);
        } else {
          if (messages.length === 0) {
            setActiveChatMessages([]);
          } else {
            const formattedMessages = messages.map(message => ({
              id: message.id.toString(),
              content: message.content,
              role: message.role
            }));
            setActiveChatMessages(formattedMessages);
          }
        }
      } catch (e) {
        toast.error('Something unexpected happened...');
        console.error(e);
      }
    }

    updateUserOwnedDocumentsState(document)
    setStatus('awaiting_message');
  };

  const updateUserOwnedDocumentsState = (item) => {
      const userDocs = userOwnedDocuments
      userDocs?.forEach((doc) => {
        if (doc["id"] === item["id"]) {
          doc["documentName"] = item["documentName"]
          doc["document"] = item["document"]
        }
      })

    setUserOwnedDocuments(userDocs)
  }

  const resetState = () => {
    setActiveChatMessages([])
    setEditorOpen(false);
    const doc = {
      document: [
        {
          id: '1',
          children: [
            {
              text: '',
            },
          ],
          type: 'h1',
        },
      ]
    }
    setActiveUserDocument(doc)
    editor.tf.setValue(doc["document"])
    handleSelectedTemplate("")
  }
  
  // this resets the state when user goes to settings from home then back to home from settings
  useEffect(() => {
    resetState()
  }, []);

  const onboardingSteps = [
    {
      content: 'Your chats with DocGPT will show here',
    },
    {
      content:
        'Upload files here that you would use to onboard a new team member. DocGPT will search these files for context when answering questions for you.',
      title: 'Get more relevant responses',
    },
    {
      content:
        'Submit a feature request or report a bug. We will reply within 12 hours.',
      title: 'Tell us what you want DocGPT to do',
    },
  ];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('OnboardingCompleted') === 'true') {
        setOnboardingCompleted(true);
      }

      const setInitialSidebarState = () => {
        const isLargeScreen = window.matchMedia('(min-width: 1024px)').matches;
        setIsSidebarOpen(isLargeScreen);
      };

      setInitialSidebarState();

      const mediaQuery = window.matchMedia('(min-width: 1024px)');
      const handleScreenChange = (e: MediaQueryListEvent) => {
        setIsSidebarOpen(e.matches);
      };

      mediaQuery.addEventListener('change', handleScreenChange);

      return () => {
        mediaQuery.removeEventListener('change', handleScreenChange);
      };
    }
  }, []);

  const chatWindowCssClass = editorOpen ? '' : 'justify-center items-center';

  return (
    <ChatSettingsProvider setActiveItem={handleSetActiveItem}>
      <div className="flex h-screen flex-col">
        <HomeHeader
          onNewChat={resetState}
          editorOpen={editorOpen}
          setEditorOpen={setEditorOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div
          className={
            'relative flex flex-1 overflow-hidden ' + chatWindowCssClass
          }
        >
          <Sidebar
            onDeleteChat={handleDeleteChat}
            activeTab={activeTab}
            activeUserDocument={activeUserDocument}
            editorOpen={editorOpen}
            isOpen={isSidebarOpen}
            items={userChats}
            setActiveItem={handleSetActiveItem}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          <ChatContent
            onNewChat={handleNewChat}
            activeChatMessages={activeChatMessages}
            activeUserDocument={activeUserDocument}
            editor={editor}
            editorOpen={editorOpen}
            hideChat={hideChat}
            setActiveChatMessages={setActiveChatMessages}
            setActiveItem={handleSetActiveItem}
            setEditorOpen={setEditorOpen}
            setStatus={setStatus}
            status={status}
            toggleHideChat={() => hideChat ? setHideChat(false) : setHideChat(true)}
          />
          {!onboardingCompleted && (
            <OnboardingTooltip
              onComplete={() =>
                localStorage.setItem('OnboardingCompleted', 'true')
              }
              isSidebarOpen={isSidebarOpen}
              steps={onboardingSteps}
            />
          )}

          <div
            className={cn(
                'z-10 overflow-y-scroll border bg-background shadow',
                editorOpen ? '' : 'hidden',
                hideChat ? 'w-full' : 'w-2/3'
            )}
          >
            <PlateEditor plateEditor={editor} />
          </div>
        </div>
      </div>
    </ChatSettingsProvider>
  );
}
