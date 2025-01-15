import { AppSidebar } from '@/components/app-sidebar';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import ChatGPTConnection from './ChatGPT/ChatGPT-Connection'; // ChatGPT Connection Card
import MySQLConnection from './MySQL/MySQL-Connection'; // MySQL Connection Card
import IceCatConnection from './IceCat/IceCat-Connection'; // IceCat Connection Card

export default function Connections() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Head title="Settings: Connections" />
        <header
          className="flex h-16 items-center gap-2 px-4 bg-white border-b"
          style={{
            borderBottomColor: 'hsl(var(--breadcrumb-border))',
          }}
        >
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4 mx-2" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/settings/connections" >
                  Connections
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-8">
          <div className="text-3xl font-semibold text-gray-800">Settings: Connections</div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start">
            {/* MySQL Connection */}
            <MySQLConnection />

            {/* ChatGPT Connection */}
            <ChatGPTConnection />

            {/* IceCat Connection */}
            <IceCatConnection />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}