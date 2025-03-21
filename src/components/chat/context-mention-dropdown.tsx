import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { ContextMentionOption } from '@/types';
import UploadIcon from '../../assets/icons/attachment.svg';
import SlackIcon from '../../assets/icons/arrowUp.svg'; // Placeholder, replace with actual icon

interface ContextMentionDropdownProps {
  isOpen: boolean;
  options: ContextMentionOption[];
  activeIndex: number;
  onSelect: (option: ContextMentionOption) => void;
  onClose: () => void;
}

const getIconForType = (type: string) => {
  switch (type) {
    case 'upload':
      return UploadIcon;
    case 'slack':
      return SlackIcon;
    // Add more icon mappings as needed
    default:
      return UploadIcon;
  }
};

export const ContextMentionDropdown: React.FC<ContextMentionDropdownProps> = ({
  isOpen,
  options,
  activeIndex,
  onSelect,
  onClose,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || options.length === 0) {
    return null;
  }

  return (
    <div 
      ref={dropdownRef}
      className="absolute bottom-full mb-2 w-full max-w-md rounded-lg border border-gray-200 bg-white shadow-lg z-10"
    >
      <div className="py-1">
        <div className="px-3 py-2 text-xs font-semibold text-gray-500">
          Add Context
        </div>
        <div className="max-h-60 overflow-y-auto">
          {options.map((option, index) => (
            <div
              key={option.id}
              className={`flex cursor-pointer items-center px-3 py-2 ${
                index === activeIndex ? 'bg-gray-100' : ''
              }`}
              onClick={() => onSelect(option)}
              onMouseEnter={() => {/* Could update active index on hover */}}
            >
              <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                <Image 
                  src={getIconForType(option.type)} 
                  alt={option.label} 
                  width={16} 
                  height={16} 
                />
              </div>
              <div>
                <div className="font-medium">{option.label}</div>
                {option.type === 'upload' && (
                  <div className="text-xs text-gray-500">
                    Upload a file to add context
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 