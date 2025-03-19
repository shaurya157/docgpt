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
  template: any[];
  templateName: string;
  templateOwnerId: string;
  id: string;
}

export interface Message {
  content: string;
  id: string;
  role: 'user' | 'assistant';
  fileNames: string[];
}

export interface Document {
  document: any[];
  documentName: string;
  documentOwnerId: string;
  id: string;
  chatId: string;
}
