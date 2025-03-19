import { createContext, useContext, useEffect, useState } from 'react';

export type ModelType = 'Open AI 4o' | 'Open AI O1' | 'DeepSeek reasoner';

interface ChatSettingsContextType {
  selectedModel: ModelType;
  setSelectedModel: (model: ModelType) => void;
}

const ChatSettingsContext = createContext<ChatSettingsContextType | undefined>(undefined);

export function ChatSettingsProvider({ children }: { children: React.ReactNode }) {
  const [selectedModel, setSelectedModel] = useState<ModelType>('Open AI 4o');

  useEffect(() => {
    const savedModel = localStorage.getItem('model') as ModelType;
    if (savedModel) {
      setSelectedModel(savedModel);
    }
  }, []);

  const handleModelChange = (model: ModelType) => {
    setSelectedModel(model);
    localStorage.setItem('model', model);
  };

  return (
    <ChatSettingsContext.Provider value={{ selectedModel, setSelectedModel: handleModelChange }}>
      {children}
    </ChatSettingsContext.Provider>
  );
}

export const useChatSettings = () => {
  const context = useContext(ChatSettingsContext);
  if (!context) {
    throw new Error('useChatSettings must be used within a ChatSettingsProvider');
  }
  return context;
};
