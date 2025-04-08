"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { Button } from "@/Components/ui/button";

export interface ClientJob {
  id: number;
  job_id: string;
  address: string;
  town_city: string;
  postcode: string;
  created_at: string;
  collection_date: string | null;
  job_status: string;
  items_count: number;
}

export const clientJobColumns: ColumnDef<ClientJob>[] = [
  {
    accessorKey: "job_id",
    header: () => <span className="font-bold">ID</span>,
    cell: ({ row }) => (
      <a 
        href={`/collections/${row.original.id}`}
        className="font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
      >
        {row.original.job_id}
      </a>
    ),
  },
  {
    accessorKey: "address",
    header: () => <span className="font-bold">Address</span>,
    cell: ({ row }) => (
      <div>{`${row.original.address}, ${row.original.town_city}, ${row.original.postcode}`}</div>
    ),
  },
  {
    accessorKey: "collection_date",
    header: () => <span className="font-bold">Collection Date</span>,
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
    accessorKey: "job_status",
    header: () => <span className="font-bold">Status</span>,
    cell: ({ row }) => {
      const status = row.getValue("job_status") as string;
      let color: string;

      switch (status) {
        case 'Needs Scheduling':
        case 'Request Pending':
          color = 'bg-blue-100 text-blue-800 border-blue-200';
          break;
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