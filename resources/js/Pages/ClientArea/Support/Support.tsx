import { useState } from "react";
import { AppSidebar } from "@/Components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/Components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb";
import { Separator } from "@/Components/ui/separator";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { DataTable } from "./data-table";
import { ticketColumns, Ticket } from "./columns";

// Dummy data
const dummyTickets: Ticket[] = [
  {
    id: 1,
    ticket_number: "TKT-001",
    subject: "Collection Query",
    last_response: "2024-01-15T10:30:00",
    status: "Open",
    created_at: "2024-01-15T10:00:00",
  },
  {
    id: 2,
    ticket_number: "TKT-002",
    subject: "Invoice Request",
    last_response: "2024-01-14T15:45:00",
    status: "Closed",
    created_at: "2024-01-14T09:00:00",
  },
  {
    id: 3,
    ticket_number: "TKT-003",
    subject: "Technical Support",
    last_response: "2024-01-16T11:20:00",
    status: "Awaiting Response",
    created_at: "2024-01-16T11:00:00",
  },
  {
    id: 4,
    ticket_number: "TKT-004",
    subject: "Data Sanitisation Question",
    last_response: "2024-01-17T14:30:00",
    status: "In Progress",
    created_at: "2024-01-17T14:00:00",
  },
];

export default function Support() {
  const [searchTerm, setSearchTerm] = useState("");
  const [data] = useState<Ticket[]>(dummyTickets);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 px-4 bg-white border-b">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4 mx-2" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/support">Support</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-8">
          <div className="text-3xl font-semibold text-gray-800">Support Tickets</div>
          <section className="bg-white border shadow rounded-lg p-6">
            <header className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold leading-7 text-gray-900">
                  Support Tickets
                </h2>
                <p className="text-sm text-muted-foreground">
                  View and manage your support tickets
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Button>Create New Ticket</Button>
              </div>
            </header>
            <Separator className="my-4" />
            <DataTable 
              columns={ticketColumns} 
              data={data.filter(ticket => 
                ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ticket.subject.toLowerCase().includes(searchTerm.toLowerCase())
              )} 
            />
          </section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}