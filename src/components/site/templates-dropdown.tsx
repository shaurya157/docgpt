import * as React from 'react';
import Link from 'next/link';
import { useDocument } from '@/providers/document-provider';
import { useUserDataContext } from '@/providers/user-data-context-provider';
import { toast } from 'sonner';

import { Button } from '@/components/plate-ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  useOpenState,
} from '@/components/plate-ui/dropdown-menu';

interface TemplatesDropdownProps {
  setActiveItem: (item, documentRefreshOnly) => void;
}

export function TemplatesDropdown({ setActiveItem }: TemplatesDropdownProps) {
  const openState = useOpenState();
  const { userTemplates } = useUserDataContext();
  const {
    providedTemplates,
    setActiveTemplate,
    activeUserDocument,
    setActiveUserDocument,
  } = useDocument();

  const handleSelect = (template) => {
    return () => {
      const currActiveDoc = { ...activeUserDocument };
      currActiveDoc['document'] = template['template'];
      setActiveItem(currActiveDoc, true);
      // if (setActiveItem) {
      //   setActiveItem(currActiveDoc, true);
      // }
      // setActiveTemplate?.(template);
      toast.info(`Using ${template['templateName']} to generate docs.`);
    };
  };
  return (
    <DropdownMenu modal={false} {...openState}>
      <DropdownMenuTrigger asChild>
        <Button>Templates</Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="flex max-h-[500px] min-w-0 flex-col gap-0.5 overflow-y-auto p-6"
        align="start"
      >
        <b>DocGPT Provided Templates</b>
        <div className="h-32 rounded-md border border-gray-300 border-opacity-25">
          {providedTemplates?.map((templ, idx) => {
            return (
              <div
                key={'provided-templates-' + templ['templateName'] + idx}
                className=" flex flex-row items-center space-y-1 p-2 hover:bg-gray-300"
              >
                <p className="w-64 ">{templ['templateName']}</p>
                <Button onClick={handleSelect(templ)} className="mr-1">
                  Apply
                </Button>
                <Button variant="default">
                  <Link
                    href={`/templates/${templ['templateName']}`}
                    target="_blank"
                  >
                    Preview
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>

        <b>Your Templates</b>
        <div className="h-32 overflow-y-scroll rounded-md border border-gray-300 border-opacity-25">
          {userTemplates?.map((templ, idx) => {
            return (
              <div
                key={'user-templates-' + templ['templateName'] + idx}
                className="flex flex-row items-center space-y-1 p-2 hover:bg-gray-300"
              >
                <p className="w-64">{templ['templateName']}</p>
                <Button onClick={handleSelect(templ)} className="mr-1">
                  Apply
                </Button>
                <Button>
                  <Link
                    href={`/templates/${templ['templateName']}`}
                    target="_blank"
                  >
                    Preview
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>

        <Button>
          <Link href={`/templates/create`} target="_blank">
            Create New Template
          </Link>
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
