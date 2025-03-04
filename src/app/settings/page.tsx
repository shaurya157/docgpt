'use client';

import {useState} from "react";

import {useRouter} from "next/navigation";

import { AssistantSettings } from '@/components/settings/assistant-settings';
import { TemplateSettings } from '@/components/settings/template-settings';
import Sidebar from "@/components/sidebar/sidebar";
import HomeHeader from "@/components/site/home-header";

export default function Settings({params}) {
    const [activeTab, setActiveTab] = useState<'chat' | 'settings'>('settings');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const router = useRouter();
    const [activeSetting, setActiveSetting] = useState("templates")

    const redirectToHome = () => {
        router.push("/home")
    }

    const getSettingsItem = () => {
      switch (activeSetting) {
        case "assistants": {
          return <AssistantSettings />
        }
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
                editorOpen={false}
                setEditorOpen={() => { console.log("Editor only available in home")} }
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />

            <div className="relative flex flex-1 overflow-hidden">
              <Sidebar
                  onDeleteChat={() => {}}
                  activeSetting={activeSetting}
                  activeTab={activeTab}
                  activeUserDocument={{}}
                  editorOpen={false}
                  isOpen={isSidebarOpen}
                  items={[]}
                  setActiveItem={() => {}}
                  setActiveSetting={setActiveSetting}
                  toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              />
              { getSettingsItem() }
            </div>
        </div>
    )
}