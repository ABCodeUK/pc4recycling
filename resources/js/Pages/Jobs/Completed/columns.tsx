import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Edit, Trash2, User } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/Components/ui/alert-dialog";
import { ArrowUpDown } from "lucide-react"; // Add this import

export interface Job {
  id: number;
  job_id: string;
  client: {
    id: number;
    name: string;
    company_name: string;
  };
  collection_date: string | null;
  job_status: string;
  staff_collecting: string | null;
  vehicle: string | null;
  address: string;
  town_city: string;
  postcode: string;
  onsite_contact: string | null;
  onsite_number: string | null;
  onsite_email: string | null;
  collection_type: string;
  data_sanitisation: string;
  sla: string | null;
  instructions: string | null;
  processed_at: string | null;
  completed_at: string | null;
  items_count: number;
  process_items_count: number;
  technician_signature_name: string | null;
}

export const columns: ColumnDef<Job>[] = [
  {
    accessorKey: "job_id",
    header: () => <span className="font-bold">ID</span>,
    cell: ({ row }) => (
      <a 
        href={`/completed/${row.original.id}`}
        className="text-primary font-medium"
      >
        {row.original.job_id}
      </a>
    ),
  },
  {
    accessorKey: "client.name",
    header: () => <span className="font-bold">Customer</span>,
    cell: (info) => info.row.original.client?.name || "N/A",
  },
  {
    accessorKey: "collection_date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center"
      >
        <span className="font-bold">Date Collected</span>
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: (info) => {
      const date = info.getValue() as string;
      return date ? new Date(date).toLocaleDateString() : "Not Collected";
    },
  },
  {
    accessorKey: "processed_at",
    header: () => <span className="font-bold">Processing Started</span>,
    cell: (info) => {
      const timestamp = info.getValue() as string;
      if (!timestamp) return null;
      
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-GB', { 
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      });
    },
  },
  {
    accessorKey: "completed_at",
    header: () => <span className="font-bold">Date Completed</span>,
    cell: (info) => {
      const timestamp = info.getValue() as string;
      if (!timestamp) return null;
      
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-GB', { 
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      });
    },
  },
  {
    accessorKey: "items",
    header: () => <span className="font-bold">Items</span>,
    cell: ({ row }) => `${row.original.process_items_count || 0} items`,
  },
  {
    accessorKey: "technician_signature_name",
    header: () => <span className="font-bold">Technician</span>,
    cell: (info) => {
      const technicianName = info.getValue() as string;
      return (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>{technicianName || 'TBC'}</span>
        </div>
      );
    },
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
  }
];