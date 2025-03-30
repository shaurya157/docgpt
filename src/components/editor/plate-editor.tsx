'use client';

import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import {Plate} from '@udecode/plate/react';

import { Editor, EditorContainer } from '@/components/plate-ui/editor';

interface PlateEditorProps {
    plateEditor: any;
}

export function PlateEditor({ plateEditor }: PlateEditorProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <Plate editor={plateEditor}>
        <EditorContainer className='mt-12'>
          <Editor variant="demo" />
        </EditorContainer>
      </Plate>
    </DndProvider>
  );
}
