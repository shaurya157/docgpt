import Image from 'next/image';
import { FileMinus, FilePlus, MessageSquarePlusIcon } from 'lucide-react';

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
        {editorOpen ? (
          <FileMinus
            className="ml-5 cursor-pointer"
            onClick={() => setEditorOpen(false)}
          />
        ) : (
          <FilePlus
            className="ml-5  cursor-pointer"
            onClick={() => {
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
          className="ml-5 cursor-pointer"
        />
      </div>
    </header>
  );
};

export default HomeHeader;
