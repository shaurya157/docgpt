"use client"
import {Button} from "@/components/plate-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  useOpenState
} from "@/components/plate-ui/dropdown-menu";
import * as React from "react";
import {useUserDataContext} from "@/providers/UserDataContextProvider";
import {useDocument} from "@/providers/document-provider";

export function DocumentsDropdown() {
  const openState = useOpenState();
  const { userOwnedDocuments } = useUserDataContext();
  const { setActiveUserDocument } = useDocument()

  const setDoc = (doc) => {
    return () => {
      setActiveUserDocument(doc)
    }
  }
  return(
    <DropdownMenu modal={false} {...openState} >
      <DropdownMenuTrigger asChild>
        <Button>Documents</Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="flex max-h-[500px] min-w-0 flex-col gap-0.5 overflow-y-auto"
        align="start"
      >
        {
          userOwnedDocuments?.map((doc, idx) => {
            return <div key={`documentId-${doc}-${idx}`}>
              {doc["documentName"]}
              <Button onClick={setDoc(doc)}>Use doc</Button>
            </div>
          })
        }
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
