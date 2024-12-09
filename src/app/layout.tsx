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
  getUserInfo,
  getUserActiveThreadId, getUserOwnedDocuments, getOwnedTemplates,
  getUserUploadedFilesData,
  saveUserActiveAssistant, saveUserActiveThread
} from "@/firebase/firestore-dao";
import {Session} from "next-auth";
import UserDataContextProvider from "@/providers/user-data-context-provider";
import {SessionProvider} from "next-auth/react";
import DocumentProvider from "@/providers/document-provider";

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
  let activeDocumentName;
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
    const { savedAssistantId, savedVectorStoreId, savedOpenAiChatAssistantId, savedActiveDocumentName } =  await getUserInfo(session.user?.email!)
    if (savedAssistantId && savedVectorStoreId && savedOpenAiChatAssistantId) {
      openAiAssistantId = savedAssistantId
      openAiVectorStoreId = savedVectorStoreId
      openAiChatAssistantId = savedOpenAiChatAssistantId
      activeDocumentName = savedActiveDocumentName
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
      openAiChatAssistantId = responseJson["chatAssistantId"]

      // TODO: Move this to the server, no need for this to happen here, potentially unsafe
      await saveUserActiveAssistant(userId, openAiAssistantId, openAiVectorStoreId, openAiChatAssistantId)
    }
  } catch (error) {
    console.error(error)
  }

  return {openAiAssistantId, openAiVectorStoreId, openAiChatAssistantId, activeDocumentName};
}

async function createThread(session: Session) {
  let userId = session.user?.email!
  // TODO: idk why we need to use a environment variable to do a fetch specifically here but we do...
  // Find a better way
  const createThreadResult = await fetch(process.env.NEXTAUTH_URL + '/api/ai/thread/create', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  })
  const responseJson = await createThreadResult.json()
  return responseJson["threadId"]
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

async function getTemplates(templateOwnerId: string) {
  let result: any[] = []
  const userTemplatesSnapshot = await getOwnedTemplates(templateOwnerId)
  userTemplatesSnapshot.docs.forEach((doc) => {
    const res = {
      "templateName": doc.id,
      "template": doc.get("template")
    }

    result.push(res)
  })
  return result
}

async function getUserDocs(session) {
  let result: any[] = []
  const resSnapshot = await getUserOwnedDocuments(session!.user!.email!)
  resSnapshot.docs.forEach((doc) => {
    const res = {
      "id": doc.id,
      "documentName": doc.get("documentName"),
      "document": doc.get("document"),
      "threadId": doc.get("threadId"),
    }

    result.push(res)
  })
  return result
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = await auth()
  let openAiAssistantId, openAiVectorStoreId, openAiChatAssistantId, initialOpenAiThreadId, userDocuments, userDocument;
  if (session?.user) {
    const res = await createAssistantIfNotExist(session)
    openAiAssistantId = res.openAiAssistantId
    openAiVectorStoreId = res.openAiVectorStoreId
    openAiChatAssistantId = res.openAiChatAssistantId
    let activeDocumentName = res.activeDocumentName

    userDocuments = await getUserDocs(session)

    // TODO: there MUST be a better way to do this...
    if (userDocuments.length > 0) {
      if (activeDocumentName) {
        let doc = userDocuments.find(doc => doc["documentName"] === activeDocumentName)
        if (doc) {
          initialOpenAiThreadId = doc["threadId"]
          userDocument = doc
        } else {
          initialOpenAiThreadId = userDocuments[userDocuments.length - 1]["threadId"]
          userDocument = userDocuments[userDocuments.length - 1]
        }
      } else {
        initialOpenAiThreadId = userDocuments[userDocuments.length - 1]["threadId"]
        userDocument = userDocuments[userDocuments.length - 1]
      }
    } else {
      initialOpenAiThreadId = await createThread(session)
    }
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
                  openAiChatAssistantId={session?.user ? openAiChatAssistantId : null}
                  openAiThreadId={initialOpenAiThreadId}
                  filesData={session?.user ? await getExistingUserUploadedFiles(session) : null}
                  userDefinedTemplates={session?.user ? await getTemplates(session!.user!.email!) : null}
                  userDocuments={userDocuments}
                >
                  <DocumentProvider
                    docgptProvidedTemplates={session?.user ? await getTemplates("docgpt") : null}
                    userDocument={userDocument}
                  >
                    <div className="relative flex min-h-screen flex-col">
                      <SiteHeader session={session}/>
                      <div className="flex-1">{children}</div>
                    </div>
                  </DocumentProvider>
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
