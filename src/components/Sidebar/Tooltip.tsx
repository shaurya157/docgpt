"use client";

import { useState, useRef, useEffect } from "react";
import { PopoverPosition } from "@/types";

interface TooltipProps {
  title: React.ReactNode;
  content: React.ReactNode;
  children: React.ReactNode;
}

const Tooltip = ({ title, content, children }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<PopoverPosition>({
    top: 0,
    left: 0,
  });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current?.getBoundingClientRect();
      const scrollTop = window.scrollY;

      // Position tooltip below the trigger
      setPosition({
        top: rect.bottom + scrollTop + 8,
        left: rect.left - (tooltipRect?.width ?? 0) / 2 + rect.width / 2,
      });
    }
  }, [isVisible]);

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 bg-black text-white p-3 rounded-lg shadow-lg text-sm max-w-[280px]"
          style={{
            top: position.top,
            left: position.left,
          }}
        >
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-sm">{title}</span>
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
