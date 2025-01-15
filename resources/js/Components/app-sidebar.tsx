import * as React from "react";
import {
  Home,
  Users,
  Recycle,
  SlidersVertical,
  Calendar,
  Ticket,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavRecycling } from "@/components/nav-Recycling";
import { NavSecond } from "@/components/nav-Second";
import { NavSettings } from "@/components/nav-settings";
import { NavUser } from "@/components/nav-user";

import {
  Sidebar,
  SidebarGroup,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import { usePage } from "@inertiajs/react"; // Import usePage to access Inertia props

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = usePage().props; // Access the globally shared user data

  const currentPath = window.location.pathname;

  const markActive = (items) =>
    items.map((item) => ({
      ...item,
      isActive:
        currentPath === item.url ||
        item.items?.some((subItem) => currentPath === subItem.url),
      items: item.items ? markActive(item.items) : undefined,
    }));

  const data = {
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
    navSettings: [
      {
        title: "System Settings",
        url: "",
        icon: SlidersVertical,
        items: [
          {
            title: "General",
            url: "/settings/general/",
          },
          {
            title: "Staff Accounts",
            url: "/settings/staff/",
          },
          {
            title: "Categories",
            url: "/settings/categories/",
          },
          {
            title: "Items",
            url: "/settings/items/",
          },
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

  const updatedData = {
    navMain: markActive(data.navMain),
    navRecycling: markActive(data.navRecycling),
    navSecond: markActive(data.navSecond),
    navSettings: markActive(data.navSettings),
  };

  return (
    <Sidebar collapsible="icon" {...props}>
<SidebarHeader>
  <div className="p-4">
    <img
      src="/images/logos/logo.png"
      alt="Website Logo"
      className="w-40 h-auto mx-auto"
    />
  </div>
</SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <NavMain items={updatedData.navMain} />
          <NavRecycling items={updatedData.navRecycling} />
          <NavSecond items={updatedData.navSecond} />
          <NavSettings items={updatedData.navSettings} />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} /> {/* Pass the user data dynamically */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
