import { Fragment, useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MenuItem } from "../types";
import Image from "next/image";
import Popover from "./Sidebar/Popover";
import ContextDocumentsContent from "./Sidebar/ContextDocsContent";
import { PopoverPosition } from "../types";

import FolderIcon from "../assets/icons/folder.svg";
import HelpIcon from "../assets/icons/help.svg";
import ProfileIcon from "../assets/icons/profile.svg";
import LogoutIcon from "../assets/icons/logout.svg";
import CloseIcon from "../assets/icons/x.svg";
import DeleteIcon from "../assets/icons/delete.svg";
import MoreIcon from "../assets/icons/moreHorizontal.svg";

interface SidebarProps {
  isOpen: boolean;
  items: MenuItem[];
  activeItem: string;
  setActiveItem: (id: string) => void;
  activeTab: "chat" | "document";
  onDeleteChat?: (chatId: string) => void;
}

interface PopoverState {
  isOpen: boolean;
  position: PopoverPosition;
  activeItem: string | null;
}

interface ChatMenuState {
  isOpen: boolean;
  chatId: string | null;
  position: { top: number; left: number };
  buttonRect: DOMRect | null;
}

const Sidebar = ({
  isOpen,
  items,
  activeItem,
  setActiveItem,
  activeTab,
  onDeleteChat,
}: SidebarProps) => {
  const sidebarWidth = 280;
  const popoverOffset = 12;
  const sidebarRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [chatMenu, setChatMenu] = useState<ChatMenuState>({
    isOpen: false,
    chatId: null,
    position: { top: 0, left: 0 },
    buttonRect: null,
  });

  const handleMoreClick = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (activeTab === "chat") {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const sidebarRect = sidebarRef.current?.getBoundingClientRect();

      if (sidebarRect) {
        const shouldOpenMenu = chatMenu.chatId !== chatId || !chatMenu.isOpen;

        setChatMenu({
          isOpen: shouldOpenMenu,
          chatId: shouldOpenMenu ? chatId : null,
          position: {
            top: rect.bottom + window.scrollY,
            left: rect.right - 120, // Align right edge of menu with more button
          },
          buttonRect: rect,
        });
      }
    }
  };

  const handleDeleteChat = () => {
    if (chatMenu.chatId && onDeleteChat) {
      onDeleteChat(chatMenu.chatId);
      setChatMenu({
        isOpen: false,
        chatId: null,
        position: { top: 0, left: 0 },
        buttonRect: null,
      });
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(e.target as Node) &&
      !(e.target as Element).closest('[data-more-button="true"]')
    ) {
      setChatMenu({
        isOpen: false,
        chatId: null,
        position: { top: 0, left: 0 },
        buttonRect: null,
      });
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Adjust menu position based on viewport boundaries
  useEffect(() => {
    if (chatMenu.isOpen && menuRef.current && chatMenu.buttonRect) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      let newTop = chatMenu.position.top;
      let newLeft = chatMenu.position.left;

      // Check vertical overflow
      if (menuRect.bottom > viewportHeight) {
        // Position menu above the button if there's not enough space below
        newTop = chatMenu.buttonRect.top - menuRect.height;
      }

      // Check horizontal overflow
      if (menuRect.right > viewportWidth) {
        newLeft = viewportWidth - menuRect.width - 8;
      }

      if (
        newTop !== chatMenu.position.top ||
        newLeft !== chatMenu.position.left
      ) {
        setChatMenu((prev) => ({
          ...prev,
          position: { top: newTop, left: newLeft },
        }));
      }
    }
  }, [chatMenu.isOpen]);

  // Updated animation variants for smoother transition
  const variants = {
    open: {
      x: 0,
      width: sidebarWidth,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
        mass: 1,
        duration: 0.15,
      },
    },
    closed: {
      x: -sidebarWidth,
      width: 0,
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
        mass: 1,
        duration: 0.15,
      },
    },
  };

  const preferenceItems = [
    {
      id: "context",
      title: "Context Documents",
      icon: (
        <Image
          src={FolderIcon}
          alt="Context Documents"
          width={20}
          height={20}
        />
      ),
    },
    {
      id: "help",
      title: "Help & Support",
      icon: (
        <Image src={HelpIcon} alt="Help & Support" width={21} height={21} />
      ),
    },
    {
      id: "profile",
      title: "My Profile",
      icon: <Image src={ProfileIcon} alt="Profile" width={20} height={20} />,
    },
    {
      id: "logout",
      title: "Logout",
      icon: <Image src={LogoutIcon} alt="Logout" width={20} height={20} />,
    },
  ];

  const [popover, setPopover] = useState<PopoverState>({
    isOpen: false,
    position: { top: 0, left: 0 },
    activeItem: null,
  });

  const handlePreferenceClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    itemId: string
  ) => {
    e.stopPropagation();
    const button = e.currentTarget;
    const sidebarRect = sidebarRef.current?.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const scrollTop = window.scrollY;

    if (!sidebarRect) return;

    const buttonIndex = preferenceItems.findIndex((item) => item.id === itemId);
    const totalButtons = preferenceItems.length;

    let position = {
      top: buttonRect.top + scrollTop,
      left: sidebarRect.right + popoverOffset,
    };

    const buttonsFromBottom = totalButtons - buttonIndex - 1;
    position.top -= buttonsFromBottom * 60 - 200;

    if (popover.isOpen && popover.activeItem !== itemId) {
      setPopover({
        isOpen: false,
        position: { top: 0, left: 0 },
        activeItem: null,
      });

      setTimeout(() => {
        openPopover(position, itemId, viewportHeight);
      }, 0);
    } else {
      openPopover(position, itemId, viewportHeight);
    }
  };

  const openPopover = (
    position: PopoverPosition,
    itemId: string,
    viewportHeight: number
  ) => {
    let adjustedTop = position.top;
    const estimatedHeight = itemId == "context" ? 220 : 100;

    if (adjustedTop + estimatedHeight > viewportHeight) {
      adjustedTop = Math.max(
        viewportHeight - estimatedHeight - popoverOffset,
        0
      );
    }

    if (adjustedTop < 0) {
      adjustedTop = popoverOffset;
    }

    setPopover({
      isOpen: true,
      position: {
        top: adjustedTop,
        left: position.left,
      },
      activeItem: itemId,
    });
  };

  const closePopover = () => {
    setPopover((prev) => ({ ...prev, isOpen: false, activeItem: null }));
  };

  const getPopoverContent = (itemId: string) => {
    switch (itemId) {
      case "help":
        return (
          <div className="p-4 space-y-3 min-w-[300px]">
            <div className="flex justify-between items-center gap-0.5">
              <h3 className="font-semibold text-lg">Help & Contact</h3>
              <button
                onClick={closePopover}
                className="hover:bg-[#ECECEC] p-1 rounded-lg"
              >
                <Image src={CloseIcon} alt="Close" width={21} height={21} />
              </button>
            </div>
            <a
              href="#"
              className="block text-gray-600 hover:text-gray-900 underline decoration-1 underline-offset-4"
            >
              DocGPT 60 second overview
            </a>
            <a
              href="mailto:founders@docgpt.work"
              className="block text-gray-600 hover:text-gray-900 underline decoration-1 underline-offset-4"
            >
              founders@docgpt.work
            </a>
            <a
              href="mailto:bugs@docgpt.work"
              className="block text-gray-600 hover:text-gray-900 underline decoration-1 underline-offset-4"
            >
              bugs@docgpt.work
            </a>
          </div>
        );
      case "context":
        return <ContextDocumentsContent onClose={closePopover} />;
      case "profile":
        return (
          <div className="p-4 space-y-3 min-w-[300px]">
            <div className="flex justify-between items-center gap-0.5">
              <h3 className="font-semibold text-lg">My Profile</h3>
              <button
                onClick={closePopover}
                className="hover:bg-[#ECECEC] p-1 rounded-lg"
              >
                <Image src={CloseIcon} alt="Close" width={21} height={21} />
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-gray-600">Email: user@docgpt.work</p>
            </div>
          </div>
        );
      case "logout":
        return (
          <div className="p-4 space-y-3 min-w-[300px]">
            <div className="flex justify-between items-center gap-0.5">
              <h3 className="font-semibold text-lg">Logout</h3>
              <button
                onClick={closePopover}
                className="hover:bg-[#ECECEC] p-1 rounded-lg"
              >
                <Image src={CloseIcon} alt="Close" width={21} height={21} />
              </button>
            </div>
            <p className="text-gray-600">Are you sure you want to logout?</p>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Logout
              </button>
              <button
                className="px-4 py-2 bg-[#ECECEC] rounded-lg hover:bg-[#ECECEC]"
                onClick={closePopover}
              >
                Cancel
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      <motion.div
        ref={sidebarRef}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={variants}
        className="h-[calc(100vh-64px)] border-r bg-white overflow-hidden flex flex-col absolute md:relative z-10"
        style={{
          minWidth: isOpen ? sidebarWidth : 0,
          maxWidth: sidebarWidth,
          willChange: "transform",
        }}
      >
        <div className="px-4 pt-2">
          <h2 className="font-semibold flex items-center gap-2">
            {activeTab === "chat" ? "Chats" : "Documents"}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between w-full p-1.5 rounded-md mb-1 group ${
                activeItem === item.id ? "bg-[#ECECEC]" : "hover:bg-[#ECECEC]"
              }`}
            >
              <button
                onClick={() => setActiveItem(item.id)}
                className="flex-1 text-left truncate"
              >
                <span className="block truncate">{item.title}</span>
              </button>
              {activeTab === "chat" && (
                <button
                  data-more-button="true"
                  onClick={(e) => {
                    handleMoreClick(e, item.id);
                    setActiveItem(item.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-opacity"
                >
                  <Image src={MoreIcon} alt="more" width={24} height={24} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="border-t px-3 py-2">
          <h2 className="font-semibold flex items-center px-1  py-0.5">
            Preferences
          </h2>
          <h2 className="flex items-center px-1 py-0.5">user@docgpt.work</h2>
          <div className="space-y-1">
            {preferenceItems.map((item) => (
              <button
                key={item.id}
                onClick={(e) => handlePreferenceClick(e, item.id)}
                className="w-full flex items-center gap-3 p-1.5 rounded-lg hover:bg-[#ECECEC] text-gray-700"
              >
                {item.icon}
                <span className="block truncate">{item.title}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {isOpen && chatMenu.isOpen && activeTab === "chat" && (
        <div
          ref={menuRef}
          className="fixed bg-white rounded-xl shadow-xl border border-gray-200 z-50 transform opacity-100 scale-100 transition-all duration-200 ease-out"
          style={{
            top: chatMenu.position.top,
            left: chatMenu.position.left,
            width: "150px",
          }}
        >
          <button
            onClick={handleDeleteChat}
            className="w-full px-4 py-2 text-sm rounded-xl flex items-center gap-2 text-red-600 hover:bg-gray-100 transition-colors duration-150"
          >
            <Image src={DeleteIcon} alt="delete chat" width={18} height={18} />
            Delete Chat
          </button>
        </div>
      )}

      {isOpen && (
        <Popover
          isOpen={popover.isOpen}
          onClose={closePopover}
          position={popover.position}
        >
          {popover.activeItem && getPopoverContent(popover.activeItem)}
        </Popover>
      )}
    </div>
  );
};

export default Sidebar;
