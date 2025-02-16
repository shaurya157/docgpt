'use client';

import { useEffect, useRef, useState } from 'react';

import { PopoverPosition } from '@/types';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  title: React.ReactNode;
}

const ToolTip = ({ children, content, title }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<PopoverPosition>({
    left: 0,
    top: 0,
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
        left: rect.left - (tooltipRect?.width ?? 0) / 2 + rect.width / 2,
        top: rect.bottom + scrollTop + 8,
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
          className="fixed z-50 max-w-[280px] rounded-lg bg-black p-3 text-sm text-white shadow-lg"
          style={{
            left: position.left,
            top: position.top,
          }}
        >
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold">{title}</span>
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolTip;
