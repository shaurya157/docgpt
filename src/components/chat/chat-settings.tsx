import { ModelType, useChatSettings } from '@/providers/chat-settings-provider';

export const ChatSettings = () => {
  const { selectedModel, setSelectedModel } = useChatSettings();
  const models: ModelType[] = ['Open AI 4o', 'Open AI O1', 'DeepSeek R1', 'DeepSeek Chat'];

  return (
    <div className="flex items-center relative">
      <select
        className="appearance-none rounded-lg pl-3 pr-10 py-2 text-xs text-gray-400 font-regular focus:outline-none bg-transparent hover:bg-gray-100 transition-colors cursor-pointer"
        style={{ color: '#9CA3AF' }}
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value as ModelType)}
      >
        {models.map((model) => (
          <option key={model} className="text-gray-800" value={model}>
            {model}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
        </svg>
      </div>
    </div>
  );
};
