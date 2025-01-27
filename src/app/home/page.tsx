'use client';

import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { saveCurrentDocumentState } from '@/firebase/firestore-dao';
import { useDocument } from '@/providers/document-provider';
import { useUserDataContext } from '@/providers/user-data-context-provider';
import { AssistantStatus, Message } from 'ai';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import ChatContent from '@/components/ChatContent';
import HomeHeader from '@/components/HomeHeader';
import OnboardingTooltip from '@/components/OnboardingTooltip';
import PlateEditor, { useMyEditor } from '@/components/plate-editor';
import Sidebar from '@/components/Sidebar';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'chat' | 'document'>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const { userOwnedDocuments } = useUserDataContext();
  const { activeUserDocument, setActiveUserDocument } = useDocument();
  const [activeChatMessages, setActiveChatMessages] = useState<Message[]>([]);
  const { data: session } = useSession();
  const { chatAssistantId } = useUserDataContext();
  const [status, setStatus] = useState<AssistantStatus>('awaiting_message');
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  // TODO: can prolly move this out to layout instead and provide it globally with a provider.
  // TODO: fix here and the other page.tsx file
  const editor = useMyEditor();

  // TODO: a bit hacky...
  if (!session?.user) {
    redirect('/');
  }

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
    const item = {
      document: [
        {
          id: '1',
          type: 'h1',
          children: [
            {
              text: '',
            },
          ],
        },
      ],
      threadId: responseJson['threadId'],
      vectorStoreId: responseJson['vectorStoreId'],
      documentName: `Untitled`,
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
    setActiveChatMessages([]);
    setActiveTab('chat');
    return item;
  };

  const handleDeleteChat = (chatId: string) => {
    setItems((prev) => ({
      ...prev,
      chat: prev.chat!.filter((chat) => chat.id !== chatId),
    }));
  };

  const handleSetActiveItem = async (item, documentRefreshOnly?: boolean) => {
    console.log('RUNNING@');
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
            setActiveChatMessages([]);
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
      if (window.sessionStorage.getItem('OnboardingCompleted') === 'true') {
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
    <div className="flex h-screen flex-col">
      <HomeHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onNewChat={handleNewChat}
        setActiveItem={handleSetActiveItem}
        setEditorOpen={setEditorOpen}
        editorOpen={editorOpen}
        activeUserDocument={activeUserDocument}
      />
      <div
        className={'relative flex flex-1 overflow-hidden ' + chatWindowCssClass}
      >
        <Sidebar
          isOpen={isSidebarOpen}
          items={currentItems}
          activeUserDocument={activeUserDocument}
          setActiveItem={handleSetActiveItem}
          activeTab={activeTab}
          onDeleteChat={handleDeleteChat}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <ChatContent
          activeUserDocument={activeUserDocument}
          activeChatMessages={activeChatMessages}
          setActiveChatMessages={setActiveChatMessages}
          setActiveItem={handleSetActiveItem}
          status={status}
          setStatus={setStatus}
          editor={editor}
          editorOpen={editorOpen}
          setEditorOpen={setEditorOpen}
          onNewChat={handleNewChat}
        />
        {!onboardingCompleted && (
          <OnboardingTooltip
            steps={onboardingSteps}
            onComplete={() =>
              sessionStorage.setItem('OnboardingCompleted', 'true')
            }
            isSidebarOpen={isSidebarOpen}
          />
        )}

        <div
          className={
            'z-10 overflow-y-scroll border bg-background shadow w-3/4 ' +
            editorCssClass
          }
        >
          <PlateEditor editor={editor} />
        </div>
      </div>
    </div>
  );
}
