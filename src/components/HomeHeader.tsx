import Image from 'next/image';
import { SquarePen } from 'lucide-react';

import SidebarIcon from '../assets/icons/sidebar.svg';

interface HeaderProps {
  activeTab: 'chat' | 'document';
  setActiveTab: (tab: 'chat' | 'document') => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  onNewChat: () => void;
  setActiveItem: (item, documentRefreshOnly) => void;
  editorOpen: boolean;
  activeUserDocument: {};
}

const HomeHeader = ({
  editorOpen,
  isSidebarOpen,
  toggleSidebar,
  onNewChat,
}: HeaderProps) => {
  return (
    <header className="flex h-16 items-center border-b bg-white px-4">
      <button
        onClick={toggleSidebar}
        className="rounded-lg p-2 hover:bg-[#ECECEC]"
      >
        <Image src={SidebarIcon} alt="Toggle Sidebar" width={24} height={24} />
      </button>

      <div className="flex items-center ">
        <SquarePen
          onClick={() => {
            onNewChat();
            if (!isSidebarOpen) {
              toggleSidebar();
            }
          }}
          className="mr-3 cursor-pointer"
        />
      </div>
    </header>
  );
};

export default HomeHeader;
