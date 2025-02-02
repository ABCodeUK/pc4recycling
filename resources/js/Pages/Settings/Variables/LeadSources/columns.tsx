"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/Components/ui/button";

export type LeadSource = {
  ls_name: string;
  id: number;
};

export const columns: ColumnDef<LeadSource>[] = [
  {
    accessorKey: "ls_name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Lead Source Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
];