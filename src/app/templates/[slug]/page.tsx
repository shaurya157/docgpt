'use client';

import { useParams } from 'next/navigation';
import DocumentProvider, { useDocument } from '@/providers/document-provider';
import { useUserDataContext } from '@/providers/user-data-context-provider';

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
  // const slug = (await params).slug;
  // const session = await auth();
  // const providedTemplates = await getTemplates('docgpt');
  // const userTemplates = session?.user?.email
  //   ? await getTemplates(session!.user!.email!)
  //   : null;

  let displayedTemplate: any | null;
  if (userTemplates != null) {
    displayedTemplate = userTemplates.find(
      (templ) => templ['templateName'] === params['slug']
    );
  }
  if (!displayedTemplate) {
    displayedTemplate = providedTemplates!.find(
      (templ) => templ['templateName'] === params['slug']
    );
  }
  if (!displayedTemplate) {
    displayedTemplate = providedTemplates!.find(
      (templ) => templ['templateName'] === 'default'
    );
  }

  const editor = useMyEditor(displayedTemplate);
  return (
    <section className="container grid items-center gap-6 px-4 pb-8 pt-6 sm:px-8 md:py-10">
      <div className="max-w-[calc(100vw-32px)] rounded-lg border bg-background shadow sm:max-w-[min(calc(100vw-64px),1336px)]">
        <DocumentProvider template={displayedTemplate}>
          <PlateEditor editor={editor} />
        </DocumentProvider>
      </div>
    </section>
  );
}
