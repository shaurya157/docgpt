import React from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/plate-ui/dialog'; // Adjust import path if needed

interface IntegrationSelectionModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  serviceName: string;
  onOpenChange: (isOpen: boolean) => void;
}

export const IntegrationSelectionModal: React.FC<IntegrationSelectionModalProps> = ({
  children,
  isOpen,
  serviceName,
  onOpenChange,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]"> {/* Adjust width as needed */}
        <DialogHeader>
          <DialogTitle>Attach from {serviceName}</DialogTitle>
          <DialogDescription>
            Select items from {serviceName} to add them as context to your chat.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">{children}</div>
        {/* Footer actions can be added here or handled within children */}
      </DialogContent>
    </Dialog>
  );
}; 