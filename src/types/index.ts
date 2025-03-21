export interface Document {
  id: string;
  chatId: string;
  document: any[];
  documentName: string;
  documentOwnerId: string;
}

export interface Message {
  id: string;
  content: string;
  fileNames: string[];
  role: 'user' | 'assistant';
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

export interface Template {
  id: string;
  template: any[];
  templateName: string;
  templateOwnerId: string;
}

export interface File {
  fileIds: string[];
  fileName: string;
}

export interface Chat {
  id: string;
  messages: Message[];
  userId: string;
  chatName: string;
  documentIds: string[];
  files: File[];
}
