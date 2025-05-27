import { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon?: any;
  isActive?: boolean;
  items?: NavItem[];
  roles?: string; // Add this line
}

export interface NavigationData {
  navMain: NavItem[];
  navClient: NavItem[]; 
  navStaff: NavItem[];  // Add this line
  navRecycling: NavItem[];
  navSecond: NavItem[];
  navTools: NavItem[];
  navSettings: NavItem[];
}

export interface NavProps {
  items: NavItem[];
}