import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { deleteDocument } from '@/firebase/firestore-dao';
import { MenuItem, PopoverPosition } from '@/types';
import { motion } from 'framer-motion';
import { signOut, useSession } from 'next-auth/react';
import { toast } from 'sonner';

import DeleteIcon from '../assets/icons/delete.svg';
import FolderIcon from '../assets/icons/folder.svg';
import HelpIcon from '../assets/icons/help.svg';
import LogoutIcon from '../assets/icons/logout.svg';
import MoreIcon from '../assets/icons/moreHorizontal.svg';
import ProfileIcon from '../assets/icons/profile.svg';
import CloseIcon from '../assets/icons/x.svg';
import ContextDocumentsContent from './Sidebar/ContextDocsContent';
import Popover from './Sidebar/Popover';

interface SidebarProps {
  isOpen: boolean;
  items: MenuItem[] | undefined | null;
  activeItem: string | {};
  setActiveItem: (id: MenuItem, documentRefreshOnly: boolean) => void;
  activeTab: 'chat' | 'document';
  onDeleteChat?: (chatId: string) => void;
  toggleSidebar: () => void;
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
  toggleSidebar,
}: SidebarProps) => {
  const sidebarWidth = 280;
  const popoverOffset = 12;
  const sidebarRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  const [chatMenu, setChatMenu] = useState<ChatMenuState>({
    isOpen: false,
    chatId: null,
    position: { top: 0, left: 0 },
    buttonRect: null,
  });

  const handleMoreClick = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (activeTab === 'chat') {
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

  const handleDeleteChat = async (e: React.MouseEvent) => {
    if (chatMenu.chatId && onDeleteChat) {
      onDeleteChat(chatMenu.chatId);

      const res = await deleteDocument(chatMenu.chatId);
      if (res.error) {
        toast.error(`Error deleting document. Error: ${res.error}`);
      } else {
        toast.success(`Success deleting document!`);
      }

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
        type: 'spring',
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
        type: 'spring',
        stiffness: 400,
        damping: 40,
        mass: 1,
        duration: 0.15,
      },
    },
  };

  const preferenceItems = [
    {
      id: 'context',
      title: 'Context Documents',
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
      id: 'help',
      title: 'Help & Support',
      icon: (
        <Image src={HelpIcon} alt="Help & Support" width={21} height={21} />
      ),
    },
    {
      id: 'profile',
      title: 'My Profile',
      icon: <Image src={ProfileIcon} alt="Profile" width={20} height={20} />,
    },
    {
      id: 'logout',
      title: 'Logout',
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
      case 'help':
        return (
          <div className="min-w-[300px] space-y-3 p-4">
            <div className="flex items-center justify-between gap-0.5">
              <h3 className="text-lg font-semibold">Help & Contact</h3>
              <button
                onClick={closePopover}
                className="rounded-lg p-1 hover:bg-[#ECECEC]"
              >
                <Image src={CloseIcon} alt="Close" width={21} height={21} />
              </button>
            </div>
            <a
              href="#"
              className="block text-gray-600 underline decoration-1 underline-offset-4 hover:text-gray-900"
            >
              DocGPT 60 second overview
            </a>
            <a
              href="mailto:founders@docgpt.work"
              className="block text-gray-600 underline decoration-1 underline-offset-4 hover:text-gray-900"
            >
              founders@docgpt.work
            </a>
            <a
              href="mailto:bugs@docgpt.work"
              className="block text-gray-600 underline decoration-1 underline-offset-4 hover:text-gray-900"
            >
              bugs@docgpt.work
            </a>
          </div>
        );
      case 'context':
        return <ContextDocumentsContent onClose={closePopover} />;
      case 'profile':
        return (
          <div className="min-w-[300px] space-y-3 p-4">
            <div className="flex items-center justify-between gap-0.5">
              <h3 className="text-lg font-semibold">My Profile</h3>
              <button
                onClick={closePopover}
                className="rounded-lg p-1 hover:bg-[#ECECEC]"
              >
                <Image src={CloseIcon} alt="Close" width={21} height={21} />
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-gray-600">Email: {session?.user?.email}</p>
            </div>
          </div>
        );
      case 'logout':
        return (
          <div className="min-w-[300px] space-y-3 p-4">
            <div className="flex items-center justify-between gap-0.5">
              <h3 className="text-lg font-semibold">Logout</h3>
              <button
                onClick={closePopover}
                className="rounded-lg p-1 hover:bg-[#ECECEC]"
              >
                <Image src={CloseIcon} alt="Close" width={21} height={21} />
              </button>
            </div>
            <p className="text-gray-600">Are you sure you want to logout?</p>
            <div className="flex space-x-3">
              <button
                onClick={handleLogOut}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
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
      default:
        return null;
    }
  };

  return (
    <div className="absolute z-50">
      <motion.div
        ref={sidebarRef}
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        variants={variants}
        className="absolute z-10 flex h-[calc(100vh-64px)] flex-col overflow-hidden border-r bg-white md:relative"
        style={{
          minWidth: isOpen ? sidebarWidth : 0,
          maxWidth: sidebarWidth,
          willChange: 'transform',
        }}
      >
        <div className="px-4 pt-2">
          <h2 className="flex items-center gap-2 font-semibold">
            {activeTab === 'chat' ? 'Chats' : 'Documents'}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          {items?.map((item) => (
            <div
              key={item.id}
              className={`group mb-1 flex w-full items-center justify-between rounded-md p-1.5 ${
                activeItem && activeItem!['id'] === item.id
                  ? 'bg-[#ECECEC]'
                  : 'hover:bg-[#ECECEC]'
              }`}
            >
              <button
                onClick={() => {
                  toggleSidebar();
                  setActiveItem(
                    item,
                    item['documentName'] === activeItem['documentName']
                  );
                }}
                className="flex-1 truncate text-left"
              >
                <span className="block truncate">{item['documentName']}</span>
              </button>
              {activeTab === 'chat' && (
                <button
                  data-more-button="true"
                  onClick={(e) => {
                    handleMoreClick(e, item.id);
                  }}
                  className="rounded-lg text-gray-400 opacity-0 transition-opacity hover:bg-gray-200 hover:text-gray-600 group-hover:opacity-100"
                >
                  <Image src={MoreIcon} alt="more" width={24} height={24} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="border-t px-3 py-2">
          <h2 className="flex items-center px-1 py-0.5  font-semibold">
            Preferences
          </h2>
          <h2 className="flex items-center px-1 py-0.5">
            {session?.user?.email}
          </h2>
          <div className="space-y-1">
            {preferenceItems.map((item) => (
              <button
                key={item.id}
                onClick={(e) => handlePreferenceClick(e, item.id)}
                className="flex w-full items-center gap-3 rounded-lg p-1.5 text-gray-700 hover:bg-[#ECECEC]"
              >
                {item.icon}
                <span className="block truncate">{item.title}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {isOpen && chatMenu.isOpen && activeTab === 'chat' && (
        <div
          ref={menuRef}
          className="fixed z-50 scale-100 rounded-xl border border-gray-200 bg-white opacity-100 shadow-xl transition-all duration-200 ease-out"
          style={{
            top: chatMenu.position.top,
            left: chatMenu.position.left,
            width: '150px',
          }}
        >
          <button
            onClick={handleDeleteChat}
            className="flex w-full items-center gap-2 rounded-xl px-4 py-2 text-sm text-red-600 transition-colors duration-150 hover:bg-gray-100"
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
