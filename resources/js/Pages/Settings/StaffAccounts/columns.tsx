"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

// Define the Staff type
export type Staff = {
  id: number;
  name: string;
  email: string;
  mobile: string | null;   // Optional field
  role: string | null;     // Role name (optional if no role is assigned)
  active: boolean;         // Active status (true or false)
};

// Define the columns for the staff table
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