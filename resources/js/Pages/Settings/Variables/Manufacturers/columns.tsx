"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export type Manufacturer = {
  id: number;
  manufacturer_name: string;
  manufacturer_logo: string | null; // Nullable to handle cases where the logo is not uploaded
  manufacturer_url: string | null; // Nullable to handle cases where the URL is not provided
};

export const columns: ColumnDef<Manufacturer>[] = [
  {
    accessorKey: "manufacturer_logo",
    header: "Logo",
    cell: ({ row }) => (
      <img
        src={row.original.manufacturer_logo || "/placeholder-logo.png"}
        alt={row.original.manufacturer_name}
        className="h-8 w-8 object-contain rounded-full"
      />
    ),
  },
  {
    accessorKey: "manufacturer_name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Manufacturer
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  ];
