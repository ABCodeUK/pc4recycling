import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Job } from "./columns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Edit, Eye, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

interface Props {
  jobs: Job[];
  collection_types: string[];
  sanitisation_options: string[];
  pagination: {
    total: number;
    currentPage: number;
    perPage: number;
  };
}

export default function Processing({ jobs = [], collection_types, sanitisation_options, pagination }: Props) {
  const [data, setData] = useState<Job[]>(jobs);
  const [addFormData, setAddFormData] = useState({
    client_id: "",
    collection_date: "",
    job_status: "Needs Scheduling",
    staff_collecting: "",
    vehicle: "",
    address: "",
    town_city: "",
    postcode: "",
    onsite_contact: "",
    onsite_number: "",
    onsite_email: "",
    collection_type: "",
    data_sanitisation: "",
    sla: "",
    instructions: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const resetFormErrors = () => setFormErrors({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setAddFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async () => {
    resetFormErrors();
    try {
      setIsSubmitting(true);
      const response = await axios.post("/collections", addFormData);
      if (response.status === 200) {
        setData((prev) => [...prev, response.data]);
        toast.success("Job created successfully!");
        setIsAddDialogOpen(false);
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        toast.error("Failed to create job. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  const columnsWithActions = [
    ...columns,
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const job = row.original;
        return (
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = `/collections/${job.id}/`}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 px-4 bg-white border-b">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4 mx-2" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/processing">Processing</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-8">
          <div className="text-3xl font-semibold text-gray-800">Jobs: Processing</div>
          <section className="bg-white border shadow rounded-lg p-6">
            <header className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold leading-7 text-gray-900">
                  Manage Processing Jobs
                </h2>
                <p className="text-sm text-muted-foreground">
                  View and manage jobs in processing.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search Jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Button onClick={() => window.location.href = "/collections/create"}>
                  Create New Job
                </Button>
              </div>
            </header>
            <Separator className="my-4" />
            <DataTable 
              columns={columnsWithActions} 
              data={data.filter(job => 
                job.job_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.client?.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
              )} 
            />
          </section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}