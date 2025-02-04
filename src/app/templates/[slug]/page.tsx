'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import DocumentProvider, { useDocument } from '@/providers/DocumentProvider';
import { useUserDataContext } from '@/providers/UserDataProvider';
import { ArrowLeftFromLine } from 'lucide-react';

import PlateEditor, { useMyEditor } from '@/components/plate-editor';

// async function getTemplates(templateOwnerId: string) {
//   let result: any[] = [];
//   const userTemplatesSnapshot = await getOwnedTemplates(templateOwnerId);
//   userTemplatesSnapshot.docs.forEach((doc) => {
//     const res = {
//       templateName: doc.get('templateName'),
//       template: doc.get('template'),
//       id: doc.id,
//       templateOwnerId: doc.get('templateOwnerId'),
//     };
//
//     result.push(res);
//   });
//   return result;
// }

export default function Page() {
  const params = useParams();
  const { userTemplates } = useUserDataContext();
  const { providedTemplates } = useDocument();

  let displayedTemplate: any | null;
  if (userTemplates != null) {
    displayedTemplate = userTemplates.find(
      (templ) =>
        templ['templateName'] ===
        (params['slug'] as string).replaceAll('%20', ' ')
    );
  }
  if (!displayedTemplate) {
    displayedTemplate = providedTemplates!.find(
      (templ) =>
        templ['templateName'] ===
        (params['slug'] as string).replaceAll('%20', ' ')
    );
  }
  if (!displayedTemplate) {
    displayedTemplate = providedTemplates!.find(
      (templ) => templ['templateName'] === 'Default PRD Template'
    );
  }

  const editor = useMyEditor(displayedTemplate);
  return (
    <section className="container grid flex-row items-center gap-6 px-4 pb-8 pt-6 align-baseline sm:px-8 md:py-10">
      <Link href="/">
        <ArrowLeftFromLine className="cursor-pointer" />
      </Link>
      <div className="max-w-[calc(100vw-32px)] rounded-lg border bg-background shadow sm:max-w-[min(calc(100vw-64px),1336px)]">
        <DocumentProvider template={displayedTemplate}>
          <PlateEditor editor={editor} />
        </DocumentProvider>
      </div>
    </section>
  );
}
