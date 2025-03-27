import type { Metadata } from 'next';

import { GoogleAnalytics } from '@next/third-parties/google';
import {cn} from "@udecode/cn";
import {Analytics} from "@vercel/analytics/react";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { SessionProvider } from 'next-auth/react';
import {Toaster} from "sonner";

import PreLoginFooter from '@/components/landing/pre-login-footer';
import PreLoginHeader from '@/components/landing/pre-login-header';
import { getUserChats } from '@/firebase/firestore-dao';
import DocumentProvider from '@/providers/document-provider';
import {ThemeProvider} from "@/providers/theme-provider";
import UserDataContextProvider from '@/providers/user-data-provider';
import {fontSans} from "@/utils/fonts";
import {
  getExistingUserUploadedFiles,
  getTemplates,
  getUserDocs
} from "@/utils/on-user-signin-fetch";
import { TailwindIndicator } from '@/utils/tailwind-indicator';

import {auth} from "../../auth";

import './globals.css';

export const metadata: Metadata = {
  description: 'AI-powered document editor that combines the precision of Cursor with the collaborative features of Google Docs',
  title: 'DocGPT - Cursor meets Google Docs',
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  let userChats,
      userDocuments;
  if (session?.user) {
    userDocuments = await getUserDocs(session);
    const chatsRes = await getUserChats(session.user.email!);
    userChats = chatsRes.error ? [] : chatsRes.result;
  }

  return (
      <>
        <html lang="en" suppressHydrationWarning>
        <head>
          <title>DocGPT - Cursor meets Google Docs</title>
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
            >
              <DocumentProvider
                  docgptProvidedTemplates={
                    session?.user ? await getTemplates('docgpt') : null
                  }
              >
                {!session?.user ? <PreLoginHeader /> : <div></div>}
                <div className="flex-1">{children}</div>
                {!session?.user && <PreLoginFooter />}
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
