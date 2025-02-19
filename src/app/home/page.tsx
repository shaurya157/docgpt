'use client';

import { useEffect, useState } from 'react';

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
import {deleteDocument, saveCurrentDocumentState} from '@/firebase/firestore-dao';
import ChatSettingsProvider, {useChatSettings} from "@/providers/chat-settings-provider";
import {useDocument} from "@/providers/document-provider";
import { useUserDataContext } from '@/providers/user-data-provider';


export default function Home() {
  const [activeTab, setActiveTab] = useState<'chat' | 'document'>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const { activeUserDocument, setActiveUserDocument } = useDocument();
  const [activeChatMessages, setActiveChatMessages] = useState<Message[]>([]);
  const { data: session } = useSession();
  const { chatAssistantId, userOwnedDocuments } = useUserDataContext();
  const [status, setStatus] = useState<AssistantStatus>('awaiting_message');
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const { selectedTemplate } = useChatSettings();
  // TODO: can prolly move this out to layout instead and provide it globally with a provider.
  // TODO: fix here and the other page.tsx file
  const editor = useCreateEditor();

  // TODO: a bit hacky...
  if (!session?.user) {
    redirect('/');
  }

  // TODO: Refactor to usrOwnedDocuments and setUserOwnedDocuments, no need for the below
  const [items, setItems] = useState({
    chat: userOwnedDocuments,
    document: userOwnedDocuments,
  });

  const handleNewChat = async () => {
    const createThreadResult = await fetch('/api/ai/thread/create', {
      body: JSON.stringify({ userId: session!.user!.email }),
      method: 'POST',
    });
    const responseJson = await createThreadResult.json();
    toast.success(
      `Thread created successfully, using fresh session with thread ID: ${responseJson['threadId']}`
    );

    // Must do this after thread is created
    setEditorOpen(false)
    setActiveChatMessages([]);
    const item = {
      document: selectedTemplate["template"],
      documentName: `Untitled`,
      threadId: responseJson['threadId'],
      vectorStoreId: responseJson['vectorStoreId'],
    };

    const res = await saveCurrentDocumentState(
      session!.user!.email!,
      item['documentName'],
      item['threadId'],
      item['vectorStoreId'],
      item['document']
    );

    item['id'] = res.result.id;
    setItems((prev) => ({
      ...prev,
      chat: [...prev.chat!, item],
    }));

    setActiveUserDocument(item);
    setActiveTab('chat');
    return item;
  };

  const handleDeleteChat = async (chatId: string) => {
    const res = await deleteDocument(chatId);
    if (res.error) {
      toast.error(`Error deleting document. Error: ${res.error}`);
    } else {
      toast.success(`Success deleting document!`);
    }

    setItems((prev) => ({
      ...prev,
      chat: prev.chat!.filter((chat) => chat.id !== chatId),
    }));
  };

  const handleSetActiveItem = async (item, documentRefreshOnly?: boolean) => {
    setStatus('in_progress');
    setActiveUserDocument(item);

    const newUserOwnedDocs = [item].concat(userOwnedDocuments?.filter((doc) => item["id"] !== doc["id"]))
    setItems((prev) => ({
      ...prev,
      chat: newUserOwnedDocs,
    }));

    if (item["document"].length > 1) {
      setEditorOpen(true)
    } else {
      setEditorOpen(false)
    }
    editor.tf.setValue(item["document"])
    if (!documentRefreshOnly) {
      setActiveChatMessages([]);
      try {
        const chatHistoryResponse = await fetch('/api/ai/thread/messages', {
          body: JSON.stringify({
            chatAssistantId,
            threadId: item['threadId'],
            userId: session!.user!.email!,
          }),
          method: 'POST',
        });
        const json = await chatHistoryResponse.json();
        if (!chatHistoryResponse.ok) {
          toast.error(json['error']);
        } else {
          const messages = json['messages'] as Message[];
          if (messages.length == 0) {
            setActiveChatMessages([]);
          } else {
            messages.reverse().forEach((message) => {
              setActiveChatMessages((messages: Message[]) => [
                ...messages,
                {
                  id: message.id,
                  content: message.content[0]['text']['value'],
                  role: message.role,
                },
              ]);
            });
          }
        }
      } catch (e) {
        toast.error('Something unexpected happened...');
        console.error(e);
      }
    }

    setStatus('awaiting_message');
  };

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

  const currentItems = activeTab === 'chat' ? items.chat : items.document;
  const editorCssClass = editorOpen ? '' : 'hidden';
  const chatWindowCssClass = editorOpen ? '' : 'justify-center items-center';

  return (
    <ChatSettingsProvider setActiveItem={handleSetActiveItem}>
      <div className="flex h-screen flex-col">
        <HomeHeader
          onNewChat={handleNewChat}
          activeUserDocument={activeUserDocument}
          editorOpen={editorOpen}
          isSidebarOpen={isSidebarOpen}
          setActiveItem={handleSetActiveItem}
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
            items={currentItems}
            setActiveItem={handleSetActiveItem}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          <ChatContent
            onNewChat={handleNewChat}
            activeChatMessages={activeChatMessages}
            activeUserDocument={activeUserDocument}
            editor={editor}
            editorOpen={editorOpen}
            setActiveChatMessages={setActiveChatMessages}
            setActiveItem={handleSetActiveItem}
            setEditorOpen={setEditorOpen}
            setStatus={setStatus}
            status={status}
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
            className={
              'z-10 overflow-y-scroll border bg-background shadow w-3/4 ' +
              editorCssClass
            }
          >
            <PlateEditor plateEditor={editor} />
          </div>
        </div>
      </div>
    </ChatSettingsProvider>
  );
}
