'use client';

import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { Editor, EditorContainer } from '@/components/plate-ui/editor';

export function PlateEditor() {
  return (
    <DndProvider backend={HTML5Backend}>
      <EditorContainer>
        <Editor variant="demo" />
      </EditorContainer>
    </DndProvider>
  );
}
