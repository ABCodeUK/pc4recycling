"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/Components/ui/button";

export type CollectionType = {
  id: number;
  colt_name: string;
  colt_description: string | null;
};

export const columns: ColumnDef<CollectionType>[] = [
  {
    accessorKey: "colt_name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Collection Type Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "colt_description",
    header: () => <span className="font-bold">Description</span>,
    cell: (info) => info.getValue() || "",
  },
];
