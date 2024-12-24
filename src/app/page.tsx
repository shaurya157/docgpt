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

  const onboardingSteps = [
    {
      content: "Your chats with DocGPT will show here",
      position: { bottom: "73.5%", left: "20.5%" },
    },
    {
      title: "Get more relevant responses",
      content:
        "Upload files here that you would use to onboard a new team member. DocGPT will search these files for context when answering questions for you.",
      position: { bottom: "9.5%", left: "20.5%" },
    },
    {
      title: "Tell us what you want DocGPT to do",
      content:
        "Submit a feature request or report a bug. We will reply within 12 hours.",
      position: { bottom: "6.5%", left: "20.5%" },
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

  const items = activeTab === "chat" ? chatItems : documentItems;

  return (
    <div className="h-screen flex flex-col">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          isOpen={isSidebarOpen}
          items={items}
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          activeTab={activeTab}
        />
        <Content items={items} activeItem={activeItem} />
        <OnboardingTooltip
          steps={onboardingSteps}
          onComplete={() => console.log("Onboarding completed")}
          isSidebarOpen={isSidebarOpen}
        />
      </div>
    </div>
  );
}
