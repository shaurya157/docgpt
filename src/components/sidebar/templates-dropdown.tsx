import * as React from 'react';
import { useState } from 'react';

import { FileIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/plate-ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  useOpenState,
} from '@/components/plate-ui/dropdown-menu';
import { TemplatesDialog } from '@/components/sidebar/templates-dialog';
import { useUserDataContext } from '@/providers/user-data-provider';

interface TemplatesDropdownProps {
  changeEditorContent: (content: any[]) => void;
}

export function TemplatesDropdown({ changeEditorContent }: TemplatesDropdownProps) {
  const openState = useOpenState();
  const [ openDialog, setOpenDialog ] = useState(false);
  const { userTemplates } = useUserDataContext();
  const router = useRouter();

  const newTemplate = {
    template: [
      {
        id: '1',
        children: [
          {
            text: '',
          },
        ],
        type: 'h1',
      },
    ],
    templateName: "New Template"
  }
  const [ displayedTemplate, setDisplayedTemplate ] = useState(newTemplate)

  const handleApply = (template) => {
    return () => {
      changeEditorContent(template['template'])
    };
  };

  return (
    <DropdownMenu modal={false} {...openState}>
      <DropdownMenuTrigger asChild>
        <button className="cursor-pointer flex w-full items-center gap-3 rounded-lg p-1.5 text-gray-700 hover:bg-[#ECECEC]">
          <FileIcon size={20} />
          Templates
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent
        className="group flex max-h-[500px] min-w-0 flex-col gap-0.5 overflow-y-auto p-6"
        align="start"
      >
        <TemplatesDialog open={openDialog} displayedTemplate={displayedTemplate} setOpen={setOpenDialog}/>
        <div className="mb-2 flex items-center justify-between">
          <b className="mr-2">Your Templates</b>
          <Button variant="roundedClear" onClick={() => router.push("/settings")}>
            Create New Template
          </Button>
        </div>
        <div className="no-scrollbar h-64 p-2 overflow-y-scroll rounded-md border border-gray-300 border-opacity-25">
          {userTemplates?.map((templ, idx) => {
            return (
              <div
                key={idx}
                className=" group/item flex flex-row items-center space-y-1 p-2 hover:bg-gray-300"
              >
                <p className="w-64">{templ['templateName']}</p>

                <Button variant="roundedClear" className="mr-1" onClick={handleApply(templ)}>
                  Apply
                </Button>
              </div>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
