'use client';

import React, { useEffect, useState } from 'react';

import { createPlatePlugin } from '@udecode/plate/react';

import { FixedToolbar } from '@/components/plate-ui/fixed-toolbar';
import { FixedToolbarButtons } from '@/components/plate-ui/fixed-toolbar-buttons';

// Define mobile breakpoint
const MOBILE_BREAKPOINT = 768;

// Helper component to contain the mobile detection logic
const ConditionalFixedToolbar = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Check window width directly
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    checkMobile(); // Initial check
    window.addEventListener('resize', checkMobile);
    // Cleanup listener
    return () => window.removeEventListener('resize', checkMobile);
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

  // Conditionally render the toolbar based on the detected state
  if (isMobile) {
    return null; // Don't render toolbar on mobile
  }

  return (
    <FixedToolbar>
      <FixedToolbarButtons />
    </FixedToolbar>
  );
};

export const FixedToolbarPlugin = createPlatePlugin({
  key: 'fixed-toolbar',
  render: {
    // Use the helper component for rendering
    beforeEditable: () => <ConditionalFixedToolbar />,
  },
});
