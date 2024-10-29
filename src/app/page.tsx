import Link from 'next/link';

import { siteConfig } from '@/config/site';
import PlateEditor from '@/components/plate-editor';
import { buttonVariants } from '@/components/plate-ui/button';

export default function IndexPage() {
  return (
    <section className="container grid items-center gap-6 px-4 pb-8 pt-6 sm:px-8 md:py-10">
      <div className="max-w-[calc(100vw-32px)] rounded-lg border bg-background shadow sm:max-w-[min(calc(100vw-64px),1336px)]">
        <PlateEditor />
      </div>
    </section>
  );
}
