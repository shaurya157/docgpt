import { useAssistantDefinitions } from '@/providers/AssistantsProvider';
import { useChatSettings } from '@/providers/ChatSettingsProvider';
import { useDocument } from '@/providers/DocumentProvider';
import { useUserDataContext } from '@/providers/UserDataProvider';

import { Button } from '@/components/plate-ui/button';

// These have to be the same as the ones in the database, i.e. docgptProvidedAssistantDefinitions
const chatSettingsHotLinks = [
  {
    assistantName: 'Default',
    templateName: 'No Template',
    displayName: 'Default',
    templateId: '',
  },
  {
    assistantName: 'Default PRD Assistant',
    templateName: 'Default PRD Template',
    displayName: 'Write a PRD',
    templateId: 'default',
  },
  {
    assistantName: 'Default Email Assistant',
    templateName: 'Default Email Template',
    displayName: 'Write a launch email',
    templateId: 'RBJLtWdpk6G0nqY8Eivg',
  },
];

export const ChatSettingsHelper = () => {
  const { docgptProvidedAssistantDefinitions } = useAssistantDefinitions();
  const { providedTemplates } = useDocument();
  const { userTemplates } = useUserDataContext();
  const {
    selectedAssistant,
    selectedTemplate,
    handleSelectedAssistant,
    handleSelectedTemplate,
  } = useChatSettings();

  const handleQuickLinkClick = (hotLink: {}) => {
    return () => {
      handleSelectedAssistant(hotLink['assistantName']);
      handleSelectedTemplate(hotLink['templateId']);
    };
  };

  const handleAssistantChange = (e) => {
    handleSelectedAssistant(e.target.value);
  };

  const handleTemplateChange = (e) => {
    handleSelectedTemplate(e.target.value);
  };

  console.log(selectedTemplate);
  return (
    <section className="flex h-1/3 w-full flex-col">
      <h1 className="mb-4 font-bold leading-none tracking-tight text-gray-900 dark:text-white md:text-5xl">
        What can I help with?
      </h1>
      <div className="mb-8 flex flex-col">
        <div>
          {chatSettingsHotLinks.map((hotlink) => {
            return (
              <Button
                key={hotlink['displayName']}
                className="m-2"
                onClick={handleQuickLinkClick(hotlink)}
              >
                {hotlink['displayName']}
              </Button>
            );
          })}
        </div>
      </div>
      <h2 className="mb-4 font-bold leading-none tracking-tight text-gray-900 dark:text-white md:text-4xl">
        Chat Settings
      </h2>
      <div className="flex">
        <div className="m-2">
          <span>Assistant</span>
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
          <span>Template</span>
          <select
            value={selectedTemplate['id']}
            onChange={handleTemplateChange}
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          >
            {providedTemplates?.concat(userTemplates).map((template) => {
              return (
                <option key={template['templateName']} value={template['id']}>
                  {template['templateName']}
                </option>
              );
            })}
            <option value="">No Template</option>
          </select>
        </div>
      </div>
    </section>
  );
};
