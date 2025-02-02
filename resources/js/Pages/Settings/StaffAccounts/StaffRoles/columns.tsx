"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/Components/ui/button";

// Define the StaffRole type
export type StaffRole = {
  id: number;
  name: string; // Role name
  userCount: number | null; // Number of users assigned to the role, can be null
};

// Define the columns for the roles table
export const columns: ColumnDef<StaffRole>[] = [
  {
    accessorKey: "name", // Access the 'name' field
    header: "Name",
  },
  {
    accessorKey: "userCount", // Access the 'userCount' field
    header: "User Count",
    cell: ({ row }) => (
      <div>{row.original.userCount ?? 0}</div> // Show 0 if userCount is null or undefined
    ),
  }
];