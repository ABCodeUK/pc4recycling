"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

// Define the Client type
export type Client = {
  id: number;
  name: string;
  email: string;
  landline: string | null; // Optional field
  mobile: string | null;   // Optional field
};

// Define the columns for the client table
export const columns: ColumnDef<Client>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.original.name}</div>, // Optional: Custom render for the cell
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.original.email}</div>, // Optional: Custom render for the cell
  },
  {
    accessorKey: "landline",
    header: "Landline",
    cell: ({ row }) => <div>{row.original.landline || "N/A"}</div>, // Display "N/A" if null
  },
  {
    accessorKey: "mobile",
    header: "Mobile",
    cell: ({ row }) => <div>{row.original.mobile || "N/A"}</div>, // Display "N/A" if null
  },
];