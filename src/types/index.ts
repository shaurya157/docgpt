export interface Chat {
  id: string;
  chatName: string;
  documentIds: string[];
  files: File[];
  messages: Message[];
  userId: string;
}

export interface Document {
  id: string;
  chatId: string;
  document: any[];
  documentName: string;
  documentOwnerId: string;
}

export interface File {
  fileIds: string[];
  fileName: string;
}

export interface Message {
  id: string;
  content: string;
  fileNames: string[];
  role: 'assistant' | 'user';
  reasoning?: string;
}

export interface NavItem {
  title: string;
  disabled?: boolean;
  external?: boolean;
  href?: string;
}

export interface PopoverPosition {
  left: number;
  top: number;
}

export interface StreamingState {
  document: {
    content: string;
    isStreaming: boolean;
  };
  isProcessingDocument: boolean;
  isProcessingEdit: boolean; // Add flag for edit processing
  message: Message;
  reasoning: string;
}

export interface Template {
  id: string;
  template: any[];
  templateName: string;
  templateOwnerId: string;
}
