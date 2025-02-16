'use client';

import * as React from 'react';
import { useState } from 'react';

import {useEditorRef} from "@udecode/plate/react";
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
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

export function SaveButton() {
  const editor = useEditorRef();
  const { data: session } = useSession();
  const params = useParams();
  const openState = useOpenState();
  const { activeTemplate, activeUserDocument } = useDocument();
  const [templateName, setTemplateName] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleSaveDocument = async (event: React.FormEvent) => {
    event.preventDefault();
    const docName = documentName
      ? documentName
      : activeUserDocument!['documentName'];

    console.log(editor.children);
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
      : activeTemplate!['templateName'];
    const res = await saveUserTemplate(
      session!.user!.email!,
      templName,
      editor.children,
      activeTemplate!['templateOwnerId'] == session!.user!.email!,
      activeTemplate!['id']
    );
    if (res.error) {
      toast.error(res.error.message);
    } else {
      toast.success('Template saved successfully');
    }
  };

  // TODO: Need to change this based on url, not just the slug
  if (params.slug) {
    return (
      <DropdownMenu modal={false} {...openState}>
        <DropdownMenuTrigger asChild>
          <Button type="submit">Save Template</Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="flex max-h-[500px] min-w-0 flex-col gap-0.5 overflow-y-auto"
          align="start"
        >
          <form className="space-y-4" onSubmit={handleSaveTemplate}>
            <Input
              className="pr-10"
              required={true}
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder={
                activeTemplate ? activeTemplate['templateName'] : templateName
              }
            ></Input>
            <Button type="submit">Save Template</Button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  } else {
    return (
      <DropdownMenu modal={false} {...openState}>
        <DropdownMenuTrigger asChild>
          <Button type="submit">Save</Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="flex max-h-[500px] min-w-0 flex-col gap-0.5 overflow-y-auto"
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

            <Button className="w-full" type="submit">
              Save
            </Button>
            <div
              className={showSuccessMessage ? 'w-full text-center' : 'hidden'}
            >
              Successfully saved!
            </div>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
}
