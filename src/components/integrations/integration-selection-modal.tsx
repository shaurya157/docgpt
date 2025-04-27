import React from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/plate-ui/dialog'; // Adjust import path if needed

interface IntegrationSelectionModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  serviceName: string;
  children: React.ReactNode;
}

export const IntegrationSelectionModal: React.FC<IntegrationSelectionModalProps> = ({
  isOpen,
  onOpenChange,
  serviceName,
  children,
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