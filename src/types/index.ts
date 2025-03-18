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
  template: [];
  templateName: string;
  templateOwnerId: string;
}

export interface Message {
  content: string;
  id: string;
  role: 'user' | 'assistant';
  fileNames: string[];
}
