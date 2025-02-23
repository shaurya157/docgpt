'use client';

import * as React from 'react';
import { useState } from 'react';

import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import { Button } from '@/components/plate-ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  useOpenState,
} from '@/components/plate-ui/dropdown-menu';
import { Input } from '@/components/plate-ui/input';
import {
  saveCurrentDocumentState,
  saveUserTemplate,
} from '@/firebase/firestore-dao';
import { useDocument } from '@/providers/document-provider';

interface SaveButtonProps{
  editor: any;
  purpose: "document" | "template";
  template?: any;
}

export function SaveButton({ editor, purpose, template }: SaveButtonProps) {
  const { data: session } = useSession();
  const openState = useOpenState();
  const { activeUserDocument } = useDocument();
  const [templateName, setTemplateName] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleSaveDocument = async (event: React.FormEvent) => {
    event.preventDefault();
    const docName = documentName
      ? documentName
      : activeUserDocument!['documentName'];

    const res = await saveCurrentDocumentState(
      session!.user!.email!,
      docName,
      activeUserDocument!['threadId'],
      activeUserDocument!['vectorStoreId'],
      editor.children,
      activeUserDocument!['id']
    );

    if (res.error) {
      toast.error(res.error.message);
    } else {
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
    }
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    const templName = templateName
      ? templateName
      : template!['templateName'];
    const res = await saveUserTemplate(
      session!.user!.email!,
      templName,
      editor.children,
      template!['templateOwnerId'] == session!.user!.email!,
      template!['id']
    );
    if (res.error) {
      toast.error(res.error.message);
    } else {
      toast.success('Template saved successfully');
    }
  };

  if (purpose === "template") {
    return (
      <DropdownMenu modal={false} {...openState}>
        <DropdownMenuTrigger asChild>
          <Button variant="roundedClear" className="fixed right-4 bottom-4 z-50" type="submit">Save Template</Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="p-4 flex max-h-[500px] min-w-0 flex-col gap-0.5 overflow-y-auto"
          align="start"
        >
          <form className="space-y-4" onSubmit={handleSaveTemplate}>
            <Input
              className="pr-10"
              required={true}
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder={
                template ? template['templateName'] : templateName
              }
            ></Input>
            <Button variant="roundedClear" type="submit">Save Template</Button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  } else {
    return (
      <DropdownMenu modal={false} {...openState}>
        <DropdownMenuTrigger asChild>
          <Button variant="roundedClear" className="fixed right-4 bottom-4 z-50 w-36" type="submit">Save</Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="p-4 flex max-h-[500px] min-w-0 flex-col gap-0.5 overflow-y-auto"
          align="start"
        >
          <form className="space-y-4" onSubmit={handleSaveDocument}>
            <Input
              className="pr-10"
              required={true}
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder={
                activeUserDocument
                  ? activeUserDocument['documentName']
                  : documentName
              }
            ></Input>

            <Button className="w-full" disabled={showSuccessMessage} type="submit">
              {showSuccessMessage ? "Saved successfully" : "Save"}
            </Button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
}
