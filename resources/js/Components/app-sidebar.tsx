import * as React from "react";
import {
  Home,
  Users,
  Recycle,
  SlidersVertical,
  Calendar,
  Ticket,
  Wrench,
} from "lucide-react";

import { NavMain } from "@/Components/nav-main";
import { NavRecycling } from "@/Components/nav-recycling";
import { NavSecond } from "@/Components/nav-second";
import { NavSettings } from "@/Components/nav-settings";
import { NavTools } from "@/Components/nav-tools";
import { NavUser } from "@/Components/nav-user";
import { ClientOnly, StaffOnly, Role } from '@/Components/Auth/Can';
import { useAuth } from '@/contexts/AuthContext';

import {
  Sidebar,
  SidebarGroup,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/Components/ui/sidebar";

import { usePage } from "@inertiajs/react"; // Import usePage to access Inertia props

import { type NavItem, type NavigationData } from "@/types/navigation";

// Remove the duplicate interfaces here

// Import the User type from the types file
import type { User } from "@/types";

// Remove the local User interface and update usePage usage
import { useSidebar } from "@/Components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { collapsed } = useSidebar();
  const { user } = usePage<{
    auth: {
      user: User;
    }
  }>().props.auth;

  const currentPath = window.location.pathname;

  const markActive = (items: NavItem[]): NavItem[] =>
    items.map((item) => ({
      ...item,
      isActive:
        currentPath === item.url ||
        item.items?.some((subItem) => currentPath === subItem.url),
      items: item.items ? markActive(item.items) : undefined,
    }));

  const data: NavigationData = {
    navMain: [
      {
        title: "Dashboard",
        url: "/",
        icon: Home,
      },
      {
        title: "Customers",
        url: "/customers/",
        icon: Users,
        roles: "Developer|Administrator|Employee|Manager|Director",
      },
    ],
    navRecycling: [
      {
        title: "Recycling Jobs",
        url: "",
        icon: Recycle,
        items: [
          {
            title: "Collections",
            url: "/collections/",
          },
          {
            title: "Processing",
            url: "/processing/",
          },
          {
            title: "Completed",
            url: "/completed/",
          },
        ],
      },
    ],
    navSecond: [
      {
        title: "Calendar",
        url: "/calendar/",
        icon: Calendar,
      },
      {
        title: "Support Tickets",
        url: "/support/",
        icon: Ticket,
      },
    ],
    navTools: [
      {
        title: "Tools",
        url: "",
        icon: Wrench,
        items: [
          {
            title: "IMEI Checker",
            url: "/tools/imei-checker/",
          },
        ],
      },
    ],
    navSettings: [
      {
        title: "System Settings",
        url: "",
        icon: SlidersVertical,
        items: [
//          {
//            title: "General",
//            url: "/settings/general/",
//          },
          {
            title: "Staff Accounts",
            url: "/settings/staff/",
          },
          {
            title: "Categories",
            url: "/settings/categories/",
          },
//          {
//            title: "Items",
//            url: "/settings/items/",
//          },
          {
            title: "Variables",
            url: "/settings/variables/",
          },
          {
            title: "Connections",
            url: "/settings/connections/",
          },
        ],
      },
    ],
  };

  const updatedData: NavigationData = {
    navMain: markActive(data.navMain),
    navRecycling: markActive(data.navRecycling),
    navSecond: markActive(data.navSecond),
    navTools: markActive(data.navTools),
    navSettings: markActive(data.navSettings),
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="p-2">
          <img
            src={collapsed ? "/images/logos/icon.svg" : "/images/logos/logo-colour.svg"}
            alt="ITAM logo"
            className="w-auto h-8"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <NavMain items={updatedData.navMain} />
          <Role role="Developer|Administrator|Employee|Manager|Director"><NavRecycling items={updatedData.navRecycling} /></Role>
          <Role role="Developer|Administrator|Employee|Manager|Director"><NavSecond items={updatedData.navSecond} /></Role>
          <Role role="Developer|Administrator|Employee|Manager|Director"><NavTools items={updatedData.navTools} /></Role>
          <Role role="Developer|Administrator|"><NavSettings items={updatedData.navSettings} /></Role>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
