import * as React from 'react';
import Link from 'next/link';
import { useDocument } from '@/providers/document-provider';
import { useUserDataContext } from '@/providers/user-data-context-provider';
import { MenuItem } from '@/types';
import { toast } from 'sonner';

import { Button } from '@/components/plate-ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  useOpenState,
} from '@/components/plate-ui/dropdown-menu';

interface TemplatesDropdownProps {
  setActiveItem?: (id: MenuItem, documentOnlyRefresh: boolean) => void;
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
      const currActiveDoc = activeUserDocument;
      currActiveDoc['document'] = template['template'];
      if (setActiveItem) {
        setActiveItem(currActiveDoc, true);
      }
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
        className="flex max-h-[500px] min-w-0 flex-col gap-0.5 overflow-y-auto"
        align="start"
      >
        <p>Docgpt provided templates</p>
        {providedTemplates?.map((templ, idx) => {
          return (
            <div
              key={'provided-templates-' + templ['templateName'] + idx}
              className="flex flex-row items-center space-y-1 p-2"
            >
              <p className="w-64 ">{templ['templateName']}</p>
              <Button onClick={handleSelect(templ)}>Apply</Button>
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
        <p>User defined templates</p>
        {userTemplates?.map((templ, idx) => {
          return (
            <div
              key={'user-templates-' + templ['templateName'] + idx}
              className="flex flex-row items-center space-y-1 p-2"
            >
              <p className="w-64">{templ['templateName']}</p>
              <Button onClick={handleSelect(templ)}>Apply</Button>
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
        <Button>
          <Link href={`/templates/create`} target="_blank">
            Create New Template
          </Link>
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
