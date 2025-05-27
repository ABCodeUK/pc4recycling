import { useEffect, useState } from "react";
import { Separator } from "@/Components/ui/separator";
import { DataTable } from "./data-table";
import { clientJobColumns } from "./columns";
import { ClientJob } from "./columns";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label"; // Add this
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/Components/ui/dialog"; // Add these
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select"; // Add these
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/Components/ui/button";

export default function ClientJobs({ parentId }: { parentId: number }) {
  const [data, setData] = useState<ClientJob[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [nextJobId, setNextJobId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const initialStatuses = [
    'Needs Scheduling',
    'Scheduled',
    'Postponed'
  ];

  const [addFormData, setAddFormData] = useState({
    job_id: '',
    collection_date: '',
    job_status: 'Needs Scheduling'
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`/customers/${parentId}/jobs`);
        console.log('Fetched jobs:', response.data); // Add this debug line
        setData(response.data.jobs || response.data); // Handle both possible response formats
      } catch (error) {
        console.error('Error fetching jobs:', error); // Add error logging
        toast.error("Failed to fetch jobs.");
      }
    };

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

    if (parentId) {
      fetchJobs();
      fetchNextJobId();
    }
  }, [parentId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setAddFormData((prev) => ({ ...prev, job_status: value }));
  };

  const handleAddSubmit = async () => {
    try {
      setIsSubmitting(true);
      const formData = {
        job_id: addFormData.job_id || nextJobId,
        client_id: parentId,
        job_status: addFormData.job_status,
        collection_date: addFormData.collection_date || null  // Changed this line
      };

      const response = await axios.post("/collections", formData);
      
      if (response.data) {
        toast.success("Job created successfully!");
        window.location.href = `/collections/${response.data.id}/edit`;
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
        Object.values(error.response.data.errors).forEach((error: any) => {
          toast.error(error[0]);
        });
      } else {
        toast.error("Failed to create job.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredData = Array.isArray(data) ? data.filter(
    (item) =>
      item.job_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.address && item.address.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  return (
    <section className="bg-white border shadow rounded-lg">
      <header className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold">Manage Jobs</h3>
            <p className="text-sm text-muted-foreground">
              View and manage all jobs for this customer.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search Jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Dialog
              open={isAddDialogOpen}
              onOpenChange={setIsAddDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>Add New Job</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-white">
                <DialogHeader>
                  <DialogTitle>Create New Job</DialogTitle>
                  <DialogDescription>
                    Fill in the details for the new job below.
                  </DialogDescription>
                </DialogHeader>
                <div className="bg-white border rounded-lg p-6">
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="job_id">Job ID</Label>
                      <Input
                        id="job_id"
                        name="job_id"
                        value={addFormData.job_id || nextJobId}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="collection_date">Collection Date (Optional)</Label>
                      <Input
                        id="collection_date"
                        name="collection_date"
                        type="date"
                        value={addFormData.collection_date}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="job_status">Status</Label>
                      <Select
                        value={addFormData.job_status}
                        onValueChange={handleSelectChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {initialStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Create Job"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>
      <Separator />
      <div className="p-6">
        <DataTable columns={clientJobColumns} data={filteredData} />
      </div>
    </section>
  );
}