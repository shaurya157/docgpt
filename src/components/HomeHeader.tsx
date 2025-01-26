import Image from 'next/image';

import { TemplatesDropdown } from '@/components/site/templates-dropdown';

import EditIcon from '../assets/icons/edit.svg';
import SidebarIcon from '../assets/icons/sidebar.svg';

interface HeaderProps {
  activeTab: 'chat' | 'document';
  setActiveTab: (tab: 'chat' | 'document') => void;
  toggleSidebar: () => void;
  onNewChat: () => void;
  setActiveItem: (item, documentRefreshOnly) => void;
}

const HomeHeader = ({
  activeTab,
  setActiveTab,
  toggleSidebar,
  onNewChat,
  setActiveItem,
}: HeaderProps) => {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-4">
      <button
        onClick={toggleSidebar}
        className="rounded-lg p-2 hover:bg-[#ECECEC]"
      >
        <Image src={SidebarIcon} alt="Toggle Sidebar" width={24} height={24} />
      </button>

      <div className="flex items-center">
        <TemplatesDropdown setActiveItem={setActiveItem} />
        <button
          className="ml-4 rounded-lg p-2 hover:bg-[#ECECEC]"
          onClick={() => {
            onNewChat();
            toggleSidebar();
          }}
          title="Create new chat"
        >
          <Image src={EditIcon} alt="New Chat" width={24} height={24} />
        </button>
      </div>
    </header>
  );
};

export default HomeHeader;
