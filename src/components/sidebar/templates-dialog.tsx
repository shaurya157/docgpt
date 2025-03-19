
import { useEffect } from 'react';
import * as React from 'react';

import { DialogTitle } from '@radix-ui/react-dialog';

import { PlateEditor } from '@/components/editor/plate-editor';
import { useCreateEditor } from '@/components/editor/use-create-editor';
import {
  Dialog,
  DialogContent, DialogHeader,
} from '@/components/plate-ui/dialog';

interface TemplatesDialogProps {
  displayedTemplate: any;
  open: boolean;
  setOpen:  React.Dispatch<React.SetStateAction<boolean>>;
}

export const TemplatesDialog = ({
  displayedTemplate,
  open,
  setOpen
}: TemplatesDialogProps) => {
  const editor = useCreateEditor(displayedTemplate["template"])

  useEffect(() => {
    editor.tf.setValue(displayedTemplate["template"])
  }, [displayedTemplate, editor.tf]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="editor-dialog" aria-description="Template editor">
          <DialogHeader className="flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold mr-2">{displayedTemplate['templateName']}</DialogTitle>
              <p className="text-xs w-2xs text-red-500">(Note: Tables are not supported yet in templates. Please remove all tables from the editor.)</p>
            </div>
          </DialogHeader>
          <PlateEditor plateEditor={editor}/>
        </DialogContent>
    </Dialog>
  )
}