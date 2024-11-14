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
import {getUserUploadedFilesData} from "@/firebase/firestore-dao";

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

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = await auth()
  let userFilesData: Array<Map<string, string>> = []
  if (session) {
    // TODO: this is very inelegant. We are making the call in the site header/page and then passing all the children the user uploaded files.
    // I've done this due to a lack of knowledge about how to make server side callbacks when a user signs in.
    // Ideally, when the user signs in, we should:
    // 1) Get all user data
    // 2) Check if there is an active assistant + thread
    // 3) If not, create a new assistant + thread + save to DB
    // All 3 should be done as a callback. If we do this, the user needs to refresh the page to see any details which isn't ideal.
    // The same is done on layout.tsx, once refactor make the same change there

    await getUserUploadedFilesData(session.user?.email!).then((data) => {
      if (data.result != undefined) {
        userFilesData = data.result
      }
    })
  }

  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body
          className={cn(
            'min-h-screen bg-background font-sans antialiased',
            '[&_.slate-selection-area]:bg-brand/15',
            fontSans.variable
          )}
        >
          <ThemeProvider attribute="class" defaultTheme="light">
            <OpenAIProvider>
              <div className="relative flex min-h-screen flex-col">
                <SiteHeader session={session} userFilesData={userFilesData} />
                <div className="flex-1">{children}</div>
              </div>
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
