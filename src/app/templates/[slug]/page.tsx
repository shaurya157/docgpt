import Link from 'next/link';

import { siteConfig } from '@/config/site';
import PlateEditor from '@/components/plate-editor';
import {getOwnedTemplates} from "@/firebase/firestore-dao";
import {toast} from "sonner";
import {useSession} from "next-auth/react";
import {auth} from "../../../../auth";
import {Session} from "next-auth";
import DocumentProvider from "@/providers/document-provider";

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

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug
  const session = await auth()
  const providedTemplates = await getTemplates("docgpt")
  const userTemplates = session?.user?.email ? await getTemplates(session!.user!.email!) : null

  let displayedTemplate: any | null
  if (userTemplates != null) {
    displayedTemplate = userTemplates.find(templ => templ["templateName"] === slug)
  }
  if (!displayedTemplate) {
    displayedTemplate =  providedTemplates.find(templ => templ["templateName"] === slug)
  }
  if (!displayedTemplate) {
    displayedTemplate = providedTemplates.find(templ => templ["templateName"] === "default")
  }

  return (
    <section className="container grid items-center gap-6 px-4 pb-8 pt-6 sm:px-8 md:py-10">
      <div
        className="max-w-[calc(100vw-32px)] rounded-lg border bg-background shadow sm:max-w-[min(calc(100vw-64px),1336px)]">
        <DocumentProvider
          template={session?.user ? displayedTemplate : null}
          docgptProvidedTemplates={ session?.user ? providedTemplates : null }
        >
          <PlateEditor/>
        </DocumentProvider>

      </div>
    </section>
  );
}
