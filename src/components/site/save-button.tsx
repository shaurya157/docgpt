'use client';

import * as React from 'react';
import { useState } from 'react';

import { useEditorRef } from '@udecode/plate/react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
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
  saveCurrentDocumentState, saveUserTemplate,
} from '@/firebase/firestore-dao';
import { useDocument } from '@/providers/document-provider';
import { useUserDataContext } from '@/providers/user-data-provider';

export function SaveButton() {
  const { data: session } = useSession();
  const editor = useEditorRef();
  const openState = useOpenState();
  const { activeTemplate, activeUserDocument } = useDocument();
  const [templateName, setTemplateName] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const pathName = usePathname();
  const { setUserTemplates, userTemplates } = useUserDataContext()

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
    setDocumentName("")
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    const templName = templateName ? templateName : activeTemplate!['templateName'];
    const res = await saveUserTemplate(
      session!.user!.email!,
      templName,
      editor.children,
      activeTemplate ? activeTemplate!['templateOwnerId'] === session!.user!.email! : false,
      activeTemplate ? activeTemplate!['id'] : null
    );

    if (res.error) {
      toast.error(res.error.message);
    } else {
      const filtered = userTemplates?.filter((templ) => templ["id"] != res.docId)
      const tempTemplate = {...activeTemplate!}

      if (tempTemplate!["id"] === undefined || tempTemplate!["templateOwnerId"] === "docgpt") {
        tempTemplate["id"] = res.docId
      }

      tempTemplate['templateOwnerId'] = session!.user!.email!
      tempTemplate['templateName'] = templName

      setUserTemplates([tempTemplate].concat(filtered))
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      setTemplateName("")
    }
  };

  if (pathName.includes("settings")) {
    return (
      <DropdownMenu modal={false} {...openState}>
        <DropdownMenuTrigger asChild>
          <Button variant="roundedClear" className="p-x-10 w-fit mr-4" type="submit">Save Template</Button>
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
                activeTemplate ? activeTemplate.templateName : templateName
              }
            ></Input>
            <Button variant="roundedClear" disabled={showSuccessMessage}
                    type="submit">{showSuccessMessage ? 'Saved Successfully' : 'Save Template'}</Button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  } else {
    return (
      <DropdownMenu modal={false} {...openState}>
        <DropdownMenuTrigger asChild>
          <Button variant="roundedClear" className=" w-36" type="submit">Save</Button>
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
