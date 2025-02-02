"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Edit, Trash2, User } from "lucide-react";

export interface SubClient {
  id: number;
  name: string;
  email: string;
  landline: string | null;
  mobile: string | null;
  active: boolean;
  parent_id: number;
}

// Remove the actions column from the base columns definition
export const subClientColumns: ColumnDef<SubClient>[] = [
  {
    accessorKey: "name",
    header: () => <span className="font-bold">Name</span>,
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
  },
  {
    accessorKey: "email",
    header: () => <span className="font-bold">Email</span>,
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "landline",
    header: () => <span className="font-bold">Landline</span>,
    cell: (info) => info.getValue() || "Not provided",
  },
  {
    accessorKey: "mobile",
    header: () => <span className="font-bold">Mobile</span>,
    cell: (info) => info.getValue() || "Not provided",
  },
  {
    accessorKey: "active",
    header: () => <span className="font-bold">Status</span>,
    cell: ({ row }) => {
      const isActive = row.original.active;
      return (
        <Badge variant={isActive ? "success" : "destructive"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
];