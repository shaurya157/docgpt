import Image from 'next/image';
import { SquarePen } from 'lucide-react';

import SidebarIcon from '../assets/icons/sidebar.svg';

interface HeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  onNewChat: () => void;
  setActiveItem: (item, documentRefreshOnly) => void;
  editorOpen: boolean;
  activeUserDocument: {};
  setEditorOpen: (open: boolean) => void;
}

const HomeHeader = ({
  editorOpen,
  isSidebarOpen,
  toggleSidebar,
  setEditorOpen,
  onNewChat,
}: HeaderProps) => {
  const toggleEditor = () => {
    if (editorOpen) {
      setEditorOpen(false);
    } else {
      setEditorOpen(true);
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-4">
      <button
        onClick={toggleSidebar}
        className="rounded-lg p-2 hover:bg-[#ECECEC]"
      >
        <Image src={SidebarIcon} alt="Toggle Sidebar" width={24} height={24} />
      </button>

      <div className="flex items-center ">
        <label className="me-5 inline-flex cursor-pointer items-center">
          <span className="mr-3 ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
            Document mode
          </span>
          <input
            type="checkbox"
            value=""
            className="peer sr-only"
            checked={editorOpen}
            onChange={toggleEditor}
          />
          <div className="peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-0.5 after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-black peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:peer-checked:bg-black dark:peer-focus:ring-red-800 rtl:peer-checked:after:-translate-x-full"></div>
        </label>

        <SquarePen
          onClick={() => {
            onNewChat();
          }}
          className="mr-3 cursor-pointer"
        />
      </div>
    </header>
  );
};

export default HomeHeader;
