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
  job_quote: string | null;
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
  address_2: string;
  town_city: string;
  postcode: string;
  onsite_contact: string | null;
  onsite_number: string | null;
  onsite_email: string | null;
  collection_type: string;
  data_sanitisation: string;
  sla: string | null;
  instructions: string | null;
  items_count: number; // Add this property
}

export const columns: ColumnDef<Job>[] = [
  {
    accessorKey: "job_id",
    header: () => <span className="font-bold">ID</span>,
    cell: ({ row }) => (
      <a 
        href={`/quotes/${row.original.id}`}
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
    accessorKey: "address",
    header: () => <span className="font-bold">Address</span>,
    cell: (info) => {
      const row = info.row.original;
      return `${row.town_city}, ${row.postcode}`;
    },
  },
  {
    accessorKey: "created_at",
    header: () => <span className="font-bold">Date Created</span>,
    cell: (info) => {
      const date = info.getValue() as string;
      return date ? new Date(date).toLocaleDateString() : "N/A";
    },
  },
  {
    accessorKey: "items_count",
    header: () => <span className="font-bold">Items</span>,
    cell: ({ row }) => <div>{row.original.items_count || 0} items</div>,
  },
  {
    accessorKey: "job_quote",
    header: () => <span className="font-bold">Quote</span>,
    cell: (info) => info.row.original.job_quote ? `£${info.row.original.job_quote} +VAT` : "TBC",
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