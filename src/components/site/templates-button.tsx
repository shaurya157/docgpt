"use client"
import {Button} from "@/components/plate-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  useOpenState
} from "@/components/plate-ui/dropdown-menu";
import * as React from "react";
import {TemplateItems} from "@/components/site/template-items";

export function TemplatesButton() {
  const openState = useOpenState();
  return(
    <DropdownMenu modal={false} {...openState} >
      <DropdownMenuTrigger asChild>
        <Button>Templates</Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="flex max-h-[500px] min-w-0 flex-col gap-0.5 overflow-y-auto"
        align="start"
      >
        <TemplateItems />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
