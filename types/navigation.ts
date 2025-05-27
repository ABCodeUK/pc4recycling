export interface NavItem {
  title: string;
  url: string;
  icon?: any;
  items?: NavItem[];
  isActive?: boolean;
  hidden?: boolean;
}