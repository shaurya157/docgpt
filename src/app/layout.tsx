import type { Metadata } from 'next';

import { GoogleAnalytics } from '@next/third-parties/google';
import {cn} from "@udecode/cn";
import {Analytics} from "@vercel/analytics/react";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { SessionProvider } from 'next-auth/react';
import {Toaster} from "sonner";

import ConditionalFooter from '@/components/landing/conditional-footer';
import ConditionalHeader from '@/components/landing/conditional-header';
import { getUserChats } from '@/firebase/firestore-dao';
import DocumentProvider from '@/providers/document-provider';
import {ThemeProvider} from "@/providers/theme-provider";
import UserDataContextProvider from '@/providers/user-data-provider';
import { UserIntegrations } from '@/types';
import {fontSans} from "@/utils/fonts";
import {
  getExistingUserUploadedFiles,
  getTemplates,
  getUserDocs,
  getUserIntegrationStatus
} from "@/utils/on-user-signin-fetch";
import { TailwindIndicator } from '@/utils/tailwind-indicator';

import {auth} from "../../auth";

import './globals.css';

export const metadata: Metadata = {
  description: 'AI-powered document editor',
  title: 'DocGPT',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  let userChats,
      userDocuments;
  let userIntegrationsStatus: UserIntegrations | null = null;
  if (session?.user) {
    userDocuments = await getUserDocs(session);
    const chatsRes = await getUserChats(session.user.email!);
    userChats = chatsRes.error ? [] : chatsRes.result;
    userIntegrationsStatus = await getUserIntegrationStatus(session);
  }

  return (
      <>
        <html lang="en" suppressHydrationWarning>
        <head>
          <title>DocGPT - AI powered document editor</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
                userChats={userChats}
                userDefinedTemplates={
                  session?.user
                      ? await getTemplates(session!.user!.email!)
                      : null
                }
                userDocuments={userDocuments}
                userIntegrationsData={userIntegrationsStatus}
            >
              <DocumentProvider
                  docgptProvidedTemplates={
                    session?.user ? await getTemplates('docgpt') : null
                  }
              >
                {!session?.user ? <ConditionalHeader /> : <div></div>}
                <div className="flex-1">{children}</div>
                {!session?.user && <ConditionalFooter />}
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
