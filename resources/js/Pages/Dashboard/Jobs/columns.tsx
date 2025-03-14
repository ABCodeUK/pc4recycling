"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Eye, User } from "lucide-react";
import { ArrowUpDown } from "lucide-react"; // Add this import

export interface ClientJob {
  id: number;
  job_id: string;
  address: string;
  town_city: string;
  postcode: string;
  created_at: string;
  collection_date: string | null;
  staff_collecting: string | null;
  job_status: string;
  items_count: number;
  client: {
    name: string;
  };
}

export const clientJobColumns: ColumnDef<ClientJob>[] = [
  {
    accessorKey: "job_id",
    header: () => <span className="font-bold">ID</span>,
    cell: ({ row }) => (
      <a 
        href={`/collections/${row.original.id}`}
        className="font-medium text-primary hover:text-primary/80 transition-colors"
      >
        {row.original.job_id}
      </a>
    ),
  },
  {
    accessorKey: "client.name",
    header: () => <span className="font-bold">Customer</span>,
    cell: ({ row }) => <div>{row.original.client?.name || "N/A"}</div>,
  },
  {
    accessorKey: "address",
    header: () => <span className="font-bold">Address</span>,
    cell: ({ row }) => (
      <div>{`${row.original.address}, ${row.original.town_city}, ${row.original.postcode}`}</div>
    ),
  },
  {
    accessorKey: "created_at",
    header: () => <span className="font-bold">Date Created</span>,
    cell: ({ row }) => (
      <div>
        {row.original.created_at
          ? new Date(row.original.created_at).toLocaleDateString()
          : "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "collection_date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center"
      >
        <span className="font-bold">Collection Date</span>
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div>
        {row.original.collection_date
          ? new Date(row.original.collection_date).toLocaleDateString()
          : "Not Scheduled"}
      </div>
    ),
  },
  {
    accessorKey: "items_count",
    header: () => <span className="font-bold">Items</span>,
    cell: ({ row }) => <div>{row.original.items_count || 0} items</div>,
  },
  {
    accessorKey: "staff_collecting",
    header: () => <span className="font-bold">Driver</span>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4" />
        <span>{row.original.staff_collecting || "Not Assigned"}</span>
      </div>
    ),
  },
  {
    accessorKey: "job_status",
    header: () => <span className="font-bold">Status</span>,
    cell: ({ row }) => {
      const status = row.getValue("job_status") as string;
      let color: string;

      switch (status) {
        case 'Scheduled':
          color = 'bg-orange-100 text-orange-800 border-orange-200';
          break;
        case 'Postponed':
        case 'Cancelled':
          color = 'bg-red-100 text-red-800 border-red-200';
          break;
        case 'Collected':
        case 'Processing':
        case 'Complete':
          color = 'bg-green-100 text-green-800 border-green-200';
          break;
        default:
          color = 'bg-gray-100 text-gray-800 border-gray-200';
      }

      return (
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
          {status}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right font-bold">Actions</div>,
    cell: ({ row }) => {
      const job = row.original;
      return (
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = `/collections/${job.id}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];