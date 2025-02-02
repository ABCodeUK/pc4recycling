import { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  items?: NavItem[];
  isActive?: boolean;
}

export interface NavigationData {
  navMain: NavItem[];
  navRecycling: NavItem[];
  navSecond: NavItem[];
  navTools: NavItem[];
  navSettings: NavItem[];
}

export interface NavProps {
  items: NavItem[];
}