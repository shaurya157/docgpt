import { Fragment, useRef, useState } from "react";
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

interface SidebarProps {
  isOpen: boolean;
  items: MenuItem[];
  activeItem: string;
  setActiveItem: (id: string) => void;
  activeTab: "chat" | "document";
}

interface PopoverState {
  isOpen: boolean;
  position: PopoverPosition;
  activeItem: string | null;
}

const Sidebar = ({
  isOpen,
  items,
  activeItem,
  setActiveItem,
  activeTab,
}: SidebarProps) => {
  const sidebarWidth = 280;
  const popoverOffset = 12;
  const sidebarRef = useRef<HTMLDivElement>(null);

  const variants = {
    open: {
      x: 0,
      width: sidebarWidth,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
        duration: 0.2,
      },
    },
    closed: {
      x: -sidebarWidth,
      width: 0,
      opacity: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
        duration: 0.2,
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

    // Get the button's vertical position relative to its container
    const buttonIndex = preferenceItems.findIndex((item) => item.id === itemId);
    const totalButtons = preferenceItems.length;

    // Calculate base position
    let position = {
      top: buttonRect.top + scrollTop,
      left: sidebarRect.right + popoverOffset,
    };

    // if (itemId !== "context") {
    // Calculate how far from the bottom of the preferences section this button is
    const buttonsFromBottom = totalButtons - buttonIndex - 1;
    // Move the popover up based on position from bottom
    // The higher the button is in the list, the more we move the popover up
    position.top -= buttonsFromBottom * 60 - 200;
    // }

    // Close current popover if clicking a different item
    if (popover.isOpen && popover.activeItem !== itemId) {
      setPopover({
        isOpen: false,
        position: { top: 0, left: 0 },
        activeItem: null,
      });

      // Use setTimeout to ensure smooth transition between popovers
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
    const estimatedHeight = itemId == "context" ? 220 : 100; // Different height for context popover

    // Ensure popover stays within viewport
    if (adjustedTop + estimatedHeight > viewportHeight) {
      adjustedTop = Math.max(
        viewportHeight - estimatedHeight - popoverOffset,
        0
      );
    }

    // Ensure popover doesn't go above viewport
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
    <Fragment>
      <motion.div
        ref={sidebarRef}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={variants}
        className="h-[calc(100vh-64px)] border-r bg-white overflow-hidden flex flex-col absolute md:relative z-10"
        style={{
          minWidth: isOpen ? sidebarWidth : 0,
          maxWidth: sidebarWidth,
        }}
      >
        <div className="px-4 pt-2">
          <h2 className="font-semibold flex items-center gap-2">
            {activeTab === "chat" ? "Chats" : "Documents"}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveItem(item.id)}
              className={`w-full text-left p-1.5 rounded-md mb-1 ${
                activeItem === item.id ? "bg-[#ECECEC]" : "hover:bg-[#ECECEC]"
              }`}
            >
              <span className="block truncate">{item.title}</span>
            </button>
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

      <Popover
        isOpen={popover.isOpen}
        onClose={closePopover}
        position={popover.position}
      >
        {popover.activeItem && getPopoverContent(popover.activeItem)}
      </Popover>
    </Fragment>
  );
};

export default Sidebar;
