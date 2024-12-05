import Link from 'next/link';

import { siteConfig } from '@/config/site';
import PlateEditor from '@/components/plate-editor';
import {UiSwitchWindow} from "@/components/site/ui-switch-window";
import UserSettingsProvider from "@/providers/user-settings-provider";

export default async function IndexPage() {

  return (
      <section className="container grid items-center gap-6 px-4 pb-8 pt-6 sm:px-8 md:py-10">
        <UserSettingsProvider>
          <UiSwitchWindow></UiSwitchWindow>
        </UserSettingsProvider>
      </section>
  );
}
