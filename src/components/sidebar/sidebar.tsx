import { useEffect, useRef, useState } from 'react';

import { motion } from 'framer-motion';
import {SettingsIcon} from "lucide-react";
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import {useRouter} from "next/navigation";
import { toast } from 'sonner';

import Popover from "@/components/sidebar/popover";
import { TemplatesDropdown } from '@/components/sidebar/templates-dropdown';
import { MenuItem, PopoverPosition } from '@/types';

import FolderIcon from '../../assets/icons/folder.svg';
import HelpIcon from '../../assets/icons/help.svg';
import LogoutIcon from '../../assets/icons/logout.svg';
import ProfileIcon from '../../assets/icons/profile.svg';
import CloseIcon from '../../assets/icons/x.svg';
import ContextDocsContent from './context-docs-content';
import {ChatSidebarItems} from "@/components/chat/chat-sidebar-items";
import {SettingsSidebarItems} from "@/components/settings/SettingsSidebarItems";

interface ChatMenuState {
  buttonRect: DOMRect | null;
  chatId: string | null;
  isOpen: boolean;
  position: { left: number; top: number; };
}

interface PopoverState {
  activeItem: string | null;
  isOpen: boolean;
  position: PopoverPosition;
}

interface SidebarProps {
  activeTab: 'chat' | 'settings';
  activeUserDocument?: {} | string;
  editorOpen: boolean
  isOpen: boolean;
  items: MenuItem[] | null | undefined;
  onDeleteChat: (chatId: string) => void;
  setActiveItem: (id: MenuItem, documentRefreshOnly: boolean) => void;
  toggleSidebar: () => void;
}

const Sidebar = ({
  activeTab,
  activeUserDocument,
  editorOpen,
  isOpen,
  items,
  setActiveItem,
  onDeleteChat
}: SidebarProps) => {
  const sidebarWidth = 220;
  const popoverOffset = 12;
  const sidebarRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const router = useRouter();

  const [chatMenu, setChatMenu] = useState<ChatMenuState>({
    buttonRect: null,
    chatId: null,
    isOpen: false,
    position: { left: 0, top: 0 },
  });

  const handleClickOutside = (e: MouseEvent) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(e.target as Node) &&
      !(e.target as Element).closest('[data-more-button="true"]')
    ) {
      setChatMenu({
        buttonRect: null,
        chatId: null,
        isOpen: false,
        position: { left: 0, top: 0 },
      });
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
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
          position: { left: newLeft, top: newTop },
        }));
      }
    }
  }, [chatMenu.isOpen]);

  // Updated animation variants for smoother transition
  const variants = {
    closed: {
      opacity: 0,
      transition: {
        damping: 40,
        duration: 0.15,
        mass: 1,
        stiffness: 400,
        type: 'spring',
      },
      width: 0,
      x: -sidebarWidth,
    },
    open: {
      opacity: 1,
      transition: {
        damping: 40,
        duration: 0.15,
        mass: 1,
        stiffness: 400,
        type: 'spring',
      },
      width: sidebarWidth,
      x: 0,
    },
  };

  const preferenceItems = [
    {
      id: 'context',
      icon: (
        <Image
          alt="Context Documents"
          height={20}
          src={FolderIcon}
          width={20}
        />
      ),
      title: 'Context Documents',
    },
    {
      id: 'help',
      icon: (
        <Image alt="Help & Support" height={21} src={HelpIcon} width={21} />
      ),
      title: 'Help & Support',
    },
    {
      id: 'settings',
      icon: (
        <SettingsIcon />
      ),
      title: 'Settings',
    },
    {
      id: 'profile',
      icon: <Image alt="Profile" height={20} src={ProfileIcon} width={20} />,
      title: 'My Profile',
    },
    {
      id: 'logout',
      icon: <Image className="cursor-pointer" alt="Logout" height={20} src={LogoutIcon} width={20} />,
      title: 'Logout',
    },
  ];

  const [popover, setPopover] = useState<PopoverState>({
    activeItem: null,
    isOpen: false,
    position: { left: 0, top: 0 },
  });

  const handlePreferenceClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    itemId: string
  ) => {
    if (itemId === "settings") {
      router.push(`/settings`);
    }
    e.stopPropagation();
    const button = e.currentTarget;
    const sidebarRect = sidebarRef.current?.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const scrollTop = window.scrollY;

    if (!sidebarRect) return;

    const buttonIndex = preferenceItems.findIndex((item) => item.id === itemId);
    const totalButtons = preferenceItems.length;

    const position = {
      left: sidebarRect.right + popoverOffset,
      top: buttonRect.top + scrollTop,
    };

    const buttonsFromBottom = totalButtons - buttonIndex - 1;
    position.top -= buttonsFromBottom * 60 - 200;

    if (popover.isOpen && popover.activeItem !== itemId) {
      setPopover({
        activeItem: null,
        isOpen: false,
        position: { left: 0, top: 0 },
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
    const estimatedHeight = itemId == 'context' ? 220 : 100;

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
      activeItem: itemId,
      isOpen: true,
      position: {
        left: position.left,
        top: adjustedTop,
      },
    });
  };

  const closePopover = () => {
    setPopover((prev) => ({ ...prev, activeItem: null, isOpen: false }));
  };

  const handleLogOut = () => {
    signOut().then(
      () => {
        toast.success("You've been logged out successfully");
      },
      (error) => {
        toast.error(`Error logging out: ${error.message || error.toString()}`);
      }
    );
  };

  const getPopoverContent = (itemId: string) => {
    switch (itemId) {
      case 'context':
        return <ContextDocsContent onClose={closePopover} />;
      case 'help':
        return (
          <div className="min-w-[300px] space-y-3 p-4">
            <div className="flex items-center justify-between gap-0.5">
              <h3 className="text-lg font-semibold">Help & Contact</h3>
              <button
                className="rounded-lg p-1 hover:bg-[#ECECEC]"
                onClick={closePopover}
              >
                <Image alt="Close" height={21} src={CloseIcon} width={21} />
              </button>
            </div>
            <a
              className="block text-gray-600 underline decoration-1 underline-offset-4 hover:text-gray-900"
              href="#"
            >
              DocGPT 60 second overview
            </a>
            <a
              className="block text-gray-600 underline decoration-1 underline-offset-4 hover:text-gray-900"
              href="mailto:hello@docgpt.work"
            >
              hello@docgpt.work
            </a>
          </div>
        );
      case 'logout':
        return (
          <div className="min-w-[300px] space-y-3 p-4">
            <div className="flex items-center justify-between gap-0.5">
              <h3 className="text-lg font-semibold">Logout</h3>
              <button
                className="rounded-lg p-1 hover:bg-[#ECECEC]"
                onClick={closePopover}
              >
                <Image alt="Close" height={21} src={CloseIcon} width={21} />
              </button>
            </div>
            <p className="text-gray-600">Are you sure you want to logout?</p>
            <div className="flex space-x-3">
              <button
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                onClick={handleLogOut}
              >
                Logout
              </button>
              <button
                className="rounded-lg bg-[#ECECEC] px-4 py-2 hover:bg-[#ECECEC]"
                onClick={closePopover}
              >
                Cancel
              </button>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="min-w-[300px] space-y-3 p-4">
            <div className="flex items-center justify-between gap-0.5">
              <h3 className="text-lg font-semibold">My Profile</h3>
              <button
                className="rounded-lg p-1 hover:bg-[#ECECEC]"
                onClick={closePopover}
              >
                <Image alt="Close" height={21} src={CloseIcon} width={21} />
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-gray-600">Email: {session?.user?.email}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };


  return (
    <div className={editorOpen ? "" : "absolute inset-y-0 left-0"}>
      <motion.div
        ref={sidebarRef}
        className="flex h-[calc(100vh-64px)] flex-col overflow-hidden border-r bg-white md:relative"
        style={{
          maxWidth: sidebarWidth,
          minWidth: isOpen ? sidebarWidth : 0,
          willChange: 'transform',
        }}
        animate={isOpen ? 'open' : 'closed'}
        initial="open"
        variants={variants}
      >
        <div className="px-4 pt-2">
          <h2 className="flex items-center gap-2 font-semibold">
            {activeTab === 'chat' ? 'Chats' : 'Settings'}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          {
            activeTab === "chat" ? <ChatSidebarItems
                onDeleteChat={onDeleteChat}
                activeUserDocument={activeUserDocument}
                items={items}
                setActiveItem={setActiveItem}
            /> : <SettingsSidebarItems />
          }
        </div>

        <div className="border-t px-3 py-2">
          <div className="space-y-1">
            <TemplatesDropdown setActiveItem={setActiveItem} />
            {preferenceItems.map((item) => (
              <button
                key={item.id}
                className="cursor-pointer flex w-full items-center gap-3 rounded-lg p-1.5 text-gray-700 hover:bg-[#ECECEC]"
                onClick={(e) => handlePreferenceClick(e, item.id)}
              >
                {item.icon}
                <span className="block truncate">{item.title}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {isOpen && (
        <Popover
          onClose={closePopover}
          isOpen={popover.isOpen}
          position={popover.position}
        >
          {popover.activeItem && getPopoverContent(popover.activeItem)}
        </Popover>
      )}
    </div>
  );
};

export default Sidebar;
