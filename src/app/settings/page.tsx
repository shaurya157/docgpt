'use client';

import {useState} from "react";

import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';

import { TemplateSettings } from '@/components/settings/template-settings';
import Sidebar from "@/components/sidebar/sidebar";
import HomeHeader from "@/components/site/home-header";

export default function Settings({params}) {
    const [activeTab] = useState<'chat' | 'settings'>('settings');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const router = useRouter();
    const [activeSetting, setActiveSetting] = useState("templates")
    const { data: session } = useSession();

    const redirectToHome = () => {
        router.push("/home")
    }

    // TODO: a bit hacky...
    if (!session?.user) {
      redirect('/');
    }

    const getSettingsItem = () => {
      switch (activeSetting) {
        case "templates": {
          return <TemplateSettings />
        }
        default: {
          return <TemplateSettings />
        }
      }
    }

    return (
        <div className="flex h-screen flex-col">
            <HomeHeader
                onNewChat={redirectToHome}
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />

            <div className="relative flex flex-1 overflow-hidden">
              <Sidebar
                  onDeleteChat={() => {}}
                  activeSetting={activeSetting}
                  activeTab={activeTab}
                  isOpen={isSidebarOpen}
                  items={[]}
                  setActiveItem={() => {}}
                  setActiveSetting={setActiveSetting}
                  toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                  changeEditorContent={() => {}}
              />
              { getSettingsItem() }
            </div>
        </div>
    )
}