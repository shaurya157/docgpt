import React, { useEffect, useState } from 'react';
import { useChatSettings } from '@/providers/chat-settings-provider';

export const ChatSettings = () => {
  const { 
    selectedAssistant, 
    selectedTemplate, 
    handleSelectedAssistant, 
    handleSelectedTemplate, 
    allAssistants, 
    userTemplates 
  } = useChatSettings();

  return (
    <div className="mt-2 flex w-full items-center gap-2">
      <div className="flex-1">
        <select
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          value={selectedAssistant['name']}
          onChange={(e) => handleSelectedAssistant(e.target.value)}
        >
          {allAssistants.map((assistant) => (
            <option key={assistant.id || assistant.name} value={assistant.name}>
              {assistant.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1">
        <select
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          value={selectedTemplate['id']}
          onChange={(e) => handleSelectedTemplate(e.target.value)}
        >
          <option value="">No Template</option>
          {userTemplates?.map((template, idx) => (
            <option key={idx} value={template['id']}>
              {template['templateName']}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
