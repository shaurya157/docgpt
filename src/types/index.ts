export interface NavItem {
  title: string;
  href?: string;
  disabled?: boolean;
  external?: boolean;
}

export interface MenuItem {
  id: string;
  title: string;
  icon?: string;
  content: string;
}

export interface PopoverPosition {
  top: number;
  left: number;
}
