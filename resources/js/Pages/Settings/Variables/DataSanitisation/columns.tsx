"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/Components/ui/button";

export type DataSanitisation = {
  id: number;
  ds_name: string;
};

export const columns: ColumnDef<DataSanitisation>[] = [
  {
    accessorKey: "ds_name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Data Sanitisation Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
];
