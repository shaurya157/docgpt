"use client"

import {Button} from "@/components/plate-ui/button";
import {useMyEditorRef} from "@/lib/plate/plate-types";
import {saveCurrentDocumentState, saveUserTemplate} from "@/firebase/firestore-dao";
import {useSession} from "next-auth/react";
import {toast} from "sonner";
import {useParams} from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  useOpenState
} from "@/components/plate-ui/dropdown-menu";
import * as React from "react";
import {Input} from "@/components/plate-ui/input";
import {useState} from "react";
import {useUserDataContext} from "@/providers/UserDataContextProvider";

export function SaveButton() {
  const editor = useMyEditorRef();
  const {data: session} = useSession();
  const params = useParams();
  const openState = useOpenState();
  const [ templateName, setTemplateName ] = useState("");
  const [ documentName, setDocumentName ] = useState("");
  const { threadId } = useUserDataContext()

  const handleSaveDocument = async (event: React.FormEvent) => {
    event.preventDefault();
    const res = await saveCurrentDocumentState(session!.user!.email!, documentName, threadId!, editor.children )
    console.log(editor.children)
    if (res.error) {
      toast.error(res.error.message);
    } else {
      toast.success("Successfully Saved");
    }
  }

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await saveUserTemplate(session!.user!.email!, templateName, editor.children)
    console.log(editor.children)
    if (res.error) {
      toast.error(res.error.message);
    } else {
      toast.success("Template saved successfully");
    }
  }

  // TODO: Need to changes this based on url, not just the slug
  if (params.slug) {
    return (
      <DropdownMenu modal={false} {...openState} >
        <DropdownMenuTrigger asChild>
          <Button type="submit">Save Template</Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="flex max-h-[500px] min-w-0 flex-col gap-0.5 overflow-y-auto"
          align="start"
        >
          <form className="space-y-4" onSubmit={handleSaveTemplate}>
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder={"name"}
              required={true}
              className="pr-10"></Input>
            <Button type="submit">Save Template</Button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  } else {
    return (
      <DropdownMenu modal={false} {...openState} >
        <DropdownMenuTrigger asChild>
          <Button type="submit">Save</Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="flex max-h-[500px] min-w-0 flex-col gap-0.5 overflow-y-auto"
          align="start"
        >
          <form className="space-y-4" onSubmit={handleSaveDocument}>
            <Input
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder={"Name"}
              required={true}
              className="pr-10"></Input>
            <Button type="submit">Save</Button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
}
