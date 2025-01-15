"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export type CustomerType = {
  id: number;
  ct_name: string;
};

export const columns: ColumnDef<CustomerType>[] = [
  {
    accessorKey: "ct_name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Customer Type Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
];