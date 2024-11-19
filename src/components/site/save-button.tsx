"use client"

import {Button} from "@/components/plate-ui/button";
import {useMyEditorRef} from "@/lib/plate/plate-types";
import {useMyEditor} from "@/components/plate-editor";
import {saveCurrentDocumentState} from "@/firebase/firestore-dao";
import {useSession} from "next-auth/react";

export function SaveButton() {
  const editor = useMyEditorRef();
  const {data: session} = useSession();

  const handleSave = (event)=>  {
    event.preventDefault();
    saveCurrentDocumentState(session!.user!.email!, editor["children"])
  }
  return(
    <Button type="submit" onClick={handleSave}>Save</Button>
  )
}
