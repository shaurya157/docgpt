import Image from "next/image";
import { motion } from "framer-motion";

import SidebarIcon from "../assets/icons/sidebar.svg";
import ChatIcon from "../assets/icons/msg.svg";
import Chat2Icon from "../assets/icons/msg2.svg";
import DocumentIcon from "../assets/icons/paper2.svg";
import Document2Icon from "../assets/icons/paper.svg";
import EditIcon from "../assets/icons/edit.svg";

interface HeaderProps {
  activeTab: "chat" | "document";
  setActiveTab: (tab: "chat" | "document") => void;
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
    <header className="h-16 border-b flex items-center justify-between px-4 bg-white">
      <button
        onClick={toggleSidebar}
        className="p-2 hover:bg-[#ECECEC] rounded-lg"
      >
        <Image src={SidebarIcon} alt="Toggle Sidebar" width={24} height={24} />
      </button>

      <div className="flex items-center">
        <div className="border border-black/50 rounded-xl overflow-hidden flex h-10 relative">
          {/* Animated background */}
          <motion.div
            className={
              activeTab === "chat"
                ? "absolute h-full w-[120px] bg-black rounded-lg"
                : "absolute h-full w-[140px] bg-black rounded-lg"
            }
            initial={false}
            animate={{
              x: activeTab === "chat" ? 0 : 120,
            }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
          />

          <button
            onClick={() => setActiveTab("chat")}
            className="relative flex items-center justify-center space-x-1 min-w-[120px]"
          >
            <motion.div
              className="flex items-center justify-center space-x-2"
              animate={{
                color: activeTab === "chat" ? "#ffffff" : "#374151",
              }}
              transition={{ duration: 0.2 }}
            >
              <Image
                src={activeTab === "chat" ? Chat2Icon : ChatIcon}
                alt="Chat"
                width={20}
                height={20}
              />
              <span>Chat</span>
            </motion.div>
          </button>

          <button
            onClick={() => setActiveTab("document")}
            className="px-2 relative flex items-center justify-center space-x-1 min-w-[120px]"
          >
            <motion.div
              className="flex items-center justify-center space-x-2"
              animate={{
                color: activeTab === "document" ? "#ffffff" : "#374151",
              }}
              transition={{ duration: 0.2 }}
            >
              <Image
                src={activeTab === "document" ? DocumentIcon : Document2Icon}
                alt="Documents"
                width={20}
                height={20}
              />
              <span>Documents</span>
            </motion.div>
          </button>
        </div>

        <button
          className="ml-4 p-2 hover:bg-[#ECECEC] rounded-lg"
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
