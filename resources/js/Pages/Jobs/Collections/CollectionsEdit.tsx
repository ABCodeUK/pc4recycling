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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Save, ArrowLeft } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

// Update the Props interface to include more client details
interface Props {
  job: {
    id: number;
    job_id: string;
    client_id: number;
    collection_date: string;
    job_status: string;
    staff_collecting: string;
    vehicle: string;
    address: string;
    town_city: string;
    postcode: string;
    onsite_contact: string;
    onsite_number: string;
    onsite_email: string;
    collection_type: string;
    data_sanitisation: string;
    sla: string;
    instructions: string;
  };
  customers: { 
    id: number; 
    name: string;
    company_name?: string;
    address?: string;
    town_city?: string;
    county?: string;
    postcode?: string;
    contact_name?: string;
    position?: string;
    landline?: string;
    mobile?: string;
    email?: string;
    account_status?: string;
  }[];
  collection_types: string[];
  sanitisation_options: string[];
  status_options: string[];
}

export default function CollectionsEdit({ 
  job, 
  customers, 
  collection_types, 
  sanitisation_options,
  status_options 
}: Props) {
  const [formData, setFormData] = useState({
    job_id: job.job_id || "",
    client_id: job.client_id?.toString() || "",
    collection_date: job.collection_date || "",
    job_status: job.job_status || "",
    staff_collecting: job.staff_collecting || "",
    vehicle: job.vehicle || "",
    address: job.address || "",
    town_city: job.town_city || "",
    postcode: job.postcode || "",
    onsite_contact: job.onsite_contact || "",
    onsite_number: job.onsite_number || "",
    onsite_email: job.onsite_email || "",
    collection_type: job.collection_type || "",
    data_sanitisation: job.data_sanitisation || "",
    sla: job.sla || "",
    instructions: job.instructions || ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      setIsSubmitting(true);
      const response = await axios.put(`/collections/${job.id}`, formData);
      if (response.status === 200) {
        toast.success("Job updated successfully!");
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        toast.error("Failed to update job. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add this line to find the current customer
  const currentCustomer = customers.find(c => c.id.toString() === formData.client_id);

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
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Edit Job</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-8">
          <div className="flex justify-between items-center">
            <div className="text-3xl font-semibold text-gray-800">Collection: {job.job_id}</div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/collections")}
              >
                <ArrowLeft className="h-6 w-6" />
                Back to Collections
              </Button>
              <Button
                className="bg-green-500 text-white hover:bg-green-600 focus:ring-2 focus:ring-green-400"
                onClick={handleSaveChanges}
                disabled={isSubmitting}
              >
                <Save className="h-6 w-6" />
                Save Changes
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column - Collection Details */}
            <div className="bg-white border shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Collection Details</h2>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="job_id">Job Number*</Label>
                  <div className="col-span-2">
                    <Input
                      id="job_id"
                      name="job_id"
                      value={formData.job_id}
                      onChange={handleInputChange}
                      disabled
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="job_status">Status*</Label>
                  <div className="col-span-2">
                    <Select
                      value={formData.job_status}
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
                  </div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="collection_date">Collection Date*</Label>
                  <div className="col-span-2">
                    <Input
                      id="collection_date"
                      name="collection_date"
                      type="date"
                      value={formData.collection_date}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <Separator className="my-2" />

                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="staff_collecting">Staff Collecting</Label>
                  <div className="col-span-2">
                    <Input
                      id="staff_collecting"
                      name="staff_collecting"
                      value={formData.staff_collecting}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="vehicle">Vehicle</Label>
                  <div className="col-span-2">
                    <Input
                      id="vehicle"
                      name="vehicle"
                      value={formData.vehicle}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <Separator className="my-2" />

                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="address">Address*</Label>
                  <div className="col-span-2">
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="collection_type">Collection Type*</Label>
                  <div className="col-span-2">
                    <Select
                      value={formData.collection_type}
                      onValueChange={(value) => handleSelectChange("collection_type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Collection Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {collection_types.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="data_sanitisation">Data Sanitisation*</Label>
                  <div className="col-span-2">
                    <Select
                      value={formData.data_sanitisation}
                      onValueChange={(value) => handleSelectChange("data_sanitisation", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Sanitisation Option" />
                      </SelectTrigger>
                      <SelectContent>
                        {sanitisation_options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="sla">Service Level Agreement</Label>
                  <div className="col-span-2">
                    <Input
                      id="sla"
                      name="sla"
                      value={formData.sla}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Customer Details */}
            <div className="bg-white border shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Customer Details</h2>
                <span className="text-sm">Account Status: <span className="text-green-500">{currentCustomer?.account_status || 'Active'}</span></span>
              </div>
              <Separator className="mb-4" />
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Company Name</p>
                  <p className="text-base">{currentCustomer?.company_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-base">{currentCustomer?.address || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Town/City</p>
                  <p className="text-base">{currentCustomer?.town_city || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">County</p>
                  <p className="text-base">{currentCustomer?.county || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Postcode</p>
                  <p className="text-base">{currentCustomer?.postcode || '-'}</p>
                </div>
                <Separator className="my-4" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Contact Name</p>
                  <p className="text-base">{currentCustomer?.contact_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Position</p>
                  <p className="text-base">{currentCustomer?.position || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Landline</p>
                  <p className="text-base">{currentCustomer?.landline || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Mobile</p>
                  <p className="text-base">{currentCustomer?.mobile || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email Address</p>
                  <p className="text-base">{currentCustomer?.email || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details Section */}
          <div className="bg-white border shadow rounded-lg p-6">
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <Input
                  id="instructions"
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}