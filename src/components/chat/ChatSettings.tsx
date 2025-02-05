import * as React from 'react';
import { useAssistantDefinitions } from '@/providers/AssistantsProvider';
import { useChatSettings } from '@/providers/ChatSettingsProvider';
import { useDocument } from '@/providers/DocumentProvider';
import { useUserDataContext } from '@/providers/UserDataProvider';
import { Settings } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  useOpenState,
} from '@/components/plate-ui/dropdown-menu';

export const ChatSettings = () => {
  const { docgptProvidedAssistantDefinitions } = useAssistantDefinitions();
  const { providedTemplates } = useDocument();
  const { userTemplates } = useUserDataContext();
  const openState = useOpenState(true);
  const {
    selectedAssistant,
    selectedTemplate,
    handleSelectedAssistant,
    handleSelectedTemplate,
  } = useChatSettings();

  const handleAssistantChange = (e) => {
    handleSelectedAssistant(e.target.value);
  };

  const handleTemplateChange = (e) => {
    handleSelectedTemplate(e.target.value);
  };

  return (
    <DropdownMenu modal={false} {...openState}>
      <DropdownMenuTrigger asChild>
        <button className="rounded-lg p-2 hover:bg-gray-200">
          <Settings />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <section className="flex h-1/3 w-full flex-col p-5">
          <h2 className="mb-4 font-bold leading-none tracking-tight text-gray-900 dark:text-white md:text-xl">
            Chat Settings
          </h2>
          <div className="flex flex-col">
            <div className="m-2">
              <span className="mb-5 text-gray-500">Assistant</span>
              <select
                value={selectedAssistant['name']}
                onChange={handleAssistantChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              >
                {docgptProvidedAssistantDefinitions.map((definition) => {
                  return (
                    <option key={definition['name']} value={definition['name']}>
                      {definition['name']}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="m-2">
              <span className="text-gray-500">Template</span>
              <select
                value={selectedTemplate['id']}
                onChange={handleTemplateChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              >
                {providedTemplates?.concat(userTemplates).map((template) => {
                  return (
                    <option
                      key={template['templateName']}
                      value={template['id']}
                    >
                      {template['templateName']}
                    </option>
                  );
                })}
                <option value="">No Template</option>
              </select>
            </div>
          </div>
        </section>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
