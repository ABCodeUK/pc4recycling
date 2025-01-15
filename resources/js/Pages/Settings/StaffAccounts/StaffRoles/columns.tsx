"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

// Define the StaffRole type
export type StaffRole = {
  id: number;
  name: string; // Role name
};

// Define the columns for the roles table
export const columns: ColumnDef<StaffRole>[] = [
  {
    accessorKey: "name", // Access the 'name' field
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Role Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
];