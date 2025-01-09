import Image from 'next/image';

import EditIcon from '../assets/icons/edit.svg';
import SidebarIcon from '../assets/icons/sidebar.svg';

interface HeaderProps {
  activeTab: 'chat' | 'document';
  setActiveTab: (tab: 'chat' | 'document') => void;
  toggleSidebar: () => void;
  onNewChat: () => void;
}

const Header = ({
  activeTab,
  setActiveTab,
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

      <div className="flex items-center">
        {/*<div className="relative flex h-10 overflow-hidden rounded-xl border border-black/50">*/}
        {/*  /!* Animated background *!/*/}
        {/*  <motion.div*/}
        {/*    className={*/}
        {/*      activeTab === 'chat'*/}
        {/*        ? 'absolute h-full w-[120px] rounded-lg bg-black'*/}
        {/*        : 'absolute h-full w-[140px] rounded-lg bg-black'*/}
        {/*    }*/}
        {/*    initial={false}*/}
        {/*    animate={{*/}
        {/*      x: activeTab === 'chat' ? 0 : 120,*/}
        {/*    }}*/}
        {/*    transition={{*/}
        {/*      duration: 0.3,*/}
        {/*      ease: 'easeInOut',*/}
        {/*    }}*/}
        {/*  />*/}

        {/*  <button*/}
        {/*    onClick={() => setActiveTab('chat')}*/}
        {/*    className="relative flex min-w-[120px] items-center justify-center space-x-1"*/}
        {/*  >*/}
        {/*    <motion.div*/}
        {/*      className="flex items-center justify-center space-x-2"*/}
        {/*      animate={{*/}
        {/*        color: activeTab === 'chat' ? '#ffffff' : '#374151',*/}
        {/*      }}*/}
        {/*      transition={{ duration: 0.2 }}*/}
        {/*    >*/}
        {/*      <Image*/}
        {/*        src={activeTab === 'chat' ? Chat2Icon : ChatIcon}*/}
        {/*        alt="Chat"*/}
        {/*        width={20}*/}
        {/*        height={20}*/}
        {/*      />*/}
        {/*      <span>Chat</span>*/}
        {/*    </motion.div>*/}
        {/*  </button>*/}

        {/*  <button*/}
        {/*    onClick={() => setActiveTab('document')}*/}
        {/*    className="relative flex min-w-[120px] items-center justify-center space-x-1 px-2"*/}
        {/*  >*/}
        {/*    <motion.div*/}
        {/*      className="flex items-center justify-center space-x-2"*/}
        {/*      animate={{*/}
        {/*        color: activeTab === 'document' ? '#ffffff' : '#374151',*/}
        {/*      }}*/}
        {/*      transition={{ duration: 0.2 }}*/}
        {/*    >*/}
        {/*      <Image*/}
        {/*        src={activeTab === 'document' ? DocumentIcon : Document2Icon}*/}
        {/*        alt="Documents"*/}
        {/*        width={20}*/}
        {/*        height={20}*/}
        {/*      />*/}
        {/*      <span>Documents</span>*/}
        {/*    </motion.div>*/}
        {/*  </button>*/}
        {/*</div>*/}

        <button
          className="ml-4 rounded-lg p-2 hover:bg-[#ECECEC]"
          onClick={onNewChat}
          title="Create new chat"
        >
          <Image src={EditIcon} alt="New Chat" width={24} height={24} />
        </button>
      </div>
    </header>
  );
};

export default Header;
