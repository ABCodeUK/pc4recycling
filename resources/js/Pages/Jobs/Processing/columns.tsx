import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Edit, Trash2, User } from "lucide-react";
import { ArrowUpDown } from "lucide-react"; // Add this import
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
  items_count: number; // Add this property
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
      if (!date) return "Not Collected";
      
      const collectionDate = new Date(date);
      const today = new Date();
      
      // Only show days ago if the date is in the past
      if (collectionDate < today) {
        const diffTime = Math.abs(today.getTime() - collectionDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${collectionDate.toLocaleDateString()} (${diffDays} days ago)`;
      }
      
      return collectionDate.toLocaleDateString();
    },
  },
  {
    accessorKey: "processed_at",
    header: () => <span className="font-bold">Date Processed</span>,
    cell: () => "-",
  },
  // Update the items column in the columns array
  {
    accessorKey: "items",
    header: () => <span className="font-bold">Items</span>,
    cell: ({ row }) => `${row.original.items_count || 0} items`,
  },
  {
    accessorKey: "staff_collecting",
    header: () => <span className="font-bold">Staff</span>,
    cell: (info) => (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4" />
        <span>TBC</span>
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
  }
];