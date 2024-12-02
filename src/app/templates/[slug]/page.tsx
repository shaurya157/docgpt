import Link from 'next/link';

import { siteConfig } from '@/config/site';
import PlateEditor from '@/components/plate-editor';
import {getDocgptOwnedTemplates, getUserTemplates} from "@/firebase/firestore-dao";
import {toast} from "sonner";
import {useSession} from "next-auth/react";
import {auth} from "../../../../auth";
import {Session} from "next-auth";
import DocumentProvider from "@/providers/document-provider";

async function getProvidedTemplates() {
  const result = await getDocgptOwnedTemplates()

  return result.result;
}

async function getUserOwnedTemplates(session: Session) {
  const userTemplates = await getUserTemplates(session!.user!.email!)
  if (!userTemplates.result) {
    return null
  }

  return userTemplates.result;
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug
  const session = await auth()
  const providedTemplates = await getProvidedTemplates()
  const userTemplates = session?.user?.email ? await getUserOwnedTemplates(session) : null

  let displayedTemplate: any | null
  if (!slug.startsWith("docgpt") && userTemplates != null) {
    displayedTemplate = userTemplates.find(templ => templ["templateName"] === slug)
  } else {
    displayedTemplate =  providedTemplates.find(templ => templ["templateName"] === slug)
  }

  if (!displayedTemplate) {
    displayedTemplate = providedTemplates.find(templ => templ["templateName"] === "docgpt-default")
  }

  return (
    <section className="container grid items-center gap-6 px-4 pb-8 pt-6 sm:px-8 md:py-10">
      <div
        className="max-w-[calc(100vw-32px)] rounded-lg border bg-background shadow sm:max-w-[min(calc(100vw-64px),1336px)]">
        <DocumentProvider
          displayedTemplate={session?.user ? displayedTemplate : null}
          docgptProvidedTemplates={ session?.user ? await getProvidedTemplates() : null }
        >
          <PlateEditor/>
        </DocumentProvider>

      </div>
    </section>
  );
}
