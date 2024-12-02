"use client"
import {Button} from "@/components/plate-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  useOpenState
} from "@/components/plate-ui/dropdown-menu";
import * as React from "react";
import Link from "next/link";

export function UserGuideButton() {
  const openState = useOpenState();
  return(
    <DropdownMenu modal={false} {...openState} >
      <DropdownMenuTrigger asChild>
        <Button>User guides</Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="flex max-h-[500px] min-w-0 flex-col gap-0.5 overflow-y-auto"
        align="start"
      >
        <Link href={"https://youtube.com"}>
          <Button>Youtube</Button>
        </Link>
        <Link href={"https://google.com"}>
          <Button>Google</Button>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
