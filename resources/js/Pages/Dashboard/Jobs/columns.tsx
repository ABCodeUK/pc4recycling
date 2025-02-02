"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Eye, User } from "lucide-react";

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
    cell: ({ row }) => <div className="font-medium text-primary">{row.original.job_id}</div>,
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
    header: () => <span className="font-bold">Booked</span>,
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
    header: () => <span className="font-bold">Collection</span>,
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
    cell: ({ row }) => <div>{row.original.items_count}</div>,
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
      const status = row.original.job_status;
      const variant = {
        'Needs Scheduling': 'destructive',
        'Request Pending': 'warning',
        'Scheduled': 'default',
        'Postponed': 'secondary',
        'Collected': 'success',
        'Processing': 'default',
        'Complete': 'success',
        'Canceled': 'destructive',
      }[status] || 'default';

      return <Badge variant={variant as "default" | "destructive" | "outline" | "secondary" | "warning" | "success"}>{status}</Badge>;
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