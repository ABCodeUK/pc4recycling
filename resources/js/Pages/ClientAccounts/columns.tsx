"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

// Define the Client type
export type Client = {
  id: number;
  name: string;
  email: string;
  landline?: string | null;
  mobile?: string | null;
  contact_name?: string | null;
  town_city?: string | null;
  customer_type?: string | null; // Specific customer type field
  active: boolean;
  total_jobs: number;
  jobs_count: number; // Change from total_jobs to jobs_count to match backend
};

// Define the columns for the client table
export const columns: ColumnDef<Client>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Company Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.original.name}</div>,
  },
  {
    accessorKey: "contact_name",
    header: "Contact Name",
    cell: ({ row }) => <div>{row.original.contact_name || "N/A"}</div>,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <div>
        <div>
          {row.original.landline
            ? `Landline: ${row.original.landline}`
            : "Landline: N/A"}
        </div>
        <div>
          {row.original.mobile
            ? `Mobile: ${row.original.mobile}`
            : "Mobile: N/A"}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div>{row.original.email}</div>,
  },
  {
    accessorKey: "customer_type",
    header: "Customer Type",
    cell: ({ row }) => <div>{row.original.customer_type || "N/A"}</div>,
  },
  {
    accessorKey: "town_city",
    header: "City",
    cell: ({ row }) => <div>{row.original.town_city || "N/A"}</div>,
  },
  {
    accessorKey: "active",
    header: "Status",
    cell: ({ row }) => (
      <div className={row.original.active ? "text-green-600" : "text-red-600"}>
        {row.original.active ? "Active" : "Disabled"}
      </div>
    ),
  },
  {
    accessorKey: "jobs_count",
    header: "Total Jobs",
    cell: ({ row }) => <div>{row.original.jobs_count}</div>, // Use jobs_count instead of hardcoded 0
  },
];