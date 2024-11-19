import { cn } from '@udecode/cn';
import { Toaster } from 'sonner';

import { siteConfig } from '@/config/site';
import { fontSans } from '@/lib/fonts';
import { SiteHeader } from '@/components/site/site-header';
import { TailwindIndicator } from '@/components/site/tailwind-indicator';
import { ThemeProvider } from '@/components/site/theme-provider';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';


import '@/styles/globals.css';

import { Metadata, Viewport } from 'next';

import { OpenAIProvider } from '@/components/openai/openai-context';
import {auth} from "../../auth";
import {
  getUserActiveAssistantAndVectorIds,
  getUserActiveThreadId, getUserDocument,
  getUserUploadedFilesData,
  saveUserActiveAssistant, saveUserActiveThread
} from "@/firebase/firestore-dao";
import {Session} from "next-auth";
import UserDataContextProvider from "@/providers/UserDataContextProvider";
import {SessionProvider} from "next-auth/react";

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
    const { savedAssistantId, savedVectorStoreId } =  await getUserActiveAssistantAndVectorIds(session.user?.email!)

    if (savedAssistantId && savedVectorStoreId) {
      openAiAssistantId = savedAssistantId
      openAiVectorStoreId = savedVectorStoreId
    } else {
      let userId = session.user?.email!
      // TODO: idk why we need to use a environment variable to do a fetch specifically here but we do...
      // Find a better way
      const createAssistantResult = await fetch(process.env.NEXTAUTH_URL + '/api/ai/assistant/create', {
        method: 'POST',
        body: JSON.stringify({ userId }),
      })
      const responseJson = await createAssistantResult.json()
      openAiAssistantId = responseJson["assistantId"]
      openAiVectorStoreId = responseJson["vectorStoreId"]

      // TODO: Move this to the server, no need for this to happen here, potentially unsafe
      await saveUserActiveAssistant(userId, openAiAssistantId, openAiVectorStoreId)
    }
  } catch (error) {
    console.error(error)
  }

  return {openAiAssistantId, openAiVectorStoreId};
}

async function createThreadIfNotExist(session: Session) {
  let threadId;
  // TODO: same as above
  try {
    const fireBaseResult =  await getUserActiveThreadId(session.user?.email!)

    if (fireBaseResult.result != undefined) {
      threadId = fireBaseResult.result
    } else {
      let userId = session.user?.email!
      // TODO: idk why we need to use a environment variable to do a fetch specifically here but we do...
      // Find a better way
      const createThreadResult = await fetch(process.env.NEXTAUTH_URL + '/api/ai/thread', {
        method: 'POST',
        body: JSON.stringify({ userId }),
      })
      const responseJson = await createThreadResult.json()
      threadId = responseJson["threadId"]

      await saveUserActiveThread(userId, threadId)
    }
  } catch (error) {
    console.error(error)
  }

  return threadId;
}

async function getExistingUserUploadedFiles(session: Session) {
  let result: Array<Map<string, string>> = []
  await getUserUploadedFilesData(session.user?.email!).then((data) => {
    if (data.result != undefined) {
      result = data.result
    }
  })

  return result
}

async function getPreviousUserDocument(session: Session) {
  const userDocResult = await getUserDocument(session.user?.email!)
  return userDocResult.result
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = await auth()
  let openAiAssistantId, openAiVectorStoreId;
  if (session?.user) {
    const res = await createAssistantIfNotExist(session)
    openAiAssistantId = res.openAiAssistantId
    openAiVectorStoreId = res.openAiVectorStoreId
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
                  openAiVectorStoreId={session?.user ? openAiVectorStoreId : null}
                  openAiThreadId={session?.user ? await createThreadIfNotExist(session) : null}
                  userDocument={session?.user ? await getPreviousUserDocument(session) : null}
                  filesData={session?.user ? await getExistingUserUploadedFiles(session) : null}>
                  <div className="relative flex min-h-screen flex-col">
                    <SiteHeader session={session}/>
                    <div className="flex-1">{children}</div>
                  </div>
                </UserDataContextProvider>
              </SessionProvider>
            </OpenAIProvider>
            <TailwindIndicator/>
            <Toaster/>
          </ThemeProvider>
          <SpeedInsights/>
          <Analytics/>
        </body>
      </html>
    </>
  );
}
