import React from 'react';
import { X } from 'lucide-react'; // Using lucide-react for the close icon
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@radix-ui/react-tooltip'; // Import Tooltip components

import { useCustomContext } from '@/providers/custom-context-provider';
import { Button } from '@/components/plate-ui/button'; // Assuming Button component is available

export const CustomContextDisplay = () => {
  const { customContexts, removeCustomContext } = useCustomContext();

  // If there are no contexts, don't render anything
  if (customContexts.length === 0) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-gray-200 bg-gray-50">
        {customContexts.map((context) => (
          <div
            key={context.id}
            className="flex items-center gap-1.5 rounded-md bg-blue-100 text-blue-800 text-xs px-2 py-1"
          >
            {/* Display context type icon or prefix if needed in the future */}
            {/* <span className="font-medium">{context.type}:</span> */}
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="truncate max-w-[150px] cursor-default"> {/* Added cursor-default */}
                  {context.content}
                </span>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                sideOffset={4}
                className="z-50 max-w-xs overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
              >
                <p className="whitespace-pre-wrap break-words">{context.content}</p> {/* Ensure wrapping */}
              </TooltipContent>
            </Tooltip>
            <Button
              variant="ghost"
              size="xs" // Assuming an extra small size is available or can be added
              className="p-0 h-4 w-4 text-blue-600 hover:bg-blue-200 hover:text-blue-800 flex-shrink-0" // Added flex-shrink-0
              onClick={() => removeCustomContext(context.id)}
              aria-label={`Remove context: ${context.content}`}
            >
              <X size={12} />
            </Button>
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
};