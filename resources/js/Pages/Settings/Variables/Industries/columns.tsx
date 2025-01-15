"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export type LeadSource = {
  id: number;
  in_name: string;
};

export const columns: ColumnDef<LeadSource>[] = [
  {
    accessorKey: "in_name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Industry Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
];