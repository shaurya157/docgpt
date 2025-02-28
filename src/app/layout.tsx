import type { Metadata } from 'next';

import { GoogleAnalytics } from '@next/third-parties/google';
import {cn} from "@udecode/cn";
import {Analytics} from "@vercel/analytics/react";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { SessionProvider } from 'next-auth/react';
import {Toaster} from "sonner";

import PreLoginHeader from '@/components/landing/pre-login-header';
import AssistantsProvider from '@/providers/assistants-provider';
import ChatSettingsProvider from '@/providers/chat-settings-provider';
import DocumentProvider from '@/providers/document-provider';
import {ThemeProvider} from "@/providers/theme-provider";
import UserDataContextProvider from '@/providers/user-data-provider';
import {fontSans} from "@/utils/fonts";
import {
  createAssistantIfNotExist, getAssistantDefinitions,
  getExistingUserUploadedFiles,
  getTemplates,
  getUserDocs
} from "@/utils/on-user-signin-fetch";
import { TailwindIndicator } from '@/utils/tailwind-indicator';

import {auth} from "../../auth";

import './globals.css';

export const metadata: Metadata = {
  description: 'AI powered product document creation',
  title: 'DocGPT',
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  let openAiAssistantId,
      openAiChatAssistantId,
      openAiVectorStoreId,
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
        <GoogleAnalytics gaId="G-ZFB84M0FYS" />
        <ThemeProvider attribute="class" defaultTheme="light">
          <SessionProvider session={session}>
            <UserDataContextProvider
                filesData={
                  session?.user
                      ? await getExistingUserUploadedFiles(session)
                      : null
                }
                openAiAssistantId={session?.user ? openAiAssistantId : null}
                openAiChatAssistantId={openAiChatAssistantId}
                openAiVectorStoreId={openAiVectorStoreId}
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
                    {/* {!session?.user ? <PreLoginFooter /> : <div></div>} */}
                  </ChatSettingsProvider>
                </AssistantsProvider>
              </DocumentProvider>
            </UserDataContextProvider>
          </SessionProvider>
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
