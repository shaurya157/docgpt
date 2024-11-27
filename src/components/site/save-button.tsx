"use client"

import {Button} from "@/components/plate-ui/button";
import {useMyEditorRef} from "@/lib/plate/plate-types";
import {useMyEditor} from "@/components/plate-editor";
import {saveCurrentDocumentState, saveUserTemplate} from "@/firebase/firestore-dao";
import {useSession} from "next-auth/react";
import {toast} from "sonner";
import {TEditor} from "@udecode/plate-common";
import {useParams} from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  useOpenState
} from "@/components/plate-ui/dropdown-menu";
import {TemplateItems} from "@/components/site/template-items";
import * as React from "react";
import {Input} from "@/components/plate-ui/input";
import {useState} from "react";

export function SaveButton() {
  const editor = useMyEditorRef();
  const {data: session} = useSession();
  const params = useParams();
  const openState = useOpenState();
  const [ templateName, setTemplateName ] = useState("");

  const handleSave = async (event) => {
    event.preventDefault();
    console.log("Editor children: ", editor.children)
    const res = await saveCurrentDocumentState(session!.user!.email!, editor.children)
    if (res.error) {
      toast.error(res.error.message);
    } else {
      toast.success("Successfully Saved");
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await saveUserTemplate(session!.user!.email!, templateName, editor.children)
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
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder={"Add a name for the template"}
              className="pr-10"></Input>
            <Button type="submit">Save Template</Button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  } else {
    return (
      <Button type="submit" onClick={handleSave}>Save</Button>
    )
  }
}
