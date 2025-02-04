import { cn } from '@udecode/cn';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from 'sonner';

import { siteConfig } from '@/config/site';
import { fontSans } from '@/lib/fonts';
import { TailwindIndicator } from '@/components/site/tailwind-indicator';
import { ThemeProvider } from '@/components/site/theme-provider';

import '@/styles/globals.css';

import { Metadata, Viewport } from 'next';
import {
  getAssistants,
  getOwnedTemplates,
  getUserInfo,
  getUserOwnedDocuments,
  getUserUploadedFilesData,
  saveUserActiveAssistant,
} from '@/firebase/firestore-dao';
import AssistantsProvider from '@/providers/AssistantsProvider';
import ChatSettingsProvider from '@/providers/ChatSettingsProvider';
import DocumentProvider from '@/providers/DocumentProvider';
import UserDataContextProvider, {
  FileInfo,
} from '@/providers/UserDataProvider';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

import { OpenAIProvider } from '@/components/openai/openai-context';
import PreLoginFooter from '@/components/PreLoginFooter';
import PreLoginHeader from '@/components/PreLoginHeader';

import { auth } from '../../auth';

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

async function createAssistantIfNotExist(session: Session) {
  let openAiAssistantId;
  let openAiVectorStoreId;
  let openAiChatAssistantId;
  // TODO: this is very inelegant. We are making the call in the site header/page and then passing all the children the user uploaded files.
  // I've done this due to a lack of knowledge about how to make server side callbacks when a user signs in. This is also potentially running multiple times...
  // Ideally, when the user signs in, we should:
  // 1) Get all user data
  // 2) Check if there is an active assistant + thread
  // 3) If not, create a new assistant + thread + save to DB
  // All 3 should be done as a callback. If we do this, the user needs to refresh the page to see any details which isn't ideal.
  // The same is done on layout.tsx, once refactor make the same change there
  // Maybe we can use useEffect() here?
  try {
    const { savedAssistantId, savedVectorStoreId, savedOpenAiChatAssistantId } =
      await getUserInfo(session.user?.email!);
    if (savedAssistantId && savedVectorStoreId && savedOpenAiChatAssistantId) {
      openAiAssistantId = savedAssistantId;
      openAiVectorStoreId = savedVectorStoreId;
      openAiChatAssistantId = savedOpenAiChatAssistantId;
    } else {
      let userId = session.user?.email!;
      // TODO: idk why we need to use a environment variable to do a fetch specifically here but we do...
      // Find a better way
      const createAssistantResult = await fetch(
        process.env.NEXTAUTH_URL + '/api/ai/assistant/create',
        {
          method: 'POST',
          body: JSON.stringify({ userId }),
        }
      );
      const responseJson = await createAssistantResult.json();
      openAiAssistantId = responseJson['assistantId'];
      openAiVectorStoreId = responseJson['vectorStoreId'];
      openAiChatAssistantId = responseJson['chatAssistantId'];

      // TODO: Move this to the server, no need for this to happen here, potentially unsafe
      await saveUserActiveAssistant(
        userId,
        openAiAssistantId,
        openAiVectorStoreId,
        openAiChatAssistantId
      );
    }
  } catch (error) {
    console.error(error);
  }

  return {
    openAiAssistantId,
    openAiVectorStoreId,
    openAiChatAssistantId,
  };
}

async function getExistingUserUploadedFiles(session: Session) {
  let result: FileInfo[] = [];
  await getUserUploadedFilesData(session.user?.email!).then((data) => {
    if (data.result != undefined) {
      data.result.forEach((file) => {
        result.push({
          fileName: file.fileName,
          openAiFileId: file.openAiFileId,
        });
      });
    }
  });

  return result;
}

async function getTemplates(templateOwnerId: string) {
  let result: any[] = [];
  const userTemplatesSnapshot = await getOwnedTemplates(templateOwnerId);
  userTemplatesSnapshot.docs.forEach((doc) => {
    const res = {
      templateName: doc.get('templateName'),
      template: doc.get('template'),
      id: doc.id,
    };

    result.push(res);
  });
  return result;
}

async function getUserDocs(session) {
  let result: any[] = [];
  const resSnapshot = await getUserOwnedDocuments(session!.user!.email!);
  resSnapshot.docs.forEach((doc) => {
    const res = {
      id: doc.id,
      documentName: doc.get('documentName'),
      document: doc.get('document'),
      threadId: doc.get('threadId'),
      vectorStoreId: doc.get('vectorStoreId'),
    };

    result.push(res);
  });
  return result;
}

async function getAssistantDefinitions(assistantOwnerId) {
  let result: any[] = [];
  const assistantDefinitionsSnapshot = await getAssistants(assistantOwnerId);
  assistantDefinitionsSnapshot.docs.forEach((doc) => {
    const res = {
      ownerId: doc.get('ownerId'),
      goals: doc.get('goals'),
      rules: doc.get('rules'),
      name: doc.get('name'),
      role: doc.get('role'),
      id: doc.id,
    };

    result.push(res);
  });

  return result;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = await auth();
  let openAiAssistantId,
    openAiVectorStoreId,
    openAiChatAssistantId,
    userDocuments;
  if (session?.user) {
    const res = await createAssistantIfNotExist(session);
    openAiAssistantId = res.openAiAssistantId;
    openAiVectorStoreId = res.openAiVectorStoreId;
    openAiChatAssistantId = res.openAiChatAssistantId;
    userDocuments = await getUserDocs(session);
  }

  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head>
          <title>DocGPT</title>
        </head>
        <body
          className={cn(
            'min-h-screen bg-background font-sans antialiased',
            '[&_.slate-selection-area]:bg-brand/15',
            fontSans.variable
          )}
        >
          <ThemeProvider attribute="class" defaultTheme="light">
            <OpenAIProvider>
              <SessionProvider session={session}>
                <UserDataContextProvider
                  openAiAssistantId={session?.user ? openAiAssistantId : null}
                  openAiVectorStoreId={openAiVectorStoreId}
                  openAiChatAssistantId={openAiChatAssistantId}
                  filesData={
                    session?.user
                      ? await getExistingUserUploadedFiles(session)
                      : null
                  }
                  userDefinedTemplates={
                    session?.user
                      ? await getTemplates(session!.user!.email!)
                      : null
                  }
                  userDocuments={userDocuments}
                >
                  <DocumentProvider
                    docgptProvidedTemplates={
                      session?.user ? await getTemplates('docgpt') : null
                    }
                  >
                    <AssistantsProvider
                      providedAssistantDefinitions={await getAssistantDefinitions(
                        'docgpt'
                      )}
                    >
                      <ChatSettingsProvider>
                        {!session?.user ? <PreLoginHeader /> : <div></div>}
                        <div className="flex-1">{children}</div>
                        {!session?.user ? <PreLoginFooter /> : <div></div>}
                      </ChatSettingsProvider>
                    </AssistantsProvider>
                  </DocumentProvider>
                </UserDataContextProvider>
              </SessionProvider>
            </OpenAIProvider>
            <TailwindIndicator />
            <Toaster />
          </ThemeProvider>
          <SpeedInsights />
          <Analytics />
        </body>
      </html>
    </>
  );
}
