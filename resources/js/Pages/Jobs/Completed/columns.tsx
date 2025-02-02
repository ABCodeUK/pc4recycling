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
}

export const columns: ColumnDef<Job>[] = [
  {
    accessorKey: "job_id",
    header: () => <span className="font-bold">ID</span>,
    cell: (info) => (
      <span className="text-primary">{String(info.getValue())}</span>
    ),
  },
  {
    accessorKey: "client.name",
    header: () => <span className="font-bold">Customer</span>,
    cell: (info) => info.row.original.client?.name || "N/A",
  },
  {
    accessorKey: "address",
    header: () => <span className="font-bold">Address</span>,
    cell: (info) => {
      const row = info.row.original;
      return `${row.town_city}, ${row.postcode}`;
    },
  },
  {
    accessorKey: "created_at",
    header: () => <span className="font-bold">Booked</span>,
    cell: (info) => {
      const date = info.getValue() as string;
      return date ? new Date(date).toLocaleDateString() : "N/A";
    },
  },
  {
    accessorKey: "collection_date",
    header: () => <span className="font-bold">Collection</span>,
    cell: (info) => {
      const date = info.getValue() as string;
      return date ? new Date(date).toLocaleDateString() : "Not Scheduled";
    },
  },
  {
    accessorKey: "items",
    header: () => <span className="font-bold">Items</span>,
    cell: () => "0",
  },
  {
    accessorKey: "staff_collecting",
    header: () => <span className="font-bold">Driver</span>,
    cell: (info) => (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4" />
        <span>{String(info.getValue())}</span>
      </div>
    ),
  },
  {
    accessorKey: "job_status",
    header: () => <span className="font-bold">Status</span>,
    cell: (info) => {
      const status = info.getValue() as string;
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

      return <Badge variant={variant as "destructive" | "warning" | "default" | "secondary" | "success" | "outline"}>{status}</Badge>;
    },
  }
];