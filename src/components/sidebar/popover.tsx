'use client';

import { useEffect, useRef, useState } from 'react';

import { PopoverPosition } from '@/types';

interface PopoverProps {
  children: React.ReactNode;
  isOpen: boolean;
  position: PopoverPosition;
  onClose: () => void;
  offset?: number;
  placement?: 'bottom' | 'left' | 'right' | 'top';
}

const Popover = ({
  children,
  isOpen,
  offset = 12,
  placement = 'right',
  position,
  onClose,
}: PopoverProps) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen && popoverRef.current) {
      document.addEventListener('mousedown', handleClickOutside);

      const popoverRect = popoverRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const scrollTop = window.scrollY;

      const newPosition = { ...position };

      // Calculate base positions for different placements
      switch (placement) {
        case 'bottom':
          newPosition.top = position.top + offset;
          newPosition.left = position.left - popoverRect.width / 2;
          break;
        case 'left':
          newPosition.left = position.left - popoverRect.width - offset;
          newPosition.top = position.top - popoverRect.height / 2;
          break;
        case 'right':
          newPosition.left = position.left + offset;
          // Center vertically
          newPosition.top = position.top - popoverRect.height / 2;
          break;
        case 'top':
          newPosition.top = position.top - popoverRect.height - offset;
          newPosition.left = position.left - popoverRect.width / 2;
          break;
      }

      // Prevent overflow right
      if (newPosition.left + popoverRect.width > viewportWidth) {
        newPosition.left = viewportWidth - popoverRect.width - offset;
      }

      // Prevent overflow left
      if (newPosition.left < offset) {
        newPosition.left = offset;
      }

      // Prevent overflow top
      if (newPosition.top < scrollTop + offset) {
        newPosition.top = scrollTop + offset;
      }

      // Prevent overflow bottom
      if (newPosition.top + popoverRect.height > viewportHeight + scrollTop) {
        newPosition.top =
          viewportHeight + scrollTop - popoverRect.height - offset;
      }

      setAdjustedPosition(newPosition);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, position, placement, offset]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 max-h-[90vh] min-w-[200px] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl"
      style={{
        left: adjustedPosition.left,
        top: adjustedPosition.top,
      }}
    >
      {children}
    </div>
  );
};

export default Popover;
