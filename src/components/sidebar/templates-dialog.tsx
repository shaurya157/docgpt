
import { useEffect } from 'react';

import { DialogTitle } from '@radix-ui/react-dialog';

import { PlateEditor } from '@/components/editor/plate-editor';
import { useCreateEditor } from '@/components/editor/use-create-editor';
import {
  Dialog,
  DialogContent, DialogHeader,
} from '@/components/plate-ui/dialog';
import { SaveButton } from '@/components/site/save-button';

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
            <DialogTitle className="text-xl font-semibold mr-2">{displayedTemplate["templateName"]}</DialogTitle>
            <SaveButton editor={editor} purpose="template" template={displayedTemplate}/>
          </DialogHeader>
            <PlateEditor plateEditor={editor}/>
        </DialogContent>
    </Dialog>
  )
}