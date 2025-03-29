'use client';

import { createPlatePlugin } from '@udecode/plate/react';

import { FixedToolbar } from '@/components/plate-ui/fixed-toolbar';
import { FixedToolbarButtons } from '@/components/plate-ui/fixed-toolbar-buttons';

export const FixedToolbarPlugin = createPlatePlugin({
  key: 'fixed-toolbar',
  render: {
    beforeEditable: () => (
      <div className="fixed top-12 left-0 w-full z-50">
        <FixedToolbar>
          <FixedToolbarButtons />
        </FixedToolbar>
      </div>
      
    ),
  },
});
