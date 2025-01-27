import Image from 'next/image';
import { FileMinus, FilePlus, MessageSquarePlusIcon } from 'lucide-react';

import { TemplatesDropdown } from '@/components/site/templates-dropdown';

import SidebarIcon from '../assets/icons/sidebar.svg';

interface HeaderProps {
  activeTab: 'chat' | 'document';
  setActiveTab: (tab: 'chat' | 'document') => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  onNewChat: () => void;
  setActiveItem: (item, documentRefreshOnly) => void;
  setEditorOpen: (open: boolean) => void;
  editorOpen: boolean;
  activeUserDocument: {};
}

const HomeHeader = ({
  editorOpen,
  setEditorOpen,
  isSidebarOpen,
  toggleSidebar,
  onNewChat,
  setActiveItem,
  activeUserDocument,
}: HeaderProps) => {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-4">
      <button
        onClick={toggleSidebar}
        className="rounded-lg p-2 hover:bg-[#ECECEC]"
      >
        <Image src={SidebarIcon} alt="Toggle Sidebar" width={24} height={24} />
      </button>

      <div className="flex items-center ">
        <TemplatesDropdown setActiveItem={setActiveItem} />
        {editorOpen ? (
          <FileMinus className="ml-5" onClick={() => setEditorOpen(false)} />
        ) : (
          <FilePlus
            className="ml-5"
            onClick={() => {
              if (!activeUserDocument) {
                onNewChat();
              }
              setEditorOpen(true);
            }}
          />
        )}
        <MessageSquarePlusIcon
          onClick={() => {
            onNewChat();
            if (!isSidebarOpen) {
              toggleSidebar();
            }
          }}
          className="ml-5"
        />
      </div>
    </header>
  );
};

export default HomeHeader;
