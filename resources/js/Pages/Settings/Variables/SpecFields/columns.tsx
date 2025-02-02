"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/Components/ui/button";

export type SpecField = {
  id: number;
  spec_name: string;
  spec_order: number;
  spec_default: boolean;
};

export const columns: ColumnDef<SpecField>[] = [
  {
    accessorKey: "spec_name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Spec Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "spec_order",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Order
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.original.spec_order}</div>
    ),
  },
  {
    accessorKey: "spec_default",
    header: "Default",
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.spec_default ? "Yes" : "No"}
      </div>
    ),
  },
];
