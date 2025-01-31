import { useState, useEffect } from "react";  // Add useEffect here
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

// Update the Props interface to include customers
interface Props {
  jobs: Job[];
  customers: { id: number; name: string }[];  // Add this line
  collection_types: string[];
  sanitisation_options: string[];
  status_options: string[];  // Add this line
  pagination: {
    total: number;
    currentPage: number;
    perPage: number;
  };
}

export default function Collections({ 
  jobs = [], 
  customers = [], 
  collection_types, 
  sanitisation_options, 
  status_options = [],
  pagination 
}: Props) {
  const [data, setData] = useState<Job[]>(jobs);
  // Add state for next job number
  const [nextJobId, setNextJobId] = useState("");

  // Fetch next job number when component mounts
  useEffect(() => {
    const fetchNextJobId = async () => {
      try {
        const response = await axios.get('/api/next-job-id');
        setNextJobId(response.data.next_job_id);
      } catch (error) {
        console.error('Failed to fetch next job ID:', error);
      }
    };
    fetchNextJobId();
  }, []);

  // Update addFormData state
  const [addFormData, setAddFormData] = useState({
    job_id: "",
    client_id: "",
    collection_date: "",
    job_status: "Needs Scheduling"  // Add default status
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

  // Add status dropdown in the dialog form
  <div>
    <Label htmlFor="job_status">Status*</Label>
    <Select
      value={addFormData.job_status}
      onValueChange={(value) => handleSelectChange("job_status", value)}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select Status" />
      </SelectTrigger>
      <SelectContent>
        {status_options.map((status) => (
          <SelectItem key={status} value={status}>
            {status}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {formErrors.job_status && (
      <p className="text-red-600 text-sm">{formErrors.job_status}</p>
    )}
  </div>

  // Update handleAddSubmit to handle different redirects
  const handleAddSubmit = async () => {
    resetFormErrors();
    
    // Validate required fields
    const errors = {};
    if (!addFormData.job_id && !nextJobId) errors['job_id'] = 'Job ID is required';
    if (!addFormData.client_id) errors['client_id'] = 'Customer is required';
    if (!addFormData.collection_date) errors['collection_date'] = 'Collection date is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = {
        job_id: addFormData.job_id || nextJobId,
        client_id: addFormData.client_id,
        collection_date: addFormData.collection_date,
        job_status: addFormData.job_status
      };

      const response = await axios.post("/collections", formData);
      if (response.data) {
        toast.success("Job created successfully!");
        // Always redirect to edit page after creation
        window.location.href = `/collections/${response.data.id}/edit`;
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
        const firstError = Object.values(error.response.data.errors)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
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
                <BreadcrumbLink href="/collections">Collections</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-8">
          <div className="text-3xl font-semibold text-gray-800">Jobs: Collections</div>
          <section className="bg-white border shadow rounded-lg p-6">
            <header className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold leading-7 text-gray-900">
                  Manage Collections
                </h2>
                <p className="text-sm text-muted-foreground">
                  View and manage collection jobs.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search Jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Create New Job</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-white">
                    <DialogHeader>
                      <DialogTitle>Create New Job</DialogTitle>
                      <DialogDescription>
                        Fill in the basic details for the new job. You can add more details after creation.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="job_id">Job Number*</Label>
                        <Input
                          id="job_id"
                          name="job_id"
                          value={addFormData.job_id || nextJobId}
                          onChange={(e) => handleInputChange(e)}
                        />
                        {formErrors.job_id && (
                          <p className="text-red-600 text-sm">{formErrors.job_id}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="client_id">Customer*</Label>
                        <Select
                          value={addFormData.client_id}
                          onValueChange={(value) => handleSelectChange("client_id", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Customer" />
                          </SelectTrigger>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id.toString()}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formErrors.client_id && (
                          <p className="text-red-600 text-sm">{formErrors.client_id}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="collection_date">Collection Date*</Label>
                        <Input
                          id="collection_date"
                          name="collection_date"
                          type="date"
                          value={addFormData.collection_date}
                          onChange={(e) => handleInputChange(e)}
                        />
                        {formErrors.collection_date && (
                          <p className="text-red-600 text-sm">{formErrors.collection_date}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="job_status">Status*</Label>
                        <Select
                          value={addFormData.job_status}
                          onValueChange={(value) => handleSelectChange("job_status", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                          <SelectContent>
                            {status_options.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formErrors.job_status && (
                          <p className="text-red-600 text-sm">{formErrors.job_status}</p>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create Job"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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