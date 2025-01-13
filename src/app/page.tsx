'use client';

import { useEffect, useState } from 'react';
import { saveCurrentDocumentState } from '@/firebase/firestore-dao';
import { useDocument } from '@/providers/document-provider';
import { useUserDataContext } from '@/providers/user-data-context-provider';
import { AssistantStatus, Message } from 'ai';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import ChatContent from '@/components/ChatContent';
import Header from '@/components/Header';
import OnboardingTooltip from '@/components/OnboardingTooltip';
import PlateEditor, { useMyEditor } from '@/components/plate-editor';
import Sidebar from '@/components/Sidebar';

const startingMessage: Message = {
  id: '1',
  role: 'assistant',
  content:
    'Hi, how can I help you today? You can press /help to learn about everything I can do for you.',
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<'chat' | 'document'>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { userOwnedDocuments } = useUserDataContext();
  const { activeUserDocument, setActiveUserDocument } = useDocument();
  const [activeChatMessages, setActiveChatMessages] = useState<Message[]>([]);
  const { data: session } = useSession();
  const { chatAssistantId } = useUserDataContext();
  const [status, setStatus] = useState<AssistantStatus>('awaiting_message');
  // TODO: can prolly move this out to layout instead and provide it globally with a provider.
  // TODO: fix here and the other page.tsx file
  const editor = useMyEditor();

  const [items, setItems] = useState({
    chat: userOwnedDocuments,
    document: userOwnedDocuments,
  });

  const handleNewChat = async () => {
    const createThreadResult = await fetch('/api/ai/thread/create', {
      method: 'POST',
      body: JSON.stringify({ userId: session!.user!.email }),
    });
    const responseJson = await createThreadResult.json();
    toast.success(
      `Thread created successfully, using fresh state with thread ID: ${responseJson['threadId']}`
    );
    let dateTime = new Date();
    const item = {
      document: [],
      threadId: responseJson['threadId'],
      vectorStoreId: responseJson['vectorStoreId'],
      documentName: `Untitled - ${dateTime.getFullYear()}-${dateTime.getMonth() + 1}-${dateTime.getDay()}T${dateTime.getHours()}::${dateTime.getMinutes()}::${dateTime.getSeconds()}`,
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
    setActiveChatMessages([startingMessage]);
    setActiveTab('chat');
  };

  const handleDeleteChat = (chatId: string) => {
    setItems((prev) => ({
      ...prev,
      chat: prev.chat!.filter((chat) => chat.id !== chatId),
    }));
  };

  const handleSetActiveItem = async (item, documentRefreshOnly?: boolean) => {
    setStatus('in_progress');
    setActiveUserDocument(item);
    if (!documentRefreshOnly) {
      setActiveChatMessages([]);
      try {
        const chatHistoryResponse = await fetch('/api/ai/thread/messages', {
          method: 'POST',
          body: JSON.stringify({
            userId: session!.user!.email!,
            threadId: item['threadId'],
            chatAssistantId,
          }),
        });
        const json = await chatHistoryResponse.json();
        if (!chatHistoryResponse.ok) {
          toast.error(json['error']);
        } else {
          const messages = json['messages'] as Message[];
          if (messages.length == 0) {
            setActiveChatMessages([startingMessage]);
          } else {
            messages.reverse().forEach((message) => {
              setActiveChatMessages((messages: Message[]) => [
                ...messages,
                {
                  id: message.id,
                  role: message.role,
                  content: message.content[0]['text']['value'],
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
      title: 'Get more relevant responses',
      content:
        'Upload files here that you would use to onboard a new team member. DocGPT will search these files for context when answering questions for you.',
    },
    {
      title: 'Tell us what you want DocGPT to do',
      content:
        'Submit a feature request or report a bug. We will reply within 12 hours.',
    },
  ];

  useEffect(() => {
    if (typeof window !== 'undefined') {
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

  return (
    <div className="flex h-screen flex-col">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onNewChat={handleNewChat}
        setActiveItem={handleSetActiveItem}
      />
      <div className="relative flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          items={currentItems}
          activeItem={activeUserDocument}
          setActiveItem={handleSetActiveItem}
          activeTab={activeTab}
          onDeleteChat={handleDeleteChat}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <ChatContent
          activeItem={activeUserDocument}
          activeChatMessages={activeChatMessages}
          setActiveChatMessages={setActiveChatMessages}
          setActiveItem={handleSetActiveItem}
          status={status}
          setStatus={setStatus}
          editor={editor}
        />
        <OnboardingTooltip
          steps={onboardingSteps}
          onComplete={() => console.log('Onboarding completeed')}
          isSidebarOpen={isSidebarOpen}
        />

        <div className="z-10 overflow-y-scroll border bg-background shadow sm:max-w-[min(calc(100vw-64px),1336px)]">
          <PlateEditor editor={editor} />
        </div>
      </div>
    </div>
  );
}
