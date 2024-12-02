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
import {toast} from "sonner";
import Link from "next/link";

export function TemplatesDropdown() {
  const openState = useOpenState();
  const { userTemplates } = useUserDataContext()
  const { providedTemplates, setActiveTemplate } = useDocument()

  const handleSelect = (template) => {
    return () => {
      setActiveTemplate?.(template)
      toast.info(`Using ${template["templateName"]} to generate docs.`)
    }
  }
  return(
    <DropdownMenu modal={false} {...openState} >
      <DropdownMenuTrigger asChild>
        <Button>Templates</Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="flex max-h-[500px] min-w-0 flex-col gap-0.5 overflow-y-auto"
        align="start"
      >
        <p>Docgpt provided templates</p>
        {
          providedTemplates?.map((templ, idx) => {
            return <div key={"provided-templates-" + templ["templateName"] + idx}>
              {templ["templateName"]}
              <Button onClick={handleSelect(templ)}>Use Template</Button>
              <Button>
                <Link href={`/templates/${templ["templateName"]}`} target="_blank">View Template</Link>
              </Button>
            </div>
          })
        }
        <p>User defined templates</p>
        {
          userTemplates?.map((templ, idx) => {
            return <div key={"user-templates-" + templ["templateName"] + idx}>
              {templ["templateName"]}
              <Button onClick={handleSelect(templ)}>Use Template</Button>
              <Button>
                <Link href={`/templates/${templ["templateName"]}`} target="_blank">View Template</Link>
              </Button>
            </div>
          })
        }
        <Button>
          <Link href={`/templates/create`} target="_blank">Create New Template</Link></Button>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
