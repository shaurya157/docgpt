import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Define the shape of a single custom context item
interface CustomContextItem {
  id: string; // Unique identifier for each context item
  type: string; // Type of context (e.g., 'text', 'file', 'embedding') - 'string' for now
  content: string; // The actual context content
  // Add other relevant properties as needed, e.g., source, metadata
}

// Define the context value shape
interface CustomContextValue {
  customContexts: CustomContextItem[];
  addCustomContext: (content: string, type?: string) => void;
  removeCustomContext: (id: string) => void;
  clearCustomContexts: () => void;
}

// Create the context
const CustomContext = createContext<CustomContextValue | undefined>(undefined);

interface CustomContextProviderProps {
  children: ReactNode;
}

// Generate a simple unique ID (replace with a more robust solution if needed)
const generateId = () => `ctx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

export const CustomContextProvider = ({ children }: CustomContextProviderProps) => {
  const [customContexts, setCustomContexts] = useState<CustomContextItem[]>([]);

  const addCustomContext = useCallback((content: string, type: string = 'string') => {
    const newItem: CustomContextItem = {
      id: generateId(),
      type,
      content,
    };
    setCustomContexts(prevContexts => [...prevContexts, newItem]);
  }, []);

  const removeCustomContext = useCallback((id: string) => {
    setCustomContexts(prevContexts => prevContexts.filter(context => context.id !== id));
  }, []);

  const clearCustomContexts = useCallback(() => {
    setCustomContexts([]);
  }, []);

  const value = {
    customContexts,
    addCustomContext,
    removeCustomContext,
    clearCustomContexts,
  };

  return <CustomContext.Provider value={value}>{children}</CustomContext.Provider>;
};

// Custom hook to use the context
export const useCustomContext = () => {
  const context = useContext(CustomContext);
  if (context === undefined) {
    throw new Error('useCustomContext must be used within a CustomContextProvider');
  }
  return context;
};