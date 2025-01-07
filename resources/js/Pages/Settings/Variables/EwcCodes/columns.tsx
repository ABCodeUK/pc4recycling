"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export type EwcCode = {
  id: number;
  ewc_code: string;
  ea_description: string;
};

export const columns: ColumnDef<EwcCode>[] = [
  {
    accessorKey: "ewc_code",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        EW Code
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "ea_description",
    header: "EA Description",
  },
];
