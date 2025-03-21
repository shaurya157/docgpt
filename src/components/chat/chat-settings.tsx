import { ModelType, useChatSettings } from '@/providers/chat-settings-provider';

export const ChatSettings = () => {
  const { selectedModel, setSelectedModel } = useChatSettings();
  const models: ModelType[] = ['Open AI 4o', 'Open AI O1', 'DeepSeek R1', 'DeepSeek Chat'];

  return (
    <div className="mt-2 flex items-center justify-between px-2">
      <select
        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value as ModelType)}
      >
        {models.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>
    </div>
  );
};
