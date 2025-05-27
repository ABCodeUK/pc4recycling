import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/Components/ui/badge";
import { ArrowUpDown, Eye } from "lucide-react";
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
        href={`/collections/${row.original.id}`}
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
    cell: (info) => {
      const date = info.getValue() as string;
      return date ? new Date(date).toLocaleDateString() : "Not Scheduled";
    },
  },
  // Add or update the items column in the columns array
  {
    accessorKey: "items_count",
    header: () => <span className="font-bold">Items</span>,
    cell: ({ row }) => <div>{row.original.items_count || 0} items</div>,
  },
  {
    accessorKey: "staff_collecting",
    header: () => <span className="font-bold">Driver</span>,
    cell: (info) => (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4" />
        <span>{String(info.getValue()) || 'N/A'}</span>
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


export interface Ticket {
  id: number;
  ticket_number: string;
  subject: string;
  last_response: string;
  status: "Open" | "Closed" | "Awaiting Response" | "In Progress";
  created_at: string;
}

export const ticketColumns: ColumnDef<Ticket>[] = [
  {
    accessorKey: "ticket_number",
    header: ({ column }) => {
      return (
        <button
          className="flex items-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Ticket Number
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      )
    },
  },
  {
    accessorKey: "subject",
    header: ({ column }) => {
      return (
        <button
          className="flex items-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Subject
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      )
    },
  },
  {
    accessorKey: "last_response",
    header: ({ column }) => {
      return (
        <button
          className="flex items-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Response
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      )
    },
    cell: ({ row }) => {
      return new Date(row.getValue("last_response")).toLocaleDateString()
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      
      return (
        <Badge variant={
          status === "Open" ? "success" :
          status === "Closed" ? "secondary" :
          status === "Awaiting Response" ? "warning" :
          "default"
        }>
          {status}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const ticket = row.original;
      return (
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = `/support/view/`}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];