import { useState, useEffect } from "react";  // Add useEffect here
import { AppSidebar } from "@/Components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/Components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb";
import { Separator } from "@/Components/ui/separator";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
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
} from "@/Components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/Components/ui/select";
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
} from "@/Components/ui/alert-dialog";
import { Edit, Eye, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

// Update the Props interface to include customers
// Update the Props interface to match the expected types
interface Props {
  jobs: Job[];
  customers: { 
    id: number; 
    name: string;
    company_name?: string; 
  }[];
  collection_types: Array<{
    id: number;
    colt_name: string;
  }>;
  sanitisation_options: Array<{
    id: number;
    ds_name: string;
  }>;
  status_options: string[];
  pagination: {
    total: number;
    currentPage: number;
    perPage: number;
  };
}

export default function Collections({ jobs, customers, collection_types, sanitisation_options, status_options, }: Props) {
  // State declarations - keep only one instance of each
  const [data, setData] = useState<Job[]>(jobs);
  const [nextJobId, setNextJobId] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    job_id: '',
    client_id: '',
    collection_date: '',
    job_status: 'Needs Scheduling',
    staff_collecting: '',
    vehicle: '',
    address: '',
    town_city: '',
    postcode: '',
    onsite_contact: '',
    onsite_number: '',
    onsite_email: '',
    collection_type: '',
    data_sanitisation: '',
    sla: '',
    instructions: ''
  });

  // Keep only one useEffect for fetching next job ID
  useEffect(() => {
    const fetchNextJobId = async () => {
      try {
        const response = await axios.get('/collections/next-job-id');
        setNextJobId(response.data.next_job_id);
        setAddFormData(prev => ({
          ...prev,
          job_id: response.data.next_job_id
        }));
      } catch (error) {
        console.error('Failed to fetch next job ID:', error);
      }
    };
    fetchNextJobId();
  }, []);

  // Helper functions
  const resetFormErrors = () => setFormErrors({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setAddFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Update the handleAddSubmit function
  const handleAddSubmit = async () => {
      resetFormErrors();
      
      // Validate required fields
      const errors = {};
      if (!addFormData.job_id && !nextJobId) (errors as Record<string, string>)['job_id'] = 'Job ID is required';
      if (!addFormData.client_id) (errors as Record<string, string>)['client_id'] = 'Customer is required';
  
      if (Object.keys(errors).length > 0) {
          setFormErrors(errors);
          toast.error('Please fill in all required fields');
          return;
      }
  
      try {
          setIsSubmitting(true);
          const formattedData = {
              job_id: addFormData.job_id || nextJobId,
              client_id: parseInt(addFormData.client_id),
              collection_date: addFormData.collection_date || null,
              job_status: addFormData.job_status || "Needs Scheduling",
              staff_collecting: "",
              vehicle: "",
              address: "",
              town_city: "",
              postcode: "",
              onsite_contact: "",
              onsite_number: "",
              onsite_email: "",
              collection_type: null,
              data_sanitisation: "",
              sla: "",
              instructions: ""
          };
  
          const response = await axios.post('/collections', formattedData, {
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
              }
          });
  
          if (response.status === 201 || response.status === 200) {
              toast.success('Job created successfully');
              window.location.href = `/collections/${response.data.id}`;
          }
      } catch (error: any) {
          console.error('Create error:', error.response?.data || error);
          const errorMessage = error.response?.data?.message || "Failed to create job. Please try again.";
          toast.error(errorMessage);
      } finally {
          setIsSubmitting(false);
          setIsAddDialogOpen(false);
      }
  };

  const columnsWithActions = [
    ...columns,
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: any }) => {
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
                        {(formErrors as Record<string, string>).job_id && (
                          <p className="text-red-600 text-sm">{(formErrors as Record<string, string>).job_id}</p>
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
                        {(formErrors as Record<string, string>).client_id && (
                          <p className="text-red-600 text-sm">{(formErrors as Record<string, string>).client_id}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="collection_date">Collection Date (Optional)</Label>
                        <Input
                          id="collection_date"
                          name="collection_date"
                          type="date"
                          value={addFormData.collection_date}
                          onChange={(e) => handleInputChange(e)}
                        />
                        {(formErrors as Record<string, string>).collection_date && (
                          <p className="text-red-600 text-sm">{(formErrors as Record<string, string>).collection_date}</p>
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
                            {status_options
                              .filter(status => ['Needs Scheduling', 'Scheduled', 'Postponed'].includes(status))
                              .map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        {(formErrors as Record<string, string>).job_status && (
                          <p className="text-red-600 text-sm">{(formErrors as Record<string, string>).job_status}</p>
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