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
