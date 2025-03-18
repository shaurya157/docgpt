import { HomeIcon, SquarePen } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import SidebarIcon from '../../assets/icons/sidebar.svg';

interface HeaderProps {
  onNewChat: () => void;
  toggleSidebar: () => void;
}

const HomeHeader = ({
  toggleSidebar,
  onNewChat,
}: HeaderProps) => {
  const router = useRouter();

  return (
    <header className="flex h-16 items-center border-b bg-white px-4">
      <button
        className="rounded-lg p-2 hover:bg-[#ECECEC]"
        onClick={toggleSidebar}
      >
        <Image className="cursor-pointer" alt="Toggle Sidebar" height={24} src={SidebarIcon} width={24} />
      </button>
      <div className="flex items-center ">
        <button className="rounded-lg p-2 hover:bg-[#ECECEC] cursor-pointer" onClick={() => { router.push("/home") }}>
          <HomeIcon/>
        </button>
        <button className="rounded-lg p-2 hover:bg-[#ECECEC] cursor-pointer" onClick={() => { onNewChat() }}>
          <SquarePen />
        </button>
      </div>
    </header>
  );
};

export default HomeHeader;
