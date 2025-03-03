'use client';

import {useState} from "react";
import Sidebar from "@/components/sidebar/sidebar";
import HomeHeader from "@/components/site/home-header";
import {useRouter} from "next/navigation";

export default function Settings() {
    const [activeTab, setActiveTab] = useState<'chat' | 'settings'>('settings');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const router = useRouter();

    const redirectToHome = () => {
        router.push("/home")
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
                    activeTab={activeTab}
                    activeUserDocument={{}}
                    editorOpen={false}
                    isOpen={isSidebarOpen}
                    items={[]}
                    setActiveItem={() => {}}
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                />
            </div>
        </div>
    )
}