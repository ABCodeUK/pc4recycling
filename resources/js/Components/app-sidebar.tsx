import * as React from "react";
import {
  Home,
  Users,
  Recycle,
  SlidersVertical,
  Calendar,
  Ticket,
  Wrench,
  FileUser,
  Leaf,
  ReceiptText,
  PoundSterling,
} from "lucide-react";

import { NavMain } from "@/Components/nav-main";
import { NavRecycling } from "@/Components/nav-recycling";
import { NavClient } from "@/Components/nav-client";
import { NavStaff } from "@/Components/nav-staff";
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

// Remove the local User interface and update usePage usage
import { useSidebar } from "@/Components/ui/sidebar";
import { useState, useEffect } from "react";
import { PrivacyPolicyDialog } from "@/Components/PrivacyPolicyDialog";

interface User {
  id: number;
  type: "Staff" | "Client";
  name: string;
  email: string;
  sustainability?: number;
  contract?: boolean;
  client_details?: {
    privacy_policy: string | null;
  };
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { collapsed } = useSidebar();
  const { user } = usePage<{
    auth: {
      user: User & {
        client_details?: {
          privacy_policy: string | null;
        };
      };
    }
  }>().props.auth;
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  useEffect(() => {
    if (user?.type === 'Client' && (!user.client_details?.privacy_policy || user.client_details.privacy_policy !== 'Accepted')) {
      setShowPrivacyPolicy(true);
    }
  }, [user]);

  const handlePrivacyPolicyAccept = () => {
    setShowPrivacyPolicy(false);
  };

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
    ],
    navClient: [
      // Only show Quotes if user contract is false
      ...(user.contract === false ? [
        {
          title: "Quotes",
          url: "/my-quotes/",
          icon: PoundSterling,
        }
      ] : []),
      {
        title: "Collections",
        url: "/my-collections/",
        icon: Recycle,
      },
      // Only show Sustainability if user has sustainability enabled
      ...(user.sustainability ? [
        {
          title: "Sustainability",
          url: "/sustainability/",
          icon: Leaf,
        }
      ] : []),
      {
        title: "Information",
        url: "/information/",
        icon: FileUser,
      },
      {
        title: "Support Tickets",
        url: "/support/",
        icon: Ticket,
      },

    ],
    navStaff: [
      {
        title: "Customers",
        url: "/customers/", // Fix typo from "/custoemrs/"
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
            title: "Quotes",
            url: "/quotes/",
          },
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
        title: "Contracts",
        url: "/contracts/",
        icon: ReceiptText,
      },
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
          {
            title: "Staff Accounts",
            url: "/settings/staff/",
          },
          {
            title: "Categories",
            url: "/settings/categories/",
          },
          {
            title: "Documents",
           url: "/settings/documents/",
          },
          {
            title: "Variables",
            url: "/settings/variables/",
          },
          {
            title: "Connections",
            url: "/settings/connections/",
          },
          {
            title: "Terms & Conditions",
            url: "/settings/terms/",
          },
        ],
      },
    ],
  };

  const updatedData: NavigationData = {
    navMain: markActive(data.navMain),
    navClient: markActive(data.navClient),
    navStaff: markActive(data.navStaff),
    navRecycling: markActive(data.navRecycling),
    navSecond: markActive(data.navSecond),
    navTools: markActive(data.navTools),
    navSettings: markActive(data.navSettings),
  };

  // In the return statement, update the order of navigation components
  return (
    <>
      <PrivacyPolicyDialog 
        open={showPrivacyPolicy} 
        onAccept={handlePrivacyPolicyAccept} 
      />
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <div className="p-2">
            <img
              src={collapsed ? "/images/logos/PC4-Icon-Colour.svg" : "/images/logos/PC4-Logo-Colour.svg"}
              alt="ITAM logo"
              className="w-auto h-12"
            />
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
              <NavMain items={updatedData.navMain} />
              <ClientOnly>
              <NavClient items={updatedData.navClient} />
              </ClientOnly>
              <Role role="Developer|Administrator|Employee|Manager|Director">
              <NavStaff items={updatedData.navStaff} />
              <NavRecycling items={updatedData.navRecycling} />
              <NavSecond items={updatedData.navSecond} />
              <NavTools items={updatedData.navTools} />
              <NavSettings items={updatedData.navSettings} />
            </Role>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={user} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </>
  );
}
