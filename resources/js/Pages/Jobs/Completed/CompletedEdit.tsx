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
import { Save, ArrowLeft, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
    // Add these fields for the main address
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
  addresses: {
    id: number;
    address: string;
    town_city: string;
    county: string;
    postcode: string;
  }[];
  collection_types: string[];
  sanitisation_options: string[];
  status_options: string[];
  staff_members: {
    id: number;
    name: string;
  }[];
}

// Move this import to the top with other imports
import { router } from "@inertiajs/react";

// Then update the handleDeleteJob function
export default function CollectionsEdit({ job, customers, addresses, collection_types, sanitisation_options, status_options, staff_members }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDeleteJob = async () => {
    try {
      setIsDeleting(true);
      router.delete(`/collections/${job.id}`, {
        onSuccess: () => {
          toast.success("Job successfully deleted!");
          window.location.href = "/collections";
        },
        onError: () => {
          toast.error("Failed to delete job. Please try again.");
        },
        onFinish: () => {
          setIsDeleting(false);
        },
      });
    } catch (error) {
      toast.error("Failed to delete job. Please try again.");
      setIsDeleting(false);
    }
  };

  const [formData, setFormData] = useState({
    job_id: job.job_id || "",
    client_id: job.client_id?.toString() || "",
    collection_date: job.collection_date ? new Date(job.collection_date).toISOString().split('T')[0] : "",
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

  // Add handleStaffSelect function
  const handleStaffSelect = (value: string) => {
    if (value === "manual") {
      setFormData(prev => ({
        ...prev,
        staff_collecting: "",
      }));
      return;
    }
  
    const selectedStaff = staff_members.find(staff => staff.id.toString() === value);
    if (selectedStaff) {
      setFormData(prev => ({
        ...prev,
        staff_collecting: selectedStaff.name,
      }));
    }
  };

  // Update handleAddressSelect function
  const handleAddressSelect = (addressId: string) => {
    if (addressId === "manual") {
      setFormData(prev => ({
        ...prev,
        address: "",
        town_city: "",
        county: "",
        postcode: "",
      }));
      return;
    }
  
    if (addressId === "main") {
      if (currentCustomer) {
        setFormData(prev => ({
          ...prev,
          address: currentCustomer.address || "",
          town_city: currentCustomer.town_city || "",
          county: currentCustomer.county || "",
          postcode: currentCustomer.postcode || "",
        }));
      }
      return;
    }
  
    const selectedAddress = addresses.find(addr => addr.id.toString() === addressId);
    if (selectedAddress) {
      setFormData(prev => ({
        ...prev,
        address: selectedAddress.address,
        town_city: selectedAddress.town_city,
        county: selectedAddress.county || "",
        postcode: selectedAddress.postcode,
      }));
    }
  };

  const handleSaveChanges = async () => {
    try {
        setIsSubmitting(true);
        const response = await axios.put(`/collections/${job.id}`, formData);
        if (response.status === 200) {
            toast.success("Changes saved successfully!");
        } else {
            toast.error("Failed to save changes. Please try again.");
        }
    } catch (error) {
        toast.error("An error occurred while saving changes.");
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
                onClick={() => (window.location.href = `/collections/${job.id}`)}
              >
                <ArrowLeft className="h-6 w-6" />
                Done Editing
              </Button>
              <Button
                className="bg-green-500 text-white hover:bg-green-600 focus:ring-2 focus:ring-green-400"
                onClick={handleSaveChanges}
                disabled={isSubmitting}
              >
                <Save className="h-6 w-6" />
                Save Changes
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className="bg-red-500 text-white hover:bg-red-600 focus:ring-2 focus:ring-red-400"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-6 w-6" />
                    Delete Job
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this job? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteJob}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column - Collection Details */}
            <section className="bg-white border shadow rounded-lg">
              <header className="p-6">
                <h2 className="text-lg font-semibold">Collection Details</h2>
              </header>
              <Separator />
              <div className="p-6 space-y-6">
                {/* Basic Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="job_id">Job Number*</Label>
                    <div className="col-span-2">
                      <Input
                        id="job_id"
                        name="job_id"
                        value={formData.job_id}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="client_id">Customer*</Label>
                    <div className="col-span-2">
                      <Select
                        value={formData.client_id}
                        onValueChange={(value) => handleSelectChange("client_id", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id.toString()}>
                              {customer.company_name || customer.name}
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
                </div>

                <Separator />

                {/* Staff Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="staff_select">Staff Collecting</Label>
                    <div className="col-span-2">
                      <Select onValueChange={handleStaffSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Enter Manually" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Enter Manually</SelectItem>
                          {staff_members.map((staff) => (
                            <SelectItem key={staff.id} value={staff.id.toString()}>
                              {staff.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="staff_collecting">Name</Label>
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
                </div>

                <Separator />

                {/* Address Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="collection_address">Collection Address</Label>
                    <div className="col-span-2">
                      <Select onValueChange={handleAddressSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Enter Manually" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Enter Manually</SelectItem>
                          {currentCustomer && currentCustomer.address && (
                            <SelectItem value="main">
                              {currentCustomer.address}, {currentCustomer.town_city}, {currentCustomer.postcode}
                            </SelectItem>
                          )}
                          {addresses.map((address) => (
                            <SelectItem key={address.id} value={address.id.toString()}>
                              {address.address}, {address.postcode}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

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
                    <Label htmlFor="town_city">Town/City*</Label>
                    <div className="col-span-2">
                      <Input
                        id="town_city"
                        name="town_city"
                        value={formData.town_city}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="county">County</Label>
                    <div className="col-span-2">
                      <Input
                        id="county"
                        name="county"
                        value={formData.county || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="postcode">Postcode*</Label>
                    <div className="col-span-2">
                      <Input
                        id="postcode"
                        name="postcode"
                        value={formData.postcode}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="onsite_contact">Onsite Contact</Label>
                    <div className="col-span-2">
                      <Input
                        id="onsite_contact"
                        name="onsite_contact"
                        value={formData.onsite_contact}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="onsite_number">Onsite Number</Label>
                    <div className="col-span-2">
                      <Input
                        id="onsite_number"
                        name="onsite_number"
                        value={formData.onsite_number}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="onsite_email">Onsite Email</Label>
                    <div className="col-span-2">
                      <Input
                        id="onsite_email"
                        name="onsite_email"
                        type="email"
                        value={formData.onsite_email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Collection Details */}
                <div className="space-y-4">
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
            </section>

            {/* Right Column - Customer Details */}
            <section className="bg-white border shadow rounded-lg self-start">
              <div className="flex items-center justify-between p-6">
                <h2 className="text-lg font-semibold">Customer Details</h2>
                <div className="text-sm">
                  Account Status: <span className="text-green-500">Active</span>
                </div>
              </div>
              <hr className="my-0" />
              <div className="p-6 space-y-6">
                {/* Basic Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Company Name</Label>
                    <div className="col-span-2">
                      <p>{currentCustomer?.company_name || currentCustomer?.name || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Address</Label>
                    <div className="col-span-2">
                      <p>{currentCustomer?.address || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Town/City</Label>
                    <div className="col-span-2">
                      <p>{currentCustomer?.town_city || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>County</Label>
                    <div className="col-span-2">
                      <p>{currentCustomer?.county || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Postcode</Label>
                    <div className="col-span-2">
                      <p>{currentCustomer?.postcode || '-'}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Contact Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Contact Name</Label>
                    <div className="col-span-2">
                      <p>{currentCustomer?.contact_name || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Position</Label>
                    <div className="col-span-2">
                      <p>{currentCustomer?.position || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Landline</Label>
                    <div className="col-span-2">
                      <p>{currentCustomer?.landline || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Mobile</Label>
                    <div className="col-span-2">
                      <p>{currentCustomer?.mobile || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Email</Label>
                    <div className="col-span-2">
                      <p>{currentCustomer?.email || '-'}</p>
                    </div>
                  </div>

                  <Separator />
                  <div>
                  <Label htmlFor="instructions">Job Instructions</Label>
                  <textarea
                    id="instructions"
                    name="instructions"
                    rows={6}
                    placeholder="Please enter any notes about this job here..."
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.instructions}
                    onChange={handleInputChange}
                  />
                </div>

                </div>
              </div>
            </section>

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}