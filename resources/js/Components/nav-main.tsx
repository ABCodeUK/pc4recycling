"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { Toaster } from "@/Components/ui/sonner"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/Components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/Components/ui/sidebar"

import React from 'react';
import { Role } from '@/Components/Auth/Can';
import { NavProps } from '@/types/navigation';

export function NavMain({ items }: NavProps) {
  return (
    <SidebarMenu>
      {items.map((item) => (
        item.roles ? (
          <Role key={item.title} role={item.roles}>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={item.isActive}>
                <a href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </Role>
        ) : (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild isActive={item.isActive}>
              <a href={item.url}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      ))}
      <Toaster />
    </SidebarMenu>
  );
}