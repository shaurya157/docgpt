'use client';

import { createPlatePlugin } from '@udecode/plate/react';

import { FloatingToolbar } from '@/components/plate-ui/floating-toolbar';
import { FloatingToolbarButtons } from '@/components/plate-ui/floating-toolbar-buttons';

export const FloatingToolbarPlugin = createPlatePlugin({
  key: 'floating-toolbar',
  render: {
    afterEditable: () => (
      <div className='fixed top-18 left-0 w-full z-50'>
        <FloatingToolbar>
          <FloatingToolbarButtons />
        </FloatingToolbar>
      </div>
    ),
  },
});
