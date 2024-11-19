"use client"

import {Button} from "@/components/plate-ui/button";
import {useMyEditorRef} from "@/lib/plate/plate-types";
import {useMyEditor} from "@/components/plate-editor";
import {saveCurrentDocumentState} from "@/firebase/firestore-dao";
import {useSession} from "next-auth/react";
import {toast} from "sonner";
import {TEditor} from "@udecode/plate-common";

function desctructureDocument(editor: TEditor) {
  const result = [];
  editor.children.forEach((child) => {
    let tempObj = {
      id: "",
      type: "",
      children: []
    }
    tempObj.id = child.id as string
    tempObj.type = child.type as string
    child.children.forEach(subChild => {
      tempObj.children.push(subChild)
    })
    result.push(tempObj)
  })

  return result
}

export function SaveButton() {
  const editor = useMyEditorRef();
  const {data: session} = useSession();

  const handleSave = async (event) => {
    event.preventDefault();
    const destructuredDoc = desctructureDocument(editor)
    console.log("destructuredDoc", destructuredDoc)
    const res = await saveCurrentDocumentState(session!.user!.email!, destructuredDoc)
    if (res.error) {
      toast.error(res.error.message);
    } else {
      toast.success("Successfully Saved");
    }
  }
  return(
    <Button type="submit" onClick={handleSave}>Save</Button>
  )
}
