import Link from 'next/link';

import { siteConfig } from '@/config/site';
import PlateEditor from '@/components/plate-editor';
import {getDocgptOwnedTemplates, getUserTemplates} from "@/firebase/firestore-dao";
import {toast} from "sonner";
import {useSession} from "next-auth/react";
import {auth} from "../../../../auth";
import {Session} from "next-auth";
import UserSettingsProvider from "@/providers/UserSettingsProvider";

async function getProvidedTemplates(slug: string) {
  const result = await getDocgptOwnedTemplates("docgpt")
  if (!result.result[slug]){
    console.error(`No template found for ${slug}, using default template instead`);
    return result.result["default"]
  }

  return result.result[slug];
}

async function getUserOwnedTemplates(session: Session, slug: string) {
  const userTemplates = (await getUserTemplates(session!.user!.email!)).result as Map<string, string | Map<string, string>[]>[]
  let result: any = null
  userTemplates.forEach(userTemplate => {
    if (userTemplate["templateName"] == slug) {
      result = userTemplate
    }
  })

  return result;
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug
  const session = await auth()

  return (
    <section className="container grid items-center gap-6 px-4 pb-8 pt-6 sm:px-8 md:py-10">
      <div
        className="max-w-[calc(100vw-32px)] rounded-lg border bg-background shadow sm:max-w-[min(calc(100vw-64px),1336px)]">
        <UserSettingsProvider userTemplate={session?.user ? await getUserOwnedTemplates(session!, slug) : null}>
          <PlateEditor/>
        </UserSettingsProvider>

      </div>
    </section>
  );
}
