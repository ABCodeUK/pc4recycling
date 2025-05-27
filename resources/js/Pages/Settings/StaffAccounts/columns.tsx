"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/Components/ui/button";

// Define the Staff type
// Update the Staff type to include driver_type
export type Staff = {
  id: number;
  name: string;
  email: string;
  mobile: string | null;
  role: string | null;
  active: boolean;
  driver_type: string | null;  // Add this line
};

// Add the new column after the role column
export const columns: ColumnDef<Staff>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div>{row.original.name}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div>{row.original.email}</div>,
  },
  {
    accessorKey: "mobile",
    header: "Mobile",
    cell: ({ row }) => <div>{row.original.mobile || "N/A"}</div>,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => <div>{row.original.role || "Unassigned"}</div>,
  },
  {
    accessorKey: "driver_type",
    header: "Type",
    cell: ({ row }) => (
      <div>
        {row.original.driver_type === 'external' ? 'External' : 'Internal'}
      </div>
    ),
  },
  {
    accessorKey: "active",
    header: "Status",
    cell: ({ row }) => (
      <div
        className={`font-semibold ${
          row.original.active ? "text-green-500" : "text-red-500"
        }`}
      >
        {row.original.active ? "Active" : "Disabled"}
      </div>
    ),
  },
];