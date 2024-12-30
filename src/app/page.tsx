"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Content from "@/components/Content";
import OnboardingTooltip from "@/components/OnboardingTooltip";
import { chatItems, documentItems } from "@/content/menuItems";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"chat" | "document">("chat");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("");
  const [items, setItems] = useState({
    chat: chatItems,
    document: documentItems,
  });

  const handleNewChat = () => {
    const highestChatNum = items.chat.reduce((max, chat) => {
      const chatNum = parseInt(chat.id.replace("chat", ""));
      return chatNum > max ? chatNum : max;
    }, 0);

    const newChatId = `chat${highestChatNum + 1}`;
    const newChat = {
      id: newChatId,
      title: `Chat ${highestChatNum + 1}`,
      content: `Chat ${highestChatNum + 1} content goes here`,
    };

    setItems((prev) => ({
      ...prev,
      chat: [...prev.chat, newChat],
    }));

    setActiveItem(newChatId);
    setActiveTab("chat");
  };

  const handleDeleteChat = (chatId: string) => {
    setItems((prev) => ({
      ...prev,
      chat: prev.chat.filter((chat) => chat.id !== chatId),
    }));

    if (activeItem === chatId) {
      setActiveItem(items.chat[0]?.id || "");
    }
  };

  const onboardingSteps = [
    {
      content: "Your chats with DocGPT will show here",
    },
    {
      title: "Get more relevant responses",
      content:
        "Upload files here that you would use to onboard a new team member. DocGPT will search these files for context when answering questions for you.",
    },
    {
      title: "Tell us what you want DocGPT to do",
      content:
        "Submit a feature request or report a bug. We will reply within 12 hours.",
    },
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const setInitialSidebarState = () => {
        const isLargeScreen = window.matchMedia("(min-width: 1024px)").matches;
        setIsSidebarOpen(isLargeScreen);
      };

      setInitialSidebarState();

      const mediaQuery = window.matchMedia("(min-width: 1024px)");
      const handleScreenChange = (e: MediaQueryListEvent) => {
        setIsSidebarOpen(e.matches);
      };

      mediaQuery.addEventListener("change", handleScreenChange);

      return () => {
        mediaQuery.removeEventListener("change", handleScreenChange);
      };
    }
  }, []);

  const currentItems = activeTab === "chat" ? items.chat : items.document;

  return (
    <div className="h-screen flex flex-col">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onNewChat={handleNewChat}
      />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          isOpen={isSidebarOpen}
          items={currentItems}
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          activeTab={activeTab}
          onDeleteChat={handleDeleteChat}
        />
        <Content items={currentItems} activeItem={activeItem} />
        <OnboardingTooltip
          steps={onboardingSteps}
          onComplete={() => console.log("Onboarding completed")}
          isSidebarOpen={isSidebarOpen}
        />
      </div>
    </div>
  );
}
